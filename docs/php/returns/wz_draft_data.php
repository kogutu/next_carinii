<?php
/**
 * POST /directseo/nextjs/returns/wz_draft_data.php   (Next.js, X-Api-Token)
 * Body: { orderNumber, ref, email, customerId?, clientIp? }
 *
 * Dane do draftu zwrotu w Wygodnych Zwrotach (POST /partner-api/v1/returns/draft, pole `order`): numer i data zamówienia,
 * waluta, klient (imię i nazwisko z oświadczenia + e-mail z zamówienia) oraz WYŁĄCZNIE pozycje objęte oświadczeniem o odstąpieniu.
 * Dowodem własności jest numer zamówienia + e-mail (albo właściciel konta) oraz numer potwierdzenia ref (OD-…) tego zamówienia.
 * Adresu i telefonu klienta nie przekazujemy (minimalizacja danych) — formularz Wygodnych Zwrotów dopyta o nie sam.
 * Zgodny z PHP 7.0.
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

$ref = isset($input['ref']) ? trim((string) $input['ref']) : '';
if (!preg_match('/^OD-\d{6}-[A-Z0-9]{5}$/', $ref)) {
    returnsFail(400, 'Nieprawidłowy numer potwierdzenia');
}

returnsEnsureTable();
$record = returnsDb()->fetchRow(
    'SELECT items, full_name FROM ' . RETURNS_TABLE . " WHERE ref = ? AND order_id = ? AND type = 'odstapienie' AND status <> 'rejected'",
    array($ref, (int) $order->getId())
);
if (!$record) {
    returnsFail(404, 'Nie znaleźliśmy oświadczenia o odstąpieniu dla tego zamówienia.', 'withdrawal_not_found');
}

// pozycje zamówienia (cena, zdjęcie, rozmiar) wg identyfikatorów zapisanych w oświadczeniu
$orderItems = array();
foreach (returnsOrderItems($order) as $item) {
    $orderItems[$item['itemId']] = $item;
}

$products = array();
foreach ((array) json_decode($record['items'], true) as $declared) {
    $itemId = isset($declared['itemId']) ? (int) $declared['itemId'] : 0;
    if (!isset($orderItems[$itemId])) {
        continue;
    }
    $item = $orderItems[$itemId];
    $product = array(
        'id' => (string) $item['sku'],
        'name' => trim(explode('CARINII--', (string) $item['name'])[0]),
        'unit_price' => number_format((float) $item['price'], 2, '.', ''),
        'quantity' => (int) $declared['qty'],
        'unit' => 'szt',
        // zakres zwrotu wynika z oświadczenia — klient nie dobiera pozycji ani ilości w formularzu
        'is_returnable' => true,
        'is_quantity_editable' => false,
        'attributes' => $item['size'] !== '' ? array('size' => (string) $item['size']) : new stdClass(),
    );
    if ($item['image'] !== '') {
        $product['img'] = $item['image'];
    }
    $products[] = $product;
}
if (!$products) {
    returnsFail(422, 'Brak produktów objętych oświadczeniem.', 'no_products');
}

try {
    $created = new DateTime($order->getCreatedAt(), new DateTimeZone('UTC'));
    $created->setTimezone(new DateTimeZone('Europe/Warsaw'));
    $dateCreated = $created->format('Y-m-d H:i:s');
} catch (Exception $e) {
    $dateCreated = gmdate('Y-m-d H:i:s');
}

$billing = $order->getBillingAddress();
$client = array(
    'name' => $record['full_name'] !== '' ? $record['full_name'] : trim($order->getCustomerFirstname() . ' ' . $order->getCustomerLastname()),
    'email' => $order->getCustomerEmail(),
);
if ($billing && $billing->getCountryId()) {
    $client['country'] = $billing->getCountryId();
}

returnsRespond(200, array('success' => true, 'data' => array('order' => array(
    'number' => $order->getIncrementId(),
    'date_created' => $dateCreated,
    'currency' => $order->getOrderCurrencyCode() ? $order->getOrderCurrencyCode() : 'PLN',
    'products' => $products,
    'client' => $client,
))));
