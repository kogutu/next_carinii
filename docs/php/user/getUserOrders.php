<?php

require_once __DIR__ . '/_guard.php';
customerApiGuard();


/**
 * API do pobierania zamówień klienta w Magento 1.9
 * Metoda: POST/GET
 * Endpoint: /api/get-orders.php
 * Dane: uid (ID klienta)
 */

require_once '/home/directseo/domains/sklep.carinii.com.pl/public_html/app/Mage.php';
Mage::app();

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

function apiResponse($success, $message, $data = null, $statusCode = 200)
{
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $data
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    apiResponse(false, 'Metoda nie jest dozwolona.', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_POST ? $_POST : $_GET;
}

if (!isset($input['uid']) || empty(trim($input['uid']))) {
    apiResponse(false, 'Brakujące wymagane pole: uid', null, 400);
}

$uid = (int) trim($input['uid']);

// Opcjonalne filtry
$page = isset($input['page']) ? max(1, (int) $input['page']) : 1;
$limit = isset($input['limit']) ? min(100, max(1, (int) $input['limit'])) : 20;
$statusFilter = isset($input['status']) ? trim($input['status']) : null;

try {
    // Sprawdź czy klient istnieje
    $customer = Mage::getModel('customer/customer')->load($uid);

    if (!$customer->getId()) {
        apiResponse(false, 'Użytkownik nie został znaleziony', null, 404);
    }

    // Pobranie kolekcji zamówień
    $orderCollection = Mage::getModel('sales/order')->getCollection()
        ->addFieldToFilter('customer_id', $uid)
        ->setOrder('created_at', 'DESC');

    // Filtr statusu
    if ($statusFilter) {
        $orderCollection->addFieldToFilter('status', $statusFilter);
    }

    // Paginacja
    $totalCount = $orderCollection->getSize();
    $orderCollection->setPageSize($limit);
    $orderCollection->setCurPage($page);

    $orders = [];

    foreach ($orderCollection as $order) {
        // Produkty z zamówienia
        $items = [];
        foreach ($order->getAllVisibleItems() as $item) {
            $product = Mage::getModel('catalog/product')->load($item->getProductId());

            // Pobranie URL obrazka produktu
            $imageUrl = '';
            try {
                $imageUrl = (string) Mage::helper('catalog/image')
                    ->init($product, 'small_image')
                    ->resize(200, 200);
            } catch (Exception $e) {
                $imageUrl = '';
            }

            $items[] = [
                'item_id' => (int) $item->getItemId(),
                'product_id' => (int) $item->getProductId(),
                'sku' => $item->getSku(),
                'name' => $item->getName(),
                'qty_ordered' => (int) $item->getQtyOrdered(),
                'qty_shipped' => (int) $item->getQtyShipped(),
                'qty_refunded' => (int) $item->getQtyRefunded(),
                'price' => (float) $item->getPrice(),
                'price_incl_tax' => (float) $item->getPriceInclTax(),
                'row_total' => (float) $item->getRowTotal(),
                'row_total_incl_tax' => (float) $item->getRowTotalInclTax(),
                'discount_amount' => (float) $item->getDiscountAmount(),
                'tax_amount' => (float) $item->getTaxAmount(),
                'image_url' => $imageUrl,
                'product_options' => $item->getProductOptions() ? $item->getProductOptions() : null
            ];
        }

        // Adres rozliczeniowy
        $billingAddress = $order->getBillingAddress();
        $billing = null;
        if ($billingAddress) {
            $billing = [
                'firstName' => $billingAddress->getFirstname(),
                'lastName' => $billingAddress->getLastname(),
                'street' => implode(', ', $billingAddress->getStreet()),
                'city' => $billingAddress->getCity(),
                'postal' => $billingAddress->getPostcode(),
                'country' => $billingAddress->getCountryId(),
                'phone' => $billingAddress->getTelephone(),
                'company' => $billingAddress->getCompany(),
                'vat_id' => $billingAddress->getVatId()
            ];
        }

        // Adres dostawy
        $shippingAddress = $order->getShippingAddress();
        $shipping = null;
        if ($shippingAddress) {
            $shipping = [
                'firstName' => $shippingAddress->getFirstname(),
                'lastName' => $shippingAddress->getLastname(),
                'street' => implode(', ', $shippingAddress->getStreet()),
                'city' => $shippingAddress->getCity(),
                'postal' => $shippingAddress->getPostcode(),
                'country' => $shippingAddress->getCountryId(),
                'phone' => $shippingAddress->getTelephone()
            ];
        }

        // Historia statusów
        $statusHistory = [];
        foreach ($order->getStatusHistoryCollection() as $history) {
            $statusHistory[] = [
                'status' => $history->getStatus(),
                'comment' => $history->getComment(),
                'created_at' => $history->getCreatedAt()
            ];
        }

        // Dane płatności
        $payment = $order->getPayment();
        $paymentInfo = null;
        if ($payment) {
            $paymentInfo = [
                'method' => $payment->getMethod(),
                'method_title' => $payment->getMethodInstance()->getTitle()
            ];
        }

        // Dane przesyłki (tracking)
        $shipments = [];
        foreach ($order->getShipmentsCollection() as $shipment) {
            $tracks = [];
            foreach ($shipment->getAllTracks() as $track) {
                $tracks[] = [
                    'carrier' => $track->getCarrierCode(),
                    'title' => $track->getTitle(),
                    'number' => $track->getTrackNumber()
                ];
            }
            $shipments[] = [
                'shipment_id' => $shipment->getIncrementId(),
                'created_at' => $shipment->getCreatedAt(),
                'tracks' => $tracks
            ];
        }

        $orders[] = [
            'order_id' => (int) $order->getId(),
            'increment_id' => $order->getIncrementId(),
            'status' => $order->getStatus(),
            'status_label' => $order->getStatusLabel(),
            'state' => $order->getState(),
            'created_at' => $order->getCreatedAt(),
            'updated_at' => $order->getUpdatedAt(),
            'currency' => $order->getOrderCurrencyCode(),
            'subtotal' => (float) $order->getSubtotal(),
            'subtotal_incl_tax' => (float) $order->getSubtotalInclTax(),
            'shipping_amount' => (float) $order->getShippingAmount(),
            'shipping_incl_tax' => (float) $order->getShippingInclTax(),
            'shipping_description' => $order->getShippingDescription(),
            'discount_amount' => (float) $order->getDiscountAmount(),
            'tax_amount' => (float) $order->getTaxAmount(),
            'grand_total' => (float) $order->getGrandTotal(),
            'total_qty_ordered' => (int) $order->getTotalQtyOrdered(),
            'coupon_code' => $order->getCouponCode(),
            'payment' => $paymentInfo,
            'billing_address' => $billing,
            'shipping_address' => $shipping,
            'items' => $items,
            'shipments' => $shipments,
            'status_history' => $statusHistory
        ];
    }

    $totalPages = ceil($totalCount / $limit);

    apiResponse(true, 'Zamówienia pobrane pomyślnie', [
        'orders' => $orders,
        'pagination' => [
            'current_page' => $page,
            'per_page' => $limit,
            'total_count' => $totalCount,
            'total_pages' => $totalPages,
            'has_next' => $page < $totalPages,
            'has_prev' => $page > 1
        ]
    ], 200);

} catch (Exception $e) {
    error_log('API Get Orders Error: ' . $e->getMessage());
    apiResponse(false, 'Wystąpił błąd podczas pobierania zamówień', null, 500);
}