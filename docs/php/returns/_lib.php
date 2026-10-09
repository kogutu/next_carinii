<?php
/**
 * Wspólny kod skryptów zwrotów i reklamacji (/directseo/nextjs/returns/*.php).
 * Wołane wyłącznie z serwera Next.js (nagłówek X-Api-Token, patrz user/_guard.php).
 * Zgodny z PHP 7.0.
 */

require_once __DIR__ . '/../user/_guard.php';
customerApiGuard();

require_once '/home/directseo/domains/sklep.carinii.com.pl/public_html/app/Mage.php';
Mage::app();

header('Content-Type: application/json; charset=utf-8');

const RETURNS_TABLE = 'carinii_returns';
const RETURNS_STAGING_DIR = '/home/directseo/returns_staging';
const RETURNS_THROTTLE_DIR = '/home/directseo/logs/returns_throttle';
// statusy zamówień, dla których można zgłosić zwrot/reklamację (zamówienie dotarło do klienta)
const RETURNS_ALLOWED_STATUSES = 'complete,wyslano';
const RETURNS_WINDOW_DAYS = 14;      // ustawowy termin odstąpienia od umowy (informacyjnie — nie blokuje zgłoszenia)
const RETURNS_MAX_PHOTOS = 6;

function returnsRespond($status, $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function returnsFail($status, $message, $code = '')
{
    returnsRespond($status, array('success' => false, 'message' => $message, 'code' => $code));
}

function returnsInput()
{
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input)) {
        returnsFail(400, 'Nieprawidłowe żądanie');
    }
    return $input;
}

function returnsConfig()
{
    static $config = null;
    if ($config === null) {
        $path = __DIR__ . '/../payment/config.local.php';
        // OPcache serwera odświeża pliki co 5 minut — konfiguracja ma działać od razu po zmianie
        if (function_exists('opcache_invalidate')) {
            @opcache_invalidate($path, true);
        }
        $config = require $path;
    }
    return $config;
}

function returnsDb()
{
    return Mage::getSingleton('core/resource')->getConnection('core_write');
}

function returnsEnsureTable()
{
    returnsDb()->query(
        'CREATE TABLE IF NOT EXISTS ' . RETURNS_TABLE . ' (
            id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            ref VARCHAR(32) NOT NULL,
            order_id INT UNSIGNED NOT NULL,
            order_increment VARCHAR(50) NOT NULL,
            customer_id INT UNSIGNED NULL,
            email VARCHAR(255) NOT NULL,
            type VARCHAR(16) NOT NULL,
            status VARCHAR(24) NOT NULL DEFAULT \'new\',
            reason VARCHAR(64) NOT NULL DEFAULT \'\',
            resolution VARCHAR(64) NOT NULL DEFAULT \'\',
            description TEXT NULL,
            bank_account VARCHAR(40) NOT NULL DEFAULT \'\',
            out_of_window TINYINT(1) NOT NULL DEFAULT 0,
            items MEDIUMTEXT NOT NULL,
            photos MEDIUMTEXT NOT NULL,
            ip VARCHAR(45) NOT NULL DEFAULT \'\',
            created_at DATETIME NOT NULL,
            UNIQUE KEY uq_ref (ref),
            KEY idx_order (order_id),
            KEY idx_customer (customer_id),
            KEY idx_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8'
    );
}

// ---------- ograniczanie prób zgadywania numeru zamówienia + e-maila ----------

function returnsThrottleFile($key)
{
    if (!is_dir(RETURNS_THROTTLE_DIR)) {
        @mkdir(RETURNS_THROTTLE_DIR, 0750, true);
    }
    return RETURNS_THROTTLE_DIR . '/' . sha1($key) . '.json';
}

function returnsFailures($key, $windowSeconds = 900)
{
    $file = returnsThrottleFile($key);
    $times = is_file($file) ? json_decode((string) @file_get_contents($file), true) : array();
    $since = time() - $windowSeconds;
    return is_array($times) ? array_values(array_filter($times, function ($t) use ($since) {
        return $t >= $since;
    })) : array();
}

function returnsRecordFailure($key)
{
    $times = returnsFailures($key);
    $times[] = time();
    @file_put_contents(returnsThrottleFile($key), json_encode($times), LOCK_EX);
}

// ---------- zamówienie ----------

/**
 * Zamówienie, jeśli numer pasuje do adresu e-mail z zamówienia (albo należy do zalogowanego klienta).
 * Przy złych danych zwraca zawsze ten sam komunikat — nie zdradzamy, które numery istnieją.
 */
function returnsFindOrder($number, $email, $customerId, $clientIp)
{
    $number = trim((string) $number);
    $email = strtolower(trim((string) $email));
    $keyOrder = 'order:' . strtoupper($number);
    $keyIp = 'ip:' . $clientIp;

    if (count(returnsFailures($keyOrder)) >= 8 || ($clientIp !== '' && count(returnsFailures($keyIp)) >= 40)) {
        returnsFail(429, 'Zbyt wiele prób. Spróbuj ponownie za kilkanaście minut.', 'throttled');
    }

    $order = null;
    if ($number !== '' && preg_match('/^[A-Za-z0-9\-]{3,40}$/', $number)) {
        $candidate = Mage::getModel('sales/order')->loadByIncrementId($number);
        if ($candidate->getId()) {
            $emailMatches = $email !== '' && strtolower(trim($candidate->getCustomerEmail())) === $email;
            $ownerMatches = $customerId > 0 && (int) $candidate->getCustomerId() === (int) $customerId;
            if ($emailMatches || $ownerMatches) {
                $order = $candidate;
            }
        }
    }

    if (!$order) {
        returnsRecordFailure($keyOrder);
        if ($clientIp !== '') {
            returnsRecordFailure($keyIp);
        }
        returnsFail(404, 'Nie znaleźliśmy zamówienia o tym numerze dla podanego adresu e-mail. Sprawdź dane z wiadomości z potwierdzeniem zamówienia.', 'order_not_found');
    }

    return $order;
}

function returnsEligibility($order)
{
    $config = returnsConfig();
    $allowed = explode(',', RETURNS_ALLOWED_STATUSES);
    if (!empty($config['returns_extra_allowed_statuses'])) {
        $allowed = array_merge($allowed, explode(',', $config['returns_extra_allowed_statuses']));
    }
    if (in_array($order->getStatus(), $allowed, true)) {
        return array('allowed' => true, 'reason' => '');
    }

    $reasons = array(
        'canceled' => 'To zamówienie zostało anulowane.',
        'pending' => 'To zamówienie nie zostało jeszcze opłacone.',
        'pending_payment' => 'To zamówienie nie zostało jeszcze opłacone.',
        'processing' => 'To zamówienie jest w trakcie realizacji. Zgłoszenie będzie możliwe po jego otrzymaniu.',
        'zwrot_pieniedzy' => 'Dla tego zamówienia zwrot został już rozliczony.',
        'zwrot_dotarl' => 'Dla tego zamówienia trwa już obsługa zwrotu.',
        'reklamacja' => 'Dla tego zamówienia trwa już obsługa reklamacji.',
    );
    $reason = isset($reasons[$order->getStatus()]) ? $reasons[$order->getStatus()] : 'Dla tego zamówienia zgłoszenie online nie jest dostępne. Napisz do nas: sklep@carinii.com.pl.';
    return array('allowed' => false, 'reason' => $reason);
}

/** Dni od momentu, który najlepiej przybliża odbiór paczki (w Magento nie ma przesyłek — liczymy od zakończenia zamówienia). */
function returnsDaysSinceReceived($order)
{
    $since = $order->getState() === 'complete' ? $order->getUpdatedAt() : $order->getCreatedAt();
    $ts = strtotime($since);
    return $ts ? (int) floor((time() - $ts) / 86400) : 0;
}

function returnsSizeFromSku($sku)
{
    return preg_match('/roz_(\d+(?:[.,]\d+)?)$/i', (string) $sku, $m) ? $m[1] : '';
}

/** Zgłoszenia (poza odrzuconymi) dla zamówienia: ilości już zgłoszone per pozycja. */
function returnsRequestedQuantities($orderId)
{
    returnsEnsureTable();
    $rows = returnsDb()->fetchAll(
        'SELECT items FROM ' . RETURNS_TABLE . " WHERE order_id = ? AND status <> 'rejected'",
        array((int) $orderId)
    );
    $sum = array();
    foreach ($rows as $row) {
        $items = json_decode($row['items'], true);
        if (!is_array($items)) {
            continue;
        }
        foreach ($items as $item) {
            $id = (int) $item['itemId'];
            $sum[$id] = (isset($sum[$id]) ? $sum[$id] : 0) + (int) $item['qty'];
        }
    }
    return $sum;
}

function returnsOrderItems($order)
{
    $requested = returnsRequestedQuantities($order->getId());
    $items = array();

    foreach ($order->getAllVisibleItems() as $item) {
        $itemId = (int) $item->getItemId();
        $ordered = (int) $item->getQtyOrdered();
        $refunded = (int) $item->getQtyRefunded();
        $already = isset($requested[$itemId]) ? $requested[$itemId] : 0;

        $imageUrl = '';
        try {
            $product = Mage::getModel('catalog/product')->load($item->getProductId());
            $imageUrl = (string) Mage::helper('catalog/image')->init($product, 'small_image')->resize(200, 200);
        } catch (Exception $e) {
            $imageUrl = '';
        }

        $items[] = array(
            'itemId' => $itemId,
            'name' => $item->getName(),
            'sku' => $item->getSku(),
            'size' => returnsSizeFromSku($item->getSku()),
            'qtyOrdered' => $ordered,
            'qtyAvailable' => max(0, $ordered - $refunded - $already),
            'price' => (float) $item->getPriceInclTax(),
            'image' => $imageUrl,
        );
    }

    return $items;
}

function returnsFirstName($order)
{
    $billing = $order->getBillingAddress();
    return $billing ? (string) $billing->getFirstname() : (string) $order->getCustomerFirstname();
}

function returnsClientIp($input)
{
    $ip = isset($input['clientIp']) ? trim((string) $input['clientIp']) : '';
    return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '';
}

function returnsReason($type, $code)
{
    $reasons = array(
        'zwrot' => array(
            'size_too_small' => 'Rozmiar za mały',
            'size_too_big' => 'Rozmiar za duży',
            'not_as_expected' => 'Produkt nie spełnia oczekiwań',
            'changed_mind' => 'Rezygnacja z zakupu',
            'other' => 'Inny powód',
        ),
        'reklamacja' => array(
            'damage' => 'Uszkodzenie (pęknięcie, rozdarcie)',
            'sole_heel' => 'Podeszwa lub obcas (odklejenie, zużycie)',
            'material_seams' => 'Wada materiału lub szwów',
            'fittings' => 'Zamek, sprzączka, element ozdobny',
            'wrong_item' => 'Niezgodność z zamówieniem',
            'other' => 'Inna wada',
        ),
    );
    return isset($reasons[$type][$code]) ? $reasons[$type][$code] : null;
}

function returnsResolution($type, $code)
{
    $resolutions = array(
        'zwrot' => array(
            'refund' => 'Zwrot pieniędzy',
            'exchange' => 'Wymiana na inny rozmiar lub produkt',
        ),
        'reklamacja' => array(
            'repair' => 'Naprawa',
            'replace' => 'Wymiana na nowy produkt',
            'discount' => 'Obniżenie ceny',
            'refund' => 'Zwrot pieniędzy',
        ),
    );
    return isset($resolutions[$type][$code]) ? $resolutions[$type][$code] : null;
}
