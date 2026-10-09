<?php
/**
 * POST /directseo/nextjs/orders/markPaid.php
 *
 * Oznacza zamówienie jako opłacone. Wywoływane przez aplikację Next.js po potwierdzeniu płatności
 * przez Tpay (webhook JWS) albo Przelewy24 (powiadomienie z podpisem) — weryfikacja po stronie Next.js.
 *
 * Nagłówek:  Authorization: Bearer <mark_paid_token z payment/config.local.php>
 * Body JSON: { "oid", "provider" ("tpay"|"p24"), "transactionId", "amount", "currency", "paidAt", "testMode" }
 *            + opcjonalnie "dryRun": true — pełna walidacja i odpowiedź "co by się stało", bez żadnego zapisu.
 *            albo { "ping": true } — test tokenu i połączeń (bez zapisu).
 *
 * Co robi (w tej kolejności):
 *  1. Flaga płatności: wiersz w payment_callbacks (baza jsk_nextjs) ze statusem "success" — tak odczytuje
 *     to orders/index.php (pole "pay"). Jeden wiersz na oid, idempotentnie.
 *  2. Magento — tak jak moduł Tpay_Tpay po powiadomieniu: faktura (capture online), mail z zamówieniem,
 *     zaplacono=1, status "processing" i wpis w historii zamówienia.
 *
 * Idempotencja: ten sam transactionId wywołany ponownie zwraca 200. Jeśli krok 2 się nie powiódł,
 * odpowiedź to 500 (Tpay ponowi powiadomienie), a kolejne wywołanie powtórzy tylko krok 2.
 *
 * Zgodny z PHP 7.0.
 */

header('Content-Type: application/json; charset=utf-8');

$config = require __DIR__ . '/../payment/config.local.php';
// Log poza katalogiem publicznym (serwer to nginx — .htaccess nie działa, pliki w public_html są dostępne przez HTTP)
$logDir = isset($config['log_dir']) ? $config['log_dir'] : '/home/directseo/logs';
if (!is_dir($logDir)) {
    @mkdir($logDir, 0750, true);
}
$logFile = $logDir . '/markPaid.log';

function respond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function logLine($logFile, $level, $message, $context = array())
{
    $line = json_encode(array('time' => date('Y-m-d H:i:s'), 'level' => $level, 'message' => $message, 'context' => $context), JSON_UNESCAPED_UNICODE);
    @file_put_contents($logFile, $line . PHP_EOL, FILE_APPEND | LOCK_EX);
}

function bearerToken()
{
    $header = '';
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $header = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strtolower($name) === 'authorization') {
                $header = $value;
            }
        }
    }
    return preg_match('/^Bearer\s+(.+)$/i', trim($header), $m) ? $m[1] : '';
}

/** Zamówienie jest już rozliczone w Magento (nie ma czego fakturować, stan processing/complete). */
function isFinalized($order)
{
    return !$order->canInvoice()
        && in_array($order->getState(), array(Mage_Sales_Model_Order::STATE_PROCESSING, Mage_Sales_Model_Order::STATE_COMPLETE), true);
}

/**
 * Odwzorowanie tego, co robi moduł Tpay_Tpay (NotificationController) po udanej płatności.
 * Rzuca wyjątek, jeśli którykolwiek krok się nie powiedzie — wywołujący odpowiada wtedy 500, żeby Tpay ponowił.
 */
function finalizeMagentoOrder($order, $transactionId, $amount, $currency, $isTest, $providerLabel)
{
    if ($order->canInvoice()) {
        $invoice = Mage::getModel('sales/service_order', $order)->prepareInvoice();
        if ($invoice->getTotalQty()) {
            $invoice->setRequestedCaptureCase(Mage_Sales_Model_Order_Invoice::CAPTURE_ONLINE);
            $invoice->register();

            if (!$invoice->getEmailSent()) {
                $invoice->sendEmail();
                $invoice->setEmailSent(true);
            }

            Mage::getModel('core/resource_transaction')
                ->addObject($invoice)
                ->addObject($invoice->getOrder())
                ->save();
        }
    }

    if (!$order->getEmailSent()) {
        $order->sendNewOrderEmail();
        $order->setEmailSent(true);
    }

    $order->setZaplacono(true);
    $order->setState(Mage_Sales_Model_Order::STATE_PROCESSING, true);
    $order->addStatusToHistory(
        Mage_Sales_Model_Order::STATE_PROCESSING,
        sprintf('Płatność %s potwierdzona: transakcja %s, kwota %s %s%s.', $providerLabel, $transactionId, number_format($amount, 2, '.', ''), $currency, $isTest ? ' [TRYB TESTOWY]' : '')
    );
    $order->save();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, array('success' => false, 'message' => 'Dozwolona tylko metoda POST'));
}

// --- autoryzacja (porównanie odporne na timing attack) ---
if (!hash_equals($config['mark_paid_token'], bearerToken())) {
    logLine($logFile, 'warning', 'unauthorized request', array('ip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : ''));
    respond(401, array('success' => false, 'message' => 'Brak autoryzacji'));
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, array('success' => false, 'message' => 'Nieprawidłowy JSON'));
}

// --- połączenie z bazą płatności ---
try {
    $pdo = new PDO($config['db']['dsn'], $config['db']['user'], $config['db']['pass'], array(
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ));
} catch (PDOException $e) {
    logLine($logFile, 'error', 'db connection failed', array('error' => $e->getMessage()));
    respond(500, array('success' => false, 'message' => 'Błąd połączenia z bazą płatności'));
}

// --- test połączeń bez zapisu ---
if (!empty($input['ping'])) {
    $pdo->query('SELECT 1 FROM payment_callbacks LIMIT 1');
    respond(200, array('success' => true, 'ping' => true, 'db' => true));
}

// --- walidacja danych ---
$oid = isset($input['oid']) ? (string) $input['oid'] : '';
$provider = isset($input['provider']) ? (string) $input['provider'] : '';
$transactionId = isset($input['transactionId']) ? (string) $input['transactionId'] : '';
$amount = isset($input['amount']) ? (float) $input['amount'] : 0.0;
$currency = isset($input['currency']) ? (string) $input['currency'] : 'PLN';
$isTest = !empty($input['testMode']);
$dryRun = !empty($input['dryRun']);

if (!preg_match('/^[\w-]{1,40}$/', $oid)) {
    respond(400, array('success' => false, 'message' => 'Nieprawidłowy oid'));
}
// provider => etykieta zapisywana w payment_callbacks.provider i w historii zamówienia
$providerLabels = array('tpay' => 'Tpay', 'p24' => 'Przelewy24');
if (!isset($providerLabels[$provider])) {
    respond(400, array('success' => false, 'message' => 'Nieobsługiwany provider'));
}
$providerLabel = $providerLabels[$provider];
if (!preg_match('/^[\w.-]{1,64}$/', $transactionId)) {
    respond(400, array('success' => false, 'message' => 'Nieprawidłowy transactionId'));
}
if ($amount <= 0) {
    respond(400, array('success' => false, 'message' => 'Nieprawidłowa kwota'));
}

// --- zamówienie w Magento: istnieje, nie jest anulowane, kwota pokrywa należność ---
require_once '/home/directseo/domains/sklep.carinii.com.pl/public_html/app/Mage.php';
Mage::app();

$order = Mage::getModel('sales/order')->loadByIncrementId($oid);
if (!$order->getId()) {
    logLine($logFile, 'warning', 'order not found', array('oid' => $oid, 'transactionId' => $transactionId));
    respond(404, array('success' => false, 'message' => 'Nie znaleziono zamówienia'));
}

if ($order->isCanceled()) {
    logLine($logFile, 'error', 'PAYMENT FOR CANCELED ORDER — handle manually', array('oid' => $oid, 'transactionId' => $transactionId, 'amount' => $amount));
    respond(409, array('success' => false, 'code' => 'order_canceled', 'message' => 'Zamówienie jest anulowane'));
}

$grandTotal = (float) $order->getGrandTotal();
if ($amount + 0.01 < $grandTotal) {
    logLine($logFile, 'error', 'amount too low', array('oid' => $oid, 'paid' => $amount, 'required' => $grandTotal, 'transactionId' => $transactionId));
    respond(409, array('success' => false, 'message' => 'Zapłacona kwota jest niższa niż wartość zamówienia'));
}

// --- zapis statusu (jeden wiersz na oid; blokada wiersza na czas decyzji) ---
$payload = json_encode($input, JSON_UNESCAPED_UNICODE);

$updateSql = "UPDATE payment_callbacks SET provider = :provider, orderId = :txid, amount = :amount, payload = :payload,
             status = 'success', verified = :verified, updated_at = NOW() WHERE oid = :oid";
$insertSql = "INSERT INTO payment_callbacks (oid, provider, sessionId, orderId, amount, payload, status, verified, created_at, updated_at)
             VALUES (:oid, :provider, NULL, :txid, :amount, :payload, 'success', :verified, NOW(), NOW())";

if ($dryRun) {
    // bez zapisu: SELECT bez blokady + sprawdzenie, że instrukcje SQL się kompilują
    $stmt = $pdo->prepare('SELECT status, orderId FROM payment_callbacks WHERE oid = :oid');
    $stmt->execute(array('oid' => $oid));
    $row = $stmt->fetch();
    $pdo->prepare($updateSql);
    $pdo->prepare($insertSql);

    if ($row && in_array($row['status'], array('success', 'paid'), true)) {
        $action = $row['orderId'] === $transactionId ? 'duplicate' : 'alreadyPaid';
    } else {
        $action = $row ? 'update' : 'insert';
    }
    respond(200, array(
        'success' => true,
        'dryRun' => true,
        'action' => $action,
        'order' => array(
            'grandTotal' => $grandTotal,
            'state' => $order->getState(),
            'status' => $order->getStatus(),
            'canInvoice' => (bool) $order->canInvoice(),
            'emailSent' => (bool) $order->getEmailSent(),
            'finalized' => isFinalized($order),
        ),
    ));
}

$alreadyRecorded = false;

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT status, orderId FROM payment_callbacks WHERE oid = :oid FOR UPDATE');
    $stmt->execute(array('oid' => $oid));
    $row = $stmt->fetch();

    if ($row && in_array($row['status'], array('success', 'paid'), true)) {
        $pdo->commit();

        if ($row['orderId'] !== $transactionId) {
            // zamówienie było już opłacone inną transakcją — nie księgujemy drugi raz, ale zgłaszamy do sprawdzenia
            logLine($logFile, 'error', 'DOUBLE PAYMENT — verify and refund manually', array(
                'oid' => $oid, 'existingTransaction' => $row['orderId'], 'newTransaction' => $transactionId, 'amount' => $amount,
            ));
            respond(200, array('success' => true, 'alreadyPaid' => true));
        }
        $alreadyRecorded = true;
    } else {
        if ($row) {
            $update = $pdo->prepare($updateSql);
            $update->execute(array('provider' => $providerLabel, 'txid' => $transactionId, 'amount' => $amount, 'payload' => $payload, 'verified' => $payload, 'oid' => $oid));
        } else {
            $insert = $pdo->prepare($insertSql);
            $insert->execute(array('oid' => $oid, 'provider' => $providerLabel, 'txid' => $transactionId, 'amount' => $amount, 'payload' => $payload, 'verified' => $payload));
        }
        $pdo->commit();
    }
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    logLine($logFile, 'error', 'db write failed', array('oid' => $oid, 'error' => $e->getMessage()));
    respond(500, array('success' => false, 'message' => 'Błąd zapisu płatności'));
}

// --- Magento: faktura, mail, status processing (powtarzane przy kolejnym wywołaniu, jeśli się nie udało) ---
if (isFinalized($order)) {
    respond(200, array('success' => true, 'duplicate' => $alreadyRecorded));
}

try {
    finalizeMagentoOrder($order, $transactionId, $amount, $currency, $isTest, $providerLabel);
} catch (Exception $e) {
    logLine($logFile, 'error', 'magento finalize failed', array('oid' => $oid, 'transactionId' => $transactionId, 'error' => $e->getMessage()));
    respond(500, array('success' => false, 'message' => 'Płatność zapisana, ale nie udało się zaktualizować zamówienia w Magento'));
}

logLine($logFile, 'info', 'order marked as paid', array('oid' => $oid, 'transactionId' => $transactionId, 'amount' => $amount));
respond(200, array('success' => true, 'duplicate' => $alreadyRecorded));
