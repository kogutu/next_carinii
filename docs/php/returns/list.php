<?php
/**
 * POST /directseo/nextjs/returns/list.php   (Next.js, X-Api-Token)
 * Body: { "customerId", "email" }  — z zalogowanej sesji; zwraca zgłoszenia klienta (konto albo e-mail).
 */

require_once __DIR__ . '/_lib.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    returnsFail(405, 'Dozwolona tylko metoda POST');
}

$input = returnsInput();
$customerId = isset($input['customerId']) ? (int) $input['customerId'] : 0;
$email = isset($input['email']) ? strtolower(trim((string) $input['email'])) : '';

if ($customerId < 1 && $email === '') {
    returnsFail(400, 'Brak danych klienta');
}

returnsEnsureTable();
$rows = returnsDb()->fetchAll(
    'SELECT ref, order_increment, type, status, reason, resolution, items, photos, created_at FROM ' . RETURNS_TABLE
    . ' WHERE (customer_id = ? AND ? > 0) OR (email = ? AND ? <> \'\') ORDER BY id DESC LIMIT 50',
    array($customerId, $customerId, $email, $email)
);

$list = array();
foreach ($rows as $row) {
    $list[] = array(
        'ref' => $row['ref'],
        'orderNumber' => $row['order_increment'],
        'type' => $row['type'],
        'status' => $row['status'],
        'reason' => $row['reason'],
        'resolution' => $row['resolution'],
        'items' => json_decode($row['items'], true) ?: array(),
        'photoCount' => count((array) json_decode($row['photos'], true)),
        'createdAt' => $row['created_at'],
    );
}

returnsRespond(200, array('success' => true, 'data' => array('returns' => $list)));
