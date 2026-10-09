<?php

require_once __DIR__ . '/_guard.php';
customerApiGuard();


/**
 * API do pobierania danych klienta w Magento 1.9
 * Metoda: POST/GET
 * Endpoint: /api/get-user-data.php
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

if (!isset($input['uid'])) {
    apiResponse(false, 'Brakujące wymagane pole: uid', null, 400);
}

$uid = trim($input['uid']);

if (empty($uid)) {
    apiResponse(false, 'UID jest wymagany', null, 400);
}

try {
    // Pobranie danych klienta
    $customer = Mage::getModel('customer/customer')->load($uid);

    if (!$customer->getId()) {
        apiResponse(false, 'Użytkownik nie został znaleziony', null, 404);
    }

    // Przygotowanie danych użytkownika
    $userData = [
        'firstName' => $customer->getFirstname(),
        'lastName' => $customer->getLastname(),
        'email' => $customer->getEmail(),
        'phone' => null,
        'billingAddress' => null,
        'shippingAddress' => null
    ];

    // Pobranie domyślnego adresu rozliczeniowego
    $defaultBillingId = $customer->getDefaultBilling();
    if ($defaultBillingId) {
        try {
            $billingAddress = Mage::getModel('customer/address')->load($defaultBillingId);

            if ($billingAddress->getId()) {
                // Pobranie danych firmy
                $customerType = 'individual';
                $invoiceType = 'receipt';
                $companyName = '';
                $nip = '';

                if ($billingAddress->getCompany()) {
                    $customerType = 'company';
                    $companyName = $billingAddress->getCompany();
                    $invoiceType = 'invoice';
                }

                // Sprawdź VAT ID
                if ($billingAddress->getVatId()) {
                    $nip = $billingAddress->getVatId();
                }

                // Sprawdź custom attributes
                if ($billingAddress->getData('customer_type')) {
                    $customerType = $billingAddress->getData('customer_type');
                }
                if ($billingAddress->getData('invoice_type')) {
                    $invoiceType = $billingAddress->getData('invoice_type');
                }
                if (empty($nip) && $billingAddress->getData('nip')) {
                    $nip = $billingAddress->getData('nip');
                }

                $userData['billingAddress'] = [
                    'firstName' => $billingAddress->getFirstname(),
                    'lastName' => $billingAddress->getLastname(),
                    'customerType' => $customerType,
                    'invoiceType' => $invoiceType,
                    'companyName' => $companyName,
                    'nip' => $nip,
                    'street' => implode(', ', $billingAddress->getStreet()),
                    'city' => $billingAddress->getCity(),
                    'postal' => $billingAddress->getPostcode(),
                    'country' => $billingAddress->getCountryId(),
                    'region' => $billingAddress->getRegion() ? $billingAddress->getRegion() : ''
                ];

                if ($billingAddress->getTelephone()) {
                    $userData['phone'] = $billingAddress->getTelephone();
                }
            }
        } catch (Exception $e) {
            // Adres nie istnieje
        }
    }

    // Pobranie domyślnego adresu wysyłki
    $defaultShippingId = $customer->getDefaultShipping();
    if ($defaultShippingId) {
        try {
            $shippingAddress = Mage::getModel('customer/address')->load($defaultShippingId);

            if ($shippingAddress->getId()) {
                $userData['shippingAddress'] = [
                    'firstName' => $shippingAddress->getFirstname(),
                    'lastName' => $shippingAddress->getLastname(),
                    'street' => implode(', ', $shippingAddress->getStreet()),
                    'city' => $shippingAddress->getCity(),
                    'postal' => $shippingAddress->getPostcode(),
                    'country' => $shippingAddress->getCountryId(),
                    'region' => $shippingAddress->getRegion() ? $shippingAddress->getRegion() : '',
                    'sameAsBilling' => ($defaultShippingId === $defaultBillingId)
                ];

                if (!$userData['phone'] && $shippingAddress->getTelephone()) {
                    $userData['phone'] = $shippingAddress->getTelephone();
                }
            }
        } catch (Exception $e) {
            // Adres nie istnieje
        }
    }

    apiResponse(true, 'Dane użytkownika pobrane pomyślnie', $userData, 200);

} catch (Exception $e) {
    error_log('API Get User Data Error: ' . $e->getMessage());
    apiResponse(false, 'Wystąpił błąd podczas pobierania danych użytkownika', null, 500);
}