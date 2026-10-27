<?php
/**
 * POST /directseo/nextjs/returns/wz_event.php   (Next.js, X-Api-Token)
 *
 * Zdarzenie webhooka Wygodnych Zwrotów (return.created / return.updated), przekazane przez app/api/wygodnezwroty/webhook
 * po weryfikacji podpisu. Bez danych osobowych klienta: tylko identyfikatory, status zwrotu i przesyłki.
 *
 * Body: { eventId, event, occurredAt, returnId, orderNumber, status, carrier, trackingNumber, shipmentStatus,
 *         sentAt, deliveredAt, estimatedRefund, currency, dryRun? }
 *
 * Co robi:
 *  1. Deduplikuje po event_id (carinii_wz_events) — ponowna dostawa tego samego zdarzenia nic nie zmienia.
 *  2. Aktualizuje ostatni znany stan zwrotu (carinii_wz_returns, klucz return_id); starsze zdarzenie nie nadpisuje nowszego.
 *  3. Gdy zmienił się status lub przesyłka, dopisuje wpis w historii zamówienia w Magento (widoczny w panelu admina).
 * dryRun = true: tylko walidacja i sprawdzenie, czy zdarzenie już było — bez zapisu. Zgodny z PHP 7.0.
 */

require_once __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

function wzText($input, $key, $max)
{
    return isset($input[$key]) && is_scalar($input[$key]) ? mb_substr(trim(strip_tags((string) $input[$key])), 0, $max) : '';
}

$input = returnsInput();
$dryRun = !empty($input['dryRun']);

$eventId = wzText($input, 'eventId', 64);
$returnId = wzText($input, 'returnId', 64);
$orderNumber = wzText($input, 'orderNumber', 50);
if ($eventId === '' || $returnId === '' || $orderNumber === '') {
    returnsFail(400, 'Brak identyfikatora zdarzenia, zwrotu lub zamówienia');
}

$status = wzText($input, 'status', 80);
$carrier = wzText($input, 'carrier', 40);
$tracking = wzText($input, 'trackingNumber', 80);
$shipmentStatus = wzText($input, 'shipmentStatus', 40);
$estimatedRefund = wzText($input, 'estimatedRefund', 20);
$currency = wzText($input, 'currency', 8);

// chwila zdarzenia w UTC (do rozpoznania kolejności); przy błędnym formacie — teraz
try {
    $occurred = new DateTime(wzText($input, 'occurredAt', 40) ?: 'now', new DateTimeZone('UTC'));
    $occurred->setTimezone(new DateTimeZone('UTC'));
} catch (Exception $e) {
    $occurred = new DateTime('now', new DateTimeZone('UTC'));
}
$occurredDb = $occurred->format('Y-m-d H:i:s');

returnsEnsureWzTables();
$db = returnsDb();

if ($dryRun) {
    $known = (int) $db->fetchOne('SELECT COUNT(*) FROM carinii_wz_events WHERE event_id = ?', array($eventId));
    $order = Mage::getModel('sales/order')->loadByIncrementId($orderNumber);
    returnsRespond(200, array('success' => true, 'data' => array('dryRun' => true, 'duplicate' => (bool) $known, 'orderFound' => (bool) $order->getId())));
}

// deduplikacja: INSERT IGNORE nie doda drugiego wiersza dla tego samego event_id, także przy dwóch równoległych dostawach
$inserted = $db->query('INSERT IGNORE INTO carinii_wz_events (event_id, received_at) VALUES (?, ?)', array($eventId, gmdate('Y-m-d H:i:s')));
if ($inserted->rowCount() === 0) {
    returnsRespond(200, array('success' => true, 'data' => array('duplicate' => true)));
}

$order = Mage::getModel('sales/order')->loadByIncrementId($orderNumber);
$orderFound = (bool) $order->getId();

$previous = $db->fetchRow(
    'SELECT status, carrier, tracking_number, shipment_status, last_occurred_at FROM carinii_wz_returns WHERE return_id = ?',
    array($returnId)
);

// zdarzenia mogą dotrzeć w innej kolejności (ponowienia) — starsze nie nadpisuje nowszego
if ($previous && strtotime($previous['last_occurred_at'] . ' UTC') > $occurred->getTimestamp()) {
    returnsRespond(200, array('success' => true, 'data' => array('duplicate' => false, 'stale' => true)));
}

$db->query(
    'INSERT INTO carinii_wz_returns (return_id, order_increment, order_id, status, carrier, tracking_number, shipment_status, estimated_refund, currency, last_occurred_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE order_increment = VALUES(order_increment), order_id = VALUES(order_id), status = VALUES(status), carrier = VALUES(carrier),
        tracking_number = VALUES(tracking_number), shipment_status = VALUES(shipment_status), estimated_refund = VALUES(estimated_refund),
        currency = VALUES(currency), last_occurred_at = VALUES(last_occurred_at), updated_at = VALUES(updated_at)',
    array($returnId, $orderNumber, $orderFound ? (int) $order->getId() : null, $status, $carrier, $tracking, $shipmentStatus, $estimatedRefund, $currency, $occurredDb, gmdate('Y-m-d H:i:s'))
);

$changed = !$previous
    || $previous['status'] !== $status
    || $previous['carrier'] !== $carrier
    || $previous['tracking_number'] !== $tracking
    || $previous['shipment_status'] !== $shipmentStatus;

// wpis w historii zamówienia tylko przy realnej zmianie (webhook bywa wysyłany wielokrotnie bez zmiany treści)
if ($changed && $orderFound) {
    $parcel = trim($carrier . ' ' . $tracking);
    $comment = '[Wygodne Zwroty] Zwrot ' . mb_substr($returnId, 0, 8) . ($status !== '' ? ': ' . $status : ': zmiana')
        . ($parcel !== '' ? '. Przesyłka: ' . $parcel . ($shipmentStatus !== '' ? ' (' . $shipmentStatus . ')' : '') : '')
        . ($estimatedRefund !== '' ? '. Szacowany zwrot: ' . $estimatedRefund . ($currency !== '' ? ' ' . $currency : '') : '')
        . '.';
    try {
        $history = $order->addStatusHistoryComment($comment);
        $history->setIsCustomerNotified(0);
        $history->save();
    } catch (Exception $e) {
        error_log('wz order comment failed: ' . $e->getMessage());
    }
}

returnsRespond(200, array('success' => true, 'data' => array('duplicate' => false, 'orderFound' => $orderFound, 'changed' => $changed)));
