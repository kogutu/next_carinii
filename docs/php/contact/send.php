<?php
/**
 * POST /directseo/nextjs/contact/send.php   (Next.js, X-Api-Token)
 *
 * Body: { name, email, phone?, subject, message, orderNumber?, marketing?, clientIp? }
 *
 * Co robi:
 *  1. Waliduje dane i ogranicza liczbę wiadomości z jednego adresu IP i e-maila.
 *  2. Zapisuje wiadomość w tabeli carinii_contact_messages (baza Magento) — kopia na wypadek problemów z pocztą.
 *  3. Wysyła e-mail do sklepu (nagłówek Reply-To = klientka, więc "Odpowiedz" trafia do niej)
 *     i krótkie potwierdzenie do klientki.
 *
 * Zgodny z PHP 7.0. Poczta idzie przez transport modułu SMTP Pro (jak maile Magento), a gdy go brak — domyślną funkcją mail.
 */

require_once __DIR__ . '/../returns/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

const CONTACT_TABLE = 'carinii_contact_messages';
const CONTACT_SUBJECTS = array(
    'zamówienie' => 'Pytanie o zamówienie',
    'produkt' => 'Pytanie o produkt',
    'zwrot' => 'Zwrot / reklamacja',
    'współpraca' => 'Współpraca',
    'inne' => 'Inne',
);
const CONTACT_MAX_PER_WINDOW = 5;       // wiadomości z jednego IP / e-maila w oknie 15 minut

function contactH($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function contactEnsureTable()
{
    returnsDb()->query(
        'CREATE TABLE IF NOT EXISTS ' . CONTACT_TABLE . ' (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            created_at DATETIME NOT NULL,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(32) NULL,
            subject VARCHAR(40) NOT NULL,
            order_number VARCHAR(40) NULL,
            message TEXT NOT NULL,
            marketing TINYINT(1) NOT NULL DEFAULT 0,
            ip VARCHAR(45) NULL,
            mail_sent TINYINT(1) NOT NULL DEFAULT 0,
            KEY idx_email (email),
            KEY idx_created (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4'
    );
}

/** Wysyła HTML przez transport SMTP Pro (jeśli włączony), z opcjonalnym Reply-To. */
function contactSendMail($toEmail, $toName, $subject, $html, $replyEmail = '', $replyName = '')
{
    try {
        $fromEmail = Mage::getStoreConfig('trans_email/ident_general/email');
        $mail = new Zend_Mail('utf-8');
        $mail->setBodyHtml($html)
            ->setFrom($fromEmail, 'Carinii')
            ->addTo($toEmail, $toName)
            ->setSubject($subject);
        if ($replyEmail !== '') {
            $mail->setReplyTo($replyEmail, $replyName);
        }

        $transport = null;
        $helper = Mage::helper('smtppro');
        if ($helper && $helper->isEnabled()) {
            $transport = $helper->getTransport(null);
        }
        if ($transport) {
            $mail->send($transport);
        } else {
            $mail->send();
        }
        return true;
    } catch (Exception $e) {
        error_log('contact mail failed: ' . $e->getMessage());
        return false;
    }
}

$input = returnsInput();
$clientIp = returnsClientIp($input);

$name = trim((string) (isset($input['name']) ? $input['name'] : ''));
$email = strtolower(trim((string) (isset($input['email']) ? $input['email'] : '')));
$phone = preg_replace('/\D+/', '', (string) (isset($input['phone']) ? $input['phone'] : ''));
$subjectKey = (string) (isset($input['subject']) ? $input['subject'] : '');
$message = trim((string) (isset($input['message']) ? $input['message'] : ''));
$orderNumber = trim((string) (isset($input['orderNumber']) ? $input['orderNumber'] : ''));
$marketing = !empty($input['marketing']) ? 1 : 0;

if ($name === '' || mb_strlen($name, 'UTF-8') > 120) {
    returnsFail(422, 'Podaj imię i nazwisko', 'name');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
    returnsFail(422, 'Podaj poprawny adres e-mail', 'email');
}
if ($phone !== '' && (strlen($phone) < 9 || strlen($phone) > 15)) {
    returnsFail(422, 'Numer telefonu powinien mieć od 9 do 15 cyfr', 'phone');
}
if (!isset(CONTACT_SUBJECTS[$subjectKey])) {
    returnsFail(422, 'Wybierz temat wiadomości', 'subject');
}
$messageLength = mb_strlen($message, 'UTF-8');
if ($messageLength < 10 || $messageLength > 3000) {
    returnsFail(422, 'Wiadomość powinna mieć od 10 do 3000 znaków', 'message');
}
if (strlen($orderNumber) > 40) {
    $orderNumber = substr($orderNumber, 0, 40);
}

// ograniczenie liczby wiadomości (IP i e-mail liczone osobno)
$throttleKeys = array('contact-email:' . $email);
if ($clientIp !== '') {
    $throttleKeys[] = 'contact-ip:' . $clientIp;
}
foreach ($throttleKeys as $key) {
    if (count(returnsFailures($key)) >= CONTACT_MAX_PER_WINDOW) {
        returnsFail(429, 'Wysłano zbyt wiele wiadomości. Spróbuj ponownie za kilkanaście minut lub napisz na sklep@carinii.com.pl.', 'throttled');
    }
}
foreach ($throttleKeys as $key) {
    returnsRecordFailure($key);
}

contactEnsureTable();
$db = returnsDb();
$db->insert(CONTACT_TABLE, array(
    'created_at' => gmdate('Y-m-d H:i:s'),
    'name' => $name,
    'email' => $email,
    'phone' => $phone !== '' ? $phone : null,
    'subject' => $subjectKey,
    'order_number' => $orderNumber !== '' ? $orderNumber : null,
    'message' => $message,
    'marketing' => $marketing,
    'ip' => $clientIp !== '' ? $clientIp : null,
    'mail_sent' => 0,
));
$messageId = (int) $db->lastInsertId();

$config = returnsConfig();
$shopEmail = !empty($config['contact_notify_email'])
    ? $config['contact_notify_email']
    : (!empty($config['returns_notify_email']) ? $config['returns_notify_email'] : Mage::getStoreConfig('trans_email/ident_general/email'));
$subjectLabel = CONTACT_SUBJECTS[$subjectKey];

$rows = array(
    'Imię i nazwisko' => $name,
    'E-mail' => $email,
    'Telefon' => $phone !== '' ? $phone : '—',
    'Temat' => $subjectLabel,
);
if ($orderNumber !== '') {
    $rows['Numer zamówienia'] = $orderNumber;
}
$rows['Zgoda marketingowa'] = $marketing ? 'tak' : 'nie';

$tableHtml = '';
foreach ($rows as $label => $value) {
    $tableHtml .= '<tr><td style="padding:4px 12px 4px 0;color:#666">' . contactH($label) . '</td><td style="padding:4px 0"><strong>' . contactH($value) . '</strong></td></tr>';
}

$shopHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">'
    . '<h2 style="margin:0 0 12px">Nowa wiadomość z formularza kontaktowego #' . $messageId . '</h2>'
    . '<table style="border-collapse:collapse">' . $tableHtml . '</table>'
    . '<p style="margin:16px 0 4px;color:#666">Treść:</p>'
    . '<div style="white-space:pre-wrap;border-left:3px solid #ddd;padding:6px 12px">' . contactH($message) . '</div>'
    . '<p style="margin-top:16px;color:#888;font-size:12px">Odpowiedz na tego maila — odpowiedź trafi bezpośrednio do klientki.</p>'
    . '</div>';

$sent = contactSendMail($shopEmail, 'Carinii', '[Kontakt] ' . $subjectLabel . ' — ' . $name, $shopHtml, $email, $name);

// Wiadomość zostaje w bazie (mail_sent = 0), ale klientka musi wiedzieć, że do sklepu nie dotarła
if (!$sent) {
    returnsFail(502, 'Nie udało się wysłać wiadomości. Napisz do nas na sklep@carinii.com.pl lub zadzwoń.', 'mail_failed');
}

$db->update(CONTACT_TABLE, array('mail_sent' => 1), 'id = ' . $messageId);

$customerHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">'
    . '<p>Dzień dobry' . ($name !== '' ? ', ' . contactH(strtok($name, ' ')) : '') . '!</p>'
    . '<p>Dziękujemy za wiadomość — otrzymaliśmy ją i odpowiemy najszybciej, jak to możliwe, zwykle w ciągu jednego dnia roboczego.</p>'
    . '<p style="margin:16px 0 4px;color:#666">Twoja wiadomość:</p>'
    . '<div style="white-space:pre-wrap;border-left:3px solid #ddd;padding:6px 12px">' . contactH($message) . '</div>'
    . '<p style="margin-top:16px">Pozdrawiamy,<br>Zespół Carinii</p>'
    . '</div>';
contactSendMail($email, $name, 'Otrzymaliśmy Twoją wiadomość', $customerHtml);

returnsRespond(200, array(
    'success' => true,
    'message' => 'Dziękujemy! Wiadomość została wysłana.',
    'data' => array('id' => $messageId),
));
