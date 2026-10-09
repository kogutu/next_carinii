<?php
/**
 * POST /directseo/nextjs/returns/lookup.php   (Next.js, X-Api-Token)
 * Body: { "orderNumber", "email", "customerId"?, "clientIp"? }
 *
 * Sprawdza, czy numer zamówienia pasuje do adresu e-mail (albo należy do zalogowanego klienta), i zwraca
 * to, co potrzebne do formularza: pozycje z dostępnymi ilościami oraz dotychczasowe zgłoszenia.
 * Celowo bez adresów i telefonów — dowodem własności jest tu numer + e-mail.
 */

require_once __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

$input = returnsInput();
$order = returnsFindOrder(
    isset($input['orderNumber']) ? $input['orderNumber'] : '',
    isset($input['email']) ? $input['email'] : '',
    isset($input['customerId']) ? (int) $input['customerId'] : 0,
    returnsClientIp($input)
);

returnsEnsureTable();
$existing = array();
foreach (returnsDb()->fetchAll(
    'SELECT ref, type, status, created_at, items FROM ' . RETURNS_TABLE . ' WHERE order_id = ? ORDER BY id DESC',
    array((int) $order->getId())
) as $row) {
    $existing[] = array(
        'ref' => $row['ref'],
        'type' => $row['type'],
        'status' => $row['status'],
        'createdAt' => $row['created_at'],
        'itemCount' => count((array) json_decode($row['items'], true)),
    );
}

$eligibility = returnsEligibility($order);
$days = returnsDaysSinceReceived($order);

returnsRespond(200, array('success' => true, 'data' => array(
    'orderNumber' => $order->getIncrementId(),
    'createdAt' => $order->getCreatedAt(),
    'status' => $order->getStatus(),
    'firstName' => returnsFirstName($order),
    'eligible' => $eligibility['allowed'],
    'ineligibleReason' => $eligibility['reason'],
    'daysSinceReceived' => $days,
    'returnWindowDays' => RETURNS_WINDOW_DAYS,
    'withinReturnWindow' => $days <= RETURNS_WINDOW_DAYS,
    'items' => returnsOrderItems($order),
    'existing' => $existing,
)));
