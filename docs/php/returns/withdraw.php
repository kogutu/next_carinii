<?php
/**
 * POST /directseo/nextjs/returns/withdraw.php   (Next.js, X-Api-Token)
 *
 * Oświadczenie o odstąpieniu od umowy złożone przez funkcję „Odstąp od umowy tutaj” (art. 11a dyrektywy 2011/83/UE,
 * zmienionej dyrektywą 2023/2673).
 *
 * Body: { orderNumber, email, fullName, items?: [{ itemId, qty }] (brak = całe zamówienie), bankAccount?,
 *         customerId?, accountEmail?, clientIp?, dryRun? }
 *
 * Co robi:
 *  1. Sprawdza zamówienie (numer + e-mail albo właściciel konta) — dostępne od złożenia zamówienia, poza anulowanymi i rozliczonymi.
 *  2. Zapisuje oświadczenie w carinii_returns (type = odstapienie): treść, imię i nazwisko, zakres, chwila złożenia (UTC).
 *  3. Dopisuje wpis w historii zamówienia (status zamówienia się nie zmienia).
 *  4. Wysyła klientowi potwierdzenie na trwałym nośniku (e-mail z treścią oświadczenia oraz datą i godziną), a sklepowi powiadomienie.
 *
 * Bez podawania powodu, zdjęć i zgody na regulamin. dryRun = true: pełna walidacja i treść maila bez zapisu i wysyłki.
 * Zgodny z PHP 7.0.
 */

require_once __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

/** Data i godzina po polsku z sekundami i strefą, np. „13.10.2026, 14:32:07 (czas polski, CEST)”. */
function withdrawalLocalTime(DateTime $utc)
{
    $local = clone $utc;
    $local->setTimezone(new DateTimeZone('Europe/Warsaw'));
    return $local->format('d.m.Y, H:i:s') . ' (czas polski, ' . $local->format('T') . ')';
}

function withdrawalOrderDay($order)
{
    try {
        $created = new DateTime($order->getCreatedAt(), new DateTimeZone('UTC'));
        $created->setTimezone(new DateTimeZone('Europe/Warsaw'));
        return $created->format('d.m.Y');
    } catch (Exception $e) {
        return '';
    }
}

$input = returnsInput();
$clientIp = returnsClientIp($input);
$customerId = isset($input['customerId']) ? (int) $input['customerId'] : 0;
$dryRun = !empty($input['dryRun']);

// ---------- dane z formularza ----------
$fullName = isset($input['fullName']) ? trim(preg_replace('/\s+/u', ' ', strip_tags((string) $input['fullName']))) : '';
if (mb_strlen($fullName) < 3 || mb_strlen($fullName) > 160) {
    returnsFail(400, 'Podaj imię i nazwisko');
}

$bankAccount = isset($input['bankAccount']) ? preg_replace('/\s+/', '', (string) $input['bankAccount']) : '';
if ($bankAccount !== '' && !preg_match('/^(PL)?\d{26}$/i', $bankAccount)) {
    returnsFail(400, 'Numer konta powinien mieć 26 cyfr (format polski)');
}

$order = returnsFindOrder(
    isset($input['orderNumber']) ? $input['orderNumber'] : '',
    isset($input['email']) ? $input['email'] : '',
    $customerId,
    $clientIp
);

$eligibility = returnsWithdrawalEligibility($order);
if (!$eligibility['allowed']) {
    returnsFail(422, $eligibility['reason'], 'not_eligible');
}

returnsEnsureTable();
$db = returnsDb();

// dwa równoległe kliknięcia nie utworzą dwóch oświadczeń (blokada zwalnia się też przy zakończeniu skryptu)
$db->fetchOne('SELECT GET_LOCK(?, 5)', array('returns_withdraw_' . (int) $order->getId()));

// ---------- zakres: całe zamówienie albo wybrane pozycje ----------
$orderItems = array();
foreach (returnsOrderItems($order) as $item) {
    $orderItems[$item['itemId']] = $item;
}

$available = array();
foreach ($orderItems as $itemId => $item) {
    if ($item['qtyAvailable'] > 0) {
        $available[$itemId] = (int) $item['qtyAvailable'];
    }
}

if (!$available) {
    // wszystko już objęte zgłoszeniem: jeśli to było oświadczenie o odstąpieniu, pokazujemy je zamiast tworzyć kolejne
    $previous = $db->fetchRow(
        'SELECT ref, withdrawn_at, scope FROM ' . RETURNS_TABLE . " WHERE order_id = ? AND type = 'odstapienie' AND status <> 'rejected' ORDER BY id DESC LIMIT 1",
        array((int) $order->getId())
    );
    if ($previous) {
        returnsRespond(200, array('success' => true, 'data' => array(
            'alreadySubmitted' => true,
            'ref' => $previous['ref'],
            'orderNumber' => $order->getIncrementId(),
            'scope' => $previous['scope'],
            'withdrawnAt' => $previous['withdrawn_at'] ? str_replace(' ', 'T', $previous['withdrawn_at']) . 'Z' : null,
            'email' => $order->getCustomerEmail(),
            'returnAddress' => RETURNS_ADDRESS,
        )));
    }
    returnsFail(422, 'Wszystkie produkty z tego zamówienia są już objęte wcześniejszym zgłoszeniem. Napisz do nas: sklep@carinii.com.pl.', 'nothing_left');
}

$requested = isset($input['items']) && is_array($input['items']) ? $input['items'] : array();
$selected = array();
if (!$requested) {
    $selected = $available;
} else {
    foreach ($requested as $entry) {
        $itemId = isset($entry['itemId']) ? (int) $entry['itemId'] : 0;
        $qty = isset($entry['qty']) ? (int) $entry['qty'] : 0;
        if (!isset($orderItems[$itemId])) {
            returnsFail(400, 'Wybrany produkt nie należy do tego zamówienia');
        }
        if (!isset($available[$itemId]) || $qty < 1 || $qty > $available[$itemId]) {
            returnsFail(422, 'Dla produktu „' . $orderItems[$itemId]['name'] . '” można objąć oświadczeniem maksymalnie ' . (isset($available[$itemId]) ? $available[$itemId] : 0) . ' szt.', 'qty');
        }
        $selected[$itemId] = $qty;
    }
    if (!$selected) {
        returnsFail(400, 'Wybierz co najmniej jeden produkt');
    }
}
$scope = ($selected == $available) ? 'full' : 'items';

$items = array();
foreach ($selected as $itemId => $qty) {
    $items[] = array(
        'itemId' => (int) $itemId,
        'name' => $orderItems[$itemId]['name'],
        'sku' => $orderItems[$itemId]['sku'],
        'size' => $orderItems[$itemId]['size'],
        'qty' => (int) $qty,
    );
}

// ---------- chwila złożenia, numer, treść oświadczenia ----------
$nowUtc = new DateTime('now', new DateTimeZone('UTC'));
$withdrawnAtDb = $nowUtc->format('Y-m-d H:i:s');
$withdrawnAtLocal = withdrawalLocalTime($nowUtc);
$outOfWindow = returnsWithdrawalOutOfWindow($order);
$daysSince = returnsDaysSinceReceived($order);

$ref = null;
for ($attempt = 0; $attempt < 5 && $ref === null; $attempt++) {
    $alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $suffix = '';
    for ($i = 0; $i < 5; $i++) {
        $suffix .= $alphabet[random_int(0, strlen($alphabet) - 1)];
    }
    $candidate = 'OD-' . $nowUtc->format('ymd') . '-' . $suffix;
    if (!(int) $db->fetchOne('SELECT COUNT(*) FROM ' . RETURNS_TABLE . ' WHERE ref = ?', array($candidate))) {
        $ref = $candidate;
    }
}
if ($ref === null) {
    returnsFail(500, 'Nie udało się nadać numeru potwierdzenia. Spróbuj ponownie.');
}

$itemLines = array();
foreach ($items as $item) {
    $itemLines[] = $item['qty'] . ' × ' . $item['name'] . ($item['size'] !== '' ? ' (rozmiar ' . $item['size'] . ')' : '');
}
$scopeText = $scope === 'full' ? 'całego zamówienia' : 'wybranych produktów';
$orderDay = withdrawalOrderDay($order);
$statementText = 'Niniejszym odstępuję od umowy sprzedaży zawartej na odległość'
    . ($orderDay !== '' ? ' w dniu ' . $orderDay : '') . ' (zamówienie nr ' . $order->getIncrementId() . ') w zakresie: ' . $scopeText . '.';
$statement = 'Imię i nazwisko: ' . $fullName . "\n"
    . 'Numer zamówienia: ' . $order->getIncrementId() . "\n"
    . 'Oświadczenie: ' . $statementText . "\n"
    . 'Produkty: ' . implode('; ', $itemLines) . "\n"
    . 'Data i godzina złożenia oświadczenia: ' . $withdrawnAtLocal;

// ---------- wiadomości ----------
$itemsHtml = '';
foreach ($itemLines as $line) {
    $itemsHtml .= '<li>' . h($line) . '</li>';
}

$firstToken = explode(' ', $fullName);
$greetingName = $firstToken[0];

$customerHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.55;max-width:600px">'
    . '<h2 style="margin:0 0 8px">Potwierdzenie odstąpienia od umowy</h2>'
    . '<p>Dzień dobry, ' . h($greetingName) . '!</p>'
    . '<p>Potwierdzamy, że <b>' . h($withdrawnAtLocal) . '</b> otrzymaliśmy Twoje oświadczenie o odstąpieniu od umowy.</p>'
    . '<table cellpadding="6" style="border-collapse:collapse;font-size:14px">'
    . '<tr><td style="color:#666">Numer potwierdzenia</td><td><b style="font-size:16px">' . h($ref) . '</b></td></tr>'
    . '<tr><td style="color:#666">Numer zamówienia</td><td><b>' . h($order->getIncrementId()) . '</b></td></tr>'
    . '<tr><td style="color:#666">Imię i nazwisko</td><td>' . h($fullName) . '</td></tr>'
    . '<tr><td style="color:#666">Data i godzina złożenia</td><td>' . h($withdrawnAtLocal) . '</td></tr>'
    . '<tr><td style="color:#666">Zakres</td><td>' . h($scope === 'full' ? 'całe zamówienie' : 'wybrane produkty') . '</td></tr>'
    . '</table>'
    . '<p style="margin:16px 0 6px"><b>Treść oświadczenia:</b></p>'
    . '<blockquote style="margin:0;padding:8px 14px;border-left:3px solid #ccc;color:#333">' . h($statementText) . '</blockquote>'
    . '<p style="margin:16px 0 6px"><b>Produkty objęte oświadczeniem:</b></p><ul style="margin:0">' . $itemsHtml . '</ul>'
    . '<p style="margin:16px 0 6px"><b>Co dalej?</b></p>'
    . '<ul style="margin:0">'
    . '<li>Odeślij towar najpóźniej w ciągu 14 dni od dnia złożenia oświadczenia na adres: <b>' . h(RETURNS_ADDRESS) . '</b>. Podaj numer ' . h($ref) . ' na paczce lub w korespondencji.</li>'
    . '<li>Zwrócimy płatność nie później niż w ciągu 14 dni od otrzymania tego oświadczenia, tą samą metodą, której użyto przy zakupie (§ 7 Regulaminu). Możemy wstrzymać zwrot do czasu otrzymania towaru lub dowodu jego odesłania.</li>'
    . '<li>Bezpośrednie koszty odesłania towaru ponosi Kupujący (§ 7 Regulaminu).</li>'
    . '</ul>'
    . '<p style="color:#666;margin-top:16px">Zachowaj tę wiadomość jako potwierdzenie złożenia oświadczenia. Pytania? Napisz na sklep@carinii.com.pl lub zadzwoń: +48 25 748 42 00 (pn–pt 8:00–16:00).</p></div>';

$config = returnsConfig();
$shopEmail = !empty($config['returns_notify_email']) ? $config['returns_notify_email'] : Mage::getStoreConfig('trans_email/ident_general/email');

$accountEmail = isset($input['accountEmail']) ? strtolower(trim((string) $input['accountEmail'])) : '';
$orderEmail = strtolower(trim($order->getCustomerEmail()));
$sendAccountCopy = $customerId > 0 && $accountEmail !== '' && $accountEmail !== $orderEmail && filter_var($accountEmail, FILTER_VALIDATE_EMAIL);

if ($dryRun) {
    returnsRespond(200, array('success' => true, 'data' => array(
        'dryRun' => true,
        'ref' => $ref,
        'orderNumber' => $order->getIncrementId(),
        'scope' => $scope,
        'items' => $items,
        'statement' => $statement,
        'withdrawnAtLocal' => $withdrawnAtLocal,
        'outOfWindow' => $outOfWindow,
        'sendTo' => $order->getCustomerEmail(),
        'accountCopyTo' => $sendAccountCopy ? $accountEmail : null,
        'mailHtml' => $customerHtml,
    )));
}

// ---------- zapis ----------
$db->insert(RETURNS_TABLE, array(
    'ref' => $ref,
    'order_id' => (int) $order->getId(),
    'order_increment' => $order->getIncrementId(),
    'customer_id' => $order->getCustomerId() ? (int) $order->getCustomerId() : null,
    'email' => $orderEmail,
    'type' => 'odstapienie',
    'status' => 'new',
    'reason' => 'Odstąpienie od umowy',
    'resolution' => 'Zwrot pieniędzy',
    'description' => '',
    'bank_account' => $bankAccount,
    'out_of_window' => $outOfWindow ? 1 : 0,
    'items' => json_encode($items, JSON_UNESCAPED_UNICODE),
    'photos' => '[]',
    'ip' => $clientIp,
    'created_at' => $withdrawnAtDb,
    'full_name' => $fullName,
    'withdrawn_at' => $withdrawnAtDb,
    'statement' => $statement,
    'scope' => $scope,
));
$recordId = (int) $db->lastInsertId();

$comment = '[' . $ref . '] Oświadczenie o odstąpieniu od umowy (online, ' . $withdrawnAtLocal . ")\n"
    . 'Imię i nazwisko: ' . $fullName . "\n"
    . 'Zakres: ' . $scopeText . "\n"
    . 'Produkty: ' . implode('; ', $itemLines)
    . ($bankAccount !== '' ? "\nKonto do zwrotu: " . $bankAccount : '')
    . ($outOfWindow ? "\nUWAGA: od odbioru minęło orientacyjnie " . $daysSince . ' dni (termin to ' . RETURNS_WINDOW_DAYS . ' dni) — skuteczność do oceny.' : '');
try {
    $history = $order->addStatusHistoryComment($comment);
    $history->setIsCustomerNotified(0);
    $history->save();
} catch (Exception $e) {
    error_log('withdrawal order comment failed: ' . $e->getMessage());
}

// ---------- potwierdzenie na trwałym nośniku ----------
$subject = 'Potwierdzenie odstąpienia od umowy — zamówienie ' . $order->getIncrementId();
$ackOk = returnsSendMail($order->getCustomerEmail(), $greetingName, $subject, $customerHtml);
if (!$ackOk) {
    usleep(400000);
    $ackOk = returnsSendMail($order->getCustomerEmail(), $greetingName, $subject, $customerHtml);
}
if ($sendAccountCopy) {
    returnsSendMail($accountEmail, $greetingName, $subject, $customerHtml);
}
$db->update(
    RETURNS_TABLE,
    array('ack_sent_at' => $ackOk ? gmdate('Y-m-d H:i:s') : null, 'ack_status' => $ackOk ? 'sent' : 'failed'),
    array('id = ?' => $recordId)
);

// ---------- powiadomienie dla sklepu ----------
$shopHtml = '<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5">'
    . '<h2 style="margin:0 0 8px">Odstąpienie od umowy ' . h($ref) . '</h2>'
    . ($ackOk ? '' : '<p style="color:#b91c1c"><b>UWAGA: nie udało się wysłać klientowi potwierdzenia. Wyślij je ręcznie na ' . h($order->getCustomerEmail()) . ' (wymóg: potwierdzenie na trwałym nośniku).</b></p>')
    . '<p>Zamówienie: <b>' . h($order->getIncrementId()) . '</b><br>Imię i nazwisko: ' . h($fullName) . '<br>E-mail: ' . h($order->getCustomerEmail()) . '<br>Złożone: ' . h($withdrawnAtLocal) . '</p>'
    . '<p><b>Zakres:</b> ' . h($scopeText) . '</p><ul>' . $itemsHtml . '</ul>'
    . ($bankAccount !== '' ? '<p><b>Konto do zwrotu:</b> ' . h($bankAccount) . '</p>' : '')
    . ($outOfWindow ? '<p style="color:#b45309"><b>Uwaga:</b> od odbioru minęło orientacyjnie ' . h($daysSince) . ' dni (termin: ' . RETURNS_WINDOW_DAYS . ') — skuteczność oświadczenia do oceny.</p>' : '')
    . '<p style="color:#666">Wpis został dodany do historii zamówienia w Magento.</p></div>';
returnsSendMail($shopEmail, 'Carinii', ($ackOk ? '' : '[BRAK POTWIERDZENIA] ') . '[ODSTĄPIENIE] ' . $ref . ', zamówienie ' . $order->getIncrementId(), $shopHtml);

returnsRespond(201, array('success' => true, 'data' => array(
    'alreadySubmitted' => false,
    'ref' => $ref,
    'orderNumber' => $order->getIncrementId(),
    'scope' => $scope,
    'itemCount' => count($items),
    'withdrawnAt' => $nowUtc->format('Y-m-d\TH:i:s\Z'),
    'withdrawnAtLocal' => $withdrawnAtLocal,
    'email' => $order->getCustomerEmail(),
    'ackSent' => (bool) $ackOk,
    'outOfWindow' => $outOfWindow,
    'returnAddress' => RETURNS_ADDRESS,
)));
