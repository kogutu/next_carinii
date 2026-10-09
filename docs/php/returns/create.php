<?php
/**
 * POST /directseo/nextjs/returns/create.php   (Next.js, X-Api-Token)
 *
 * Body: { orderNumber, email, customerId?, clientIp?, type ("zwrot"|"reklamacja"),
 *         items: [{ itemId, qty }], reason, resolution, description, bankAccount?, photos: [token...] }
 *
 * Co robi:
 *  1. Weryfikuje zamówienie (numer + e-mail albo właściciel konta), pozycje i ilości.
 *  2. Zapisuje zgłoszenie w tabeli carinii_returns (baza Magento).
 *  3. Przenosi zdjęcia z katalogu tymczasowego do media/returns/<ref>/ (adresy URL trafiają do wpisu poniżej).
 *  4. Dopisuje wpis w historii zamówienia w Magento (widoczny w panelu admina; status zamówienia się nie zmienia).
 *  5. Wysyła e-mail do sklepu (ze zdjęciami) i potwierdzenie do klienta.
 */

require_once __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

function returnsSendMail($toEmail, $toName, $subject, $html)
{
    try {
        $mail = Mage::getModel('core/email');
        $mail->setToName($toName)
            ->setToEmail($toEmail)
            ->setBody($html)
            ->setSubject($subject)
            ->setFromEmail(Mage::getStoreConfig('trans_email/ident_general/email'))
            ->setFromName('Carinii')
            ->setType('html');
        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log('returns mail failed: ' . $e->getMessage());
        return false;
    }
}

function h($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$input = returnsInput();
$clientIp = returnsClientIp($input);
$customerId = isset($input['customerId']) ? (int) $input['customerId'] : 0;

$order = returnsFindOrder(
    isset($input['orderNumber']) ? $input['orderNumber'] : '',
    isset($input['email']) ? $input['email'] : '',
    $customerId,
    $clientIp
);

$eligibility = returnsEligibility($order);
if (!$eligibility['allowed']) {
    returnsFail(422, $eligibility['reason'], 'not_eligible');
}

// ---------- walidacja formularza ----------
$type = isset($input['type']) ? (string) $input['type'] : '';
if ($type !== 'zwrot' && $type !== 'reklamacja') {
    returnsFail(400, 'Wybierz, czy zgłaszasz zwrot, czy reklamację');
}

$reasonLabel = returnsReason($type, isset($input['reason']) ? (string) $input['reason'] : '');
if ($reasonLabel === null) {
    returnsFail(400, 'Wybierz powód zgłoszenia');
}
$resolutionLabel = returnsResolution($type, isset($input['resolution']) ? (string) $input['resolution'] : '');
if ($resolutionLabel === null) {
    returnsFail(400, 'Wybierz preferowane rozwiązanie');
}

$description = isset($input['description']) ? trim(strip_tags((string) $input['description'])) : '';
if (mb_strlen($description) > 3000) {
    returnsFail(400, 'Opis jest za długi (maksymalnie 3000 znaków)');
}
if ($type === 'reklamacja' && mb_strlen($description) < 10) {
    returnsFail(400, 'Opisz wadę produktu (co najmniej 10 znaków)');
}

$bankAccount = isset($input['bankAccount']) ? preg_replace('/\s+/', '', (string) $input['bankAccount']) : '';
if ($bankAccount !== '' && !preg_match('/^(PL)?\d{26}$/i', $bankAccount)) {
    returnsFail(400, 'Numer konta powinien mieć 26 cyfr (format polski)');
}

$requestedItems = isset($input['items']) && is_array($input['items']) ? $input['items'] : array();
if (!$requestedItems) {
    returnsFail(400, 'Wybierz co najmniej jeden produkt');
}

$orderItems = array();
foreach (returnsOrderItems($order) as $item) {
    $orderItems[$item['itemId']] = $item;
}

$items = array();
foreach ($requestedItems as $requested) {
    $itemId = isset($requested['itemId']) ? (int) $requested['itemId'] : 0;
    $qty = isset($requested['qty']) ? (int) $requested['qty'] : 0;

    if (!isset($orderItems[$itemId])) {
        returnsFail(400, 'Wybrany produkt nie należy do tego zamówienia');
    }
    if ($qty < 1 || $qty > $orderItems[$itemId]['qtyAvailable']) {
        returnsFail(422, 'Dla produktu „' . $orderItems[$itemId]['name'] . '” można zgłosić maksymalnie ' . $orderItems[$itemId]['qtyAvailable'] . ' szt.', 'qty');
    }
    $items[$itemId] = array(
        'itemId' => $itemId,
        'name' => $orderItems[$itemId]['name'],
        'sku' => $orderItems[$itemId]['sku'],
        'size' => $orderItems[$itemId]['size'],
        'qty' => $qty,
    );
}
$items = array_values($items);

$photoTokens = isset($input['photos']) && is_array($input['photos']) ? array_values(array_unique($input['photos'])) : array();
if (count($photoTokens) > RETURNS_MAX_PHOTOS) {
    returnsFail(400, 'Możesz dodać maksymalnie ' . RETURNS_MAX_PHOTOS . ' zdjęć');
}
foreach ($photoTokens as $token) {
    if (!is_string($token) || !preg_match('/^[a-f0-9]{32}$/', $token) || !is_file(RETURNS_STAGING_DIR . '/' . $token . '.jpg')) {
        returnsFail(400, 'Jedno ze zdjęć wygasło. Dodaj je ponownie.', 'photo');
    }
}

returnsEnsureTable();
$db = returnsDb();

$existingCount = (int) $db->fetchOne('SELECT COUNT(*) FROM ' . RETURNS_TABLE . ' WHERE order_id = ?', array((int) $order->getId()));
if ($existingCount >= 6) {
    returnsFail(429, 'Dla tego zamówienia złożono już wiele zgłoszeń. Napisz do nas: sklep@carinii.com.pl.', 'too_many');
}

// ---------- zapis ----------
$days = returnsDaysSinceReceived($order);
$outOfWindow = $type === 'zwrot' && $days > RETURNS_WINDOW_DAYS;

$ref = null;
for ($attempt = 0; $attempt < 5 && $ref === null; $attempt++) {
    $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $suffix = '';
    for ($i = 0; $i < 5; $i++) {
        $suffix .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    $candidate = ($type === 'zwrot' ? 'ZW' : 'RK') . '-' . date('ymd') . '-' . $suffix;
    $exists = (int) $db->fetchOne('SELECT COUNT(*) FROM ' . RETURNS_TABLE . ' WHERE ref = ?', array($candidate));
    if (!$exists) {
        $ref = $candidate;
    }
}
if ($ref === null) {
    returnsFail(500, 'Nie udało się nadać numeru zgłoszenia. Spróbuj ponownie.');
}

// zdjęcia: katalog tymczasowy -> media/returns/<ref>/
$photoUrls = array();
if ($photoTokens) {
    $dir = Mage::getBaseDir('media') . '/returns/' . $ref;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        returnsFail(500, 'Nie udało się zapisać zdjęć. Spróbuj ponownie.');
    }
    foreach ($photoTokens as $token) {
        if (@rename(RETURNS_STAGING_DIR . '/' . $token . '.jpg', $dir . '/' . $token . '.jpg')) {
            @chmod($dir . '/' . $token . '.jpg', 0644);
            $photoUrls[] = Mage::getBaseUrl('media') . 'returns/' . $ref . '/' . $token . '.jpg';
        }
    }
}

$db->insert(RETURNS_TABLE, array(
    'ref' => $ref,
    'order_id' => (int) $order->getId(),
    'order_increment' => $order->getIncrementId(),
    'customer_id' => $order->getCustomerId() ? (int) $order->getCustomerId() : null,
    'email' => strtolower(trim($order->getCustomerEmail())),
    'type' => $type,
    'status' => 'new',
    'reason' => $reasonLabel,
    'resolution' => $resolutionLabel,
    'description' => $description,
    'bank_account' => $bankAccount,
    'out_of_window' => $outOfWindow ? 1 : 0,
    'items' => json_encode($items, JSON_UNESCAPED_UNICODE),
    'photos' => json_encode($photoUrls, JSON_UNESCAPED_UNICODE),
    'ip' => $clientIp,
    'created_at' => date('Y-m-d H:i:s'),
));

// ---------- wpis w historii zamówienia (Magento) ----------
$typeLabel = $type === 'zwrot' ? 'Zwrot' : 'Reklamacja';
$itemLines = array();
foreach ($items as $item) {
    $itemLines[] = $item['qty'] . ' x ' . $item['name'] . ($item['size'] !== '' ? ' (rozmiar ' . $item['size'] . ')' : '');
}
$comment = '[' . $ref . '] Zgłoszenie online: ' . $typeLabel . "\n"
    . 'Produkty: ' . implode('; ', $itemLines) . "\n"
    . 'Powód: ' . $reasonLabel . "\n"
    . 'Preferowane rozwiązanie: ' . $resolutionLabel
    . ($description !== '' ? "\nOpis: " . $description : '')
    . ($bankAccount !== '' ? "\nKonto do zwrotu: " . $bankAccount : '')
    . ($photoUrls ? "\nZdjęcia (" . count($photoUrls) . "): " . implode(' ', $photoUrls) : '')
    . ($outOfWindow ? "\nUWAGA: od odbioru minęło " . $days . ' dni (termin na zwrot to ' . RETURNS_WINDOW_DAYS . ' dni).' : '');

try {
    $history = $order->addStatusHistoryComment($comment);
    $history->setIsCustomerNotified(0);
    $history->save();
} catch (Exception $e) {
    error_log('returns order comment failed: ' . $e->getMessage());
}

// ---------- e-maile ----------
$config = returnsConfig();
$shopEmail = !empty($config['returns_notify_email']) ? $config['returns_notify_email'] : Mage::getStoreConfig('trans_email/ident_general/email');

$rowsHtml = '';
foreach ($items as $item) {
    $rowsHtml .= '<li>' . h($item['qty']) . ' × ' . h($item['name']) . ($item['size'] !== '' ? ' (rozmiar ' . h($item['size']) . ')' : '') . '</li>';
}

$photosHtml = '';
foreach ($photoUrls as $url) {
    $photosHtml .= '<a href="' . h($url) . '"><img src="' . h($url) . '" width="120" style="margin:4px;border-radius:6px" alt=""></a>';
}

$shopHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">'
    . '<h2 style="margin:0 0 8px">' . h($typeLabel) . ' ' . h($ref) . '</h2>'
    . '<p>Zamówienie: <b>' . h($order->getIncrementId()) . '</b><br>Klient: ' . h($order->getCustomerFirstname() . ' ' . $order->getCustomerLastname()) . ' &lt;' . h($order->getCustomerEmail()) . '&gt;</p>'
    . '<p><b>Produkty:</b></p><ul>' . $rowsHtml . '</ul>'
    . '<p><b>Powód:</b> ' . h($reasonLabel) . '<br><b>Preferowane rozwiązanie:</b> ' . h($resolutionLabel) . '</p>'
    . ($description !== '' ? '<p><b>Opis:</b><br>' . nl2br(h($description)) . '</p>' : '')
    . ($bankAccount !== '' ? '<p><b>Konto do zwrotu:</b> ' . h($bankAccount) . '</p>' : '')
    . ($outOfWindow ? '<p style="color:#b45309"><b>Uwaga:</b> od odbioru minęło ' . h($days) . ' dni (termin na zwrot: ' . RETURNS_WINDOW_DAYS . ').</p>' : '')
    . ($photosHtml !== '' ? '<p><b>Zdjęcia (' . count($photoUrls) . '):</b><br>' . $photosHtml . '</p>' : '<p><i>Bez zdjęć.</i></p>')
    . '<p style="color:#666">Wpis został dodany do historii zamówienia w Magento.</p></div>';

returnsSendMail($shopEmail, 'Carinii', '[' . $typeLabel . '] ' . $ref . ', zamówienie ' . $order->getIncrementId(), $shopHtml);

$customerHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;max-width:560px">'
    . '<h2 style="margin:0 0 8px">Przyjęliśmy Twoje zgłoszenie</h2>'
    . '<p>Dzień dobry' . (returnsFirstName($order) !== '' ? ', ' . h(returnsFirstName($order)) : '') . '!</p>'
    . '<p>Numer zgłoszenia: <b style="font-size:18px">' . h($ref) . '</b><br>Zamówienie: ' . h($order->getIncrementId()) . ' · ' . h($typeLabel) . '</p>'
    . '<ul>' . $rowsHtml . '</ul>'
    . '<p>Odpowiemy na to zgłoszenie e-mailem. Podaj numer zgłoszenia w korespondencji oraz na paczce, jeśli będziesz odsyłać produkt.</p>'
    . ($type === 'zwrot' ? '<p>Adres do odesłania: <b>Z.P.O. CARINII, ul. Warszawska 78, 08-450 Łaskarzew</b></p>' : '')
    . '<p style="color:#666">Pytania? Napisz na sklep@carinii.com.pl lub zadzwoń: +48 25 748 42 00 (pn–pt 8:00–16:00).</p></div>';

returnsSendMail($order->getCustomerEmail(), returnsFirstName($order), 'Zgłoszenie ' . $ref . ' zostało przyjęte', $customerHtml);

returnsRespond(201, array('success' => true, 'data' => array(
    'ref' => $ref,
    'type' => $type,
    'orderNumber' => $order->getIncrementId(),
    'itemCount' => count($items),
    'photoCount' => count($photoUrls),
    'outOfWindow' => $outOfWindow,
    'email' => $order->getCustomerEmail(),
)));
