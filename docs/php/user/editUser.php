<?php

require_once __DIR__ . '/_guard.php';
customerApiGuard();


/**
 * API do aktualizacji danych klienta w Magento 1.9
 * Metoda: POST
 * Endpoint: /api/update-customer.php
 * 
 * Obsługuje aktualizację:
 * - Danych osobowych (firstName, lastName)
 * - Adresu rozliczeniowego (billing)
 * - Adresu dostawy (shipping)
 * - Hasła (password)
 */

require_once '/home/directseo/domains/sklep.carinii.com.pl/public_html/app/Mage.php';
Mage::app();

// Nagłówki dla API
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Obsługa żądań OPTIONS (CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Główna funkcja API
function apiResponse($success, $message, $data = null, $statusCode = 200)
{
    http_response_code($statusCode);

    $response = [
        'success' => $success,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s'),
        'data' => $data
    ];

    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}

// Sprawdzenie metody żądania
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiResponse(false, 'Metoda nie jest dozwolona. Użyj POST.', null, 405);
}

// Pobranie danych wejściowych
$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    $input = $_POST;
}

// Walidacja wymaganych pól
if (!isset($input['uid']) || empty(trim($input['uid']))) {
    apiResponse(false, 'Brakujące wymagane pole: uid', null, 400);
}

if (!isset($input['type']) || empty(trim($input['type']))) {
    apiResponse(false, 'Brakujące wymagane pole: type', null, 400);
}

$uid = trim($input['uid']);
$type = trim($input['type']);

// Sprawdzenie poprawności typu
$allowedTypes = ['personal', 'billing', 'shipping', 'password'];
if (!in_array($type, $allowedTypes)) {
    apiResponse(false, 'Nieprawidłowy typ. Dozwolone: ' . implode(', ', $allowedTypes), null, 400);
}

try {
    // Pobranie klienta po ID
    $customer = Mage::getModel('customer/customer')->load($uid);

    if (!$customer->getId()) {
        apiResponse(false, 'Użytkownik o podanym ID nie istnieje', null, 404);
    }

    // Obsługa różnych typów aktualizacji
    switch ($type) {

        case 'personal':
            // Aktualizacja danych osobowych
            $updated = false;

            if (isset($input['firstName']) && !empty(trim($input['firstName']))) {
                $customer->setFirstname(trim($input['firstName']));
                $updated = true;
            }

            if (isset($input['lastName']) && !empty(trim($input['lastName']))) {
                $customer->setLastname(trim($input['lastName']));
                $updated = true;
            }

            if ($updated) {
                $customer->save();
                apiResponse(true, 'Dane osobowe zostały zaktualizowane', [
                    'customer' => [
                        'id' => $customer->getId(),
                        'firstName' => $customer->getFirstname(),
                        'lastName' => $customer->getLastname(),
                        'email' => $customer->getEmail()
                    ]
                ], 200);
            } else {
                apiResponse(false, 'Brak danych do aktualizacji', null, 400);
            }
            break;

        case 'billing':
            // Aktualizacja adresu rozliczeniowego
            if (!isset($input['billingAddress']) || !is_array($input['billingAddress'])) {
                apiResponse(false, 'Brakujące dane adresu rozliczeniowego', null, 400);
            }

            $billingData = $input['billingAddress'];

            // Walidacja wymaganych pól
            $requiredFields = ['street', 'city', 'postal', 'country'];
            foreach ($requiredFields as $field) {
                if (!isset($billingData[$field]) || empty(trim($billingData[$field]))) {
                    apiResponse(false, "Brakujące pole adresu: {$field}", null, 400);
                }
            }

            // Pobierz istniejący adres rozliczeniowy lub utwórz nowy
            $billingAddressId = $customer->getDefaultBilling();
            $address = null;

            if ($billingAddressId) {
                $address = Mage::getModel('customer/address')->load($billingAddressId);
                if (!$address->getId()) {
                    $address = Mage::getModel('customer/address');
                }
            } else {
                $address = Mage::getModel('customer/address');
            }

            // Ustaw imię i nazwisko
            $addressFirstName = isset($billingData['firstName']) && !empty($billingData['firstName'])
                ? $billingData['firstName']
                : $customer->getFirstname();
            $addressLastName = isset($billingData['lastName']) && !empty($billingData['lastName'])
                ? $billingData['lastName']
                : $customer->getLastname();

            // Ustaw dane adresu
            $address->setCustomerId($customer->getId());
            $address->setFirstname($addressFirstName);
            $address->setLastname($addressLastName);
            $address->setStreet([$billingData['street']]);
            $address->setCity($billingData['city']);
            $address->setPostcode($billingData['postal']);
            $address->setCountryId(getCountryCode($billingData['country']));

            // Dodaj telefon jeśli istnieje
            if (isset($input['phone'])) {
                $address->setTelephone($input['phone']);
            }

            // Ustaw jako domyślny adres rozliczeniowy
            $address->setIsDefaultBilling(true);

            // Zapisz dane firmy
            if (isset($billingData['customerType']) && $billingData['customerType'] === 'company') {
                if (isset($billingData['companyName'])) {
                    $address->setCompany($billingData['companyName']);
                }
                if (isset($billingData['nip'])) {
                    $address->setVatId($billingData['nip']);
                }
            }

            $address->save();

            apiResponse(true, 'Adres rozliczeniowy został zaktualizowany', [
                'address' => [
                    'id' => $address->getId(),
                    'firstName' => $address->getFirstname(),
                    'lastName' => $address->getLastname(),
                    'street' => $address->getStreet(),
                    'city' => $address->getCity(),
                    'postal' => $address->getPostcode(),
                    'country' => $address->getCountryId(),
                    'company' => $address->getCompany(),
                    'vat_id' => $address->getVatId()
                ]
            ], 200);
            break;

        case 'shipping':
            // Aktualizacja adresu dostawy
            if (!isset($input['shippingAddress']) || !is_array($input['shippingAddress'])) {
                apiResponse(false, 'Brakujące dane adresu dostawy', null, 400);
            }

            $shippingData = $input['shippingAddress'];

            // Jeśli sameAsBilling = true, skopiuj adres rozliczeniowy
            if (isset($shippingData['sameAsBilling']) && $shippingData['sameAsBilling'] === true) {
                $billingAddressId = $customer->getDefaultBilling();

                if (!$billingAddressId) {
                    apiResponse(false, 'Brak adresu rozliczeniowego do skopiowania', null, 400);
                }

                $billingAddress = Mage::getModel('customer/address')->load($billingAddressId);

                if (!$billingAddress->getId()) {
                    apiResponse(false, 'Nie znaleziono adresu rozliczeniowego', null, 404);
                }

                // Pobierz lub utwórz adres dostawy
                $shippingAddressId = $customer->getDefaultShipping();

                if ($shippingAddressId && $shippingAddressId != $billingAddressId) {
                    $address = Mage::getModel('customer/address')->load($shippingAddressId);
                    if (!$address->getId()) {
                        $address = Mage::getModel('customer/address');
                    }
                } else {
                    $address = Mage::getModel('customer/address');
                }

                // Skopiuj dane z adresu rozliczeniowego
                $address->setCustomerId($customer->getId());
                $address->setFirstname($billingAddress->getFirstname());
                $address->setLastname($billingAddress->getLastname());
                $address->setStreet($billingAddress->getStreet());
                $address->setCity($billingAddress->getCity());
                $address->setPostcode($billingAddress->getPostcode());
                $address->setCountryId($billingAddress->getCountryId());
                $address->setTelephone($billingAddress->getTelephone());
                $address->setCompany($billingAddress->getCompany());
                $address->setIsDefaultShipping(true);

                $address->save();

                apiResponse(true, 'Adres dostawy został skopiowany z adresu rozliczeniowego', [
                    'address' => [
                        'id' => $address->getId(),
                        'sameAsBilling' => true
                    ]
                ], 200);

            } else {
                // Walidacja wymaganych pól
                $requiredFields = ['street', 'city', 'postal', 'country'];
                foreach ($requiredFields as $field) {
                    if (!isset($shippingData[$field]) || empty(trim($shippingData[$field]))) {
                        apiResponse(false, "Brakujące pole adresu: {$field}", null, 400);
                    }
                }

                // Pobierz ID adresów
                $billingAddressId = $customer->getDefaultBilling();
                $shippingAddressId = $customer->getDefaultShipping();

                if ($shippingAddressId && $billingAddressId && $shippingAddressId === $billingAddressId) {
                    // Mamy jeden adres dla billing i shipping - utwórz nowy dla shipping
                    $address = Mage::getModel('customer/address');
                } elseif ($shippingAddressId) {
                    $address = Mage::getModel('customer/address')->load($shippingAddressId);
                    if (!$address->getId()) {
                        $address = Mage::getModel('customer/address');
                    }
                } else {
                    $address = Mage::getModel('customer/address');
                }

                // Ustaw imię i nazwisko
                $addressFirstName = isset($shippingData['firstName']) && !empty($shippingData['firstName'])
                    ? $shippingData['firstName']
                    : $customer->getFirstname();
                $addressLastName = isset($shippingData['lastName']) && !empty($shippingData['lastName'])
                    ? $shippingData['lastName']
                    : $customer->getLastname();

                // Ustaw dane adresu
                $address->setCustomerId($customer->getId());
                $address->setFirstname($addressFirstName);
                $address->setLastname($addressLastName);
                $address->setStreet([$shippingData['street']]);
                $address->setCity($shippingData['city']);
                $address->setPostcode($shippingData['postal']);
                $address->setCountryId(getCountryCode($shippingData['country']));

                // Dodaj telefon jeśli istnieje
                if (isset($input['phone'])) {
                    $address->setTelephone($input['phone']);
                }

                // Ustaw jako domyślny adres dostawy
                $address->setIsDefaultShipping(true);

                $address->save();

                apiResponse(true, 'Adres dostawy został zaktualizowany', [
                    'address' => [
                        'id' => $address->getId(),
                        'firstName' => $address->getFirstname(),
                        'lastName' => $address->getLastname(),
                        'street' => $address->getStreet(),
                        'city' => $address->getCity(),
                        'postal' => $address->getPostcode(),
                        'country' => $address->getCountryId(),
                        'sameAsBilling' => false
                    ]
                ], 200);
            }
            break;

        case 'password':
            // Zmiana hasła
            if (!isset($input['currentPassword']) || empty($input['currentPassword'])) {
                apiResponse(false, 'Brakujące pole: currentPassword', null, 400);
            }

            if (!isset($input['newPassword']) || empty($input['newPassword'])) {
                apiResponse(false, 'Brakujące pole: newPassword', null, 400);
            }

            $currentPassword = $input['currentPassword'];
            $newPassword = $input['newPassword'];

            // Walidacja nowego hasła
            if (strlen($newPassword) < 8) {
                apiResponse(false, 'Nowe hasło musi mieć co najmniej 8 znaków', null, 400);
            }

            try {
                // Zmiana hasła - w Magento 1.9 ustawiamy nowe hasło bezpośrednio
                $customer->setPassword($newPassword);
                $customer->save();

                apiResponse(true, 'Hasło zostało zmienione', null, 200);

            } catch (Mage_Core_Exception $e) {
                apiResponse(false, 'Błąd podczas zmiany hasła: ' . $e->getMessage(), null, 500);
            } catch (Exception $e) {
                apiResponse(false, 'Wystąpił błąd podczas zmiany hasła', null, 500);
            }
            break;

        default:
            apiResponse(false, 'Nieobsługiwany typ operacji', null, 400);
    }

} catch (Mage_Core_Exception $e) {
    apiResponse(false, 'Błąd podczas aktualizacji: ' . $e->getMessage(), null, 400);
} catch (Exception $e) {
    error_log('API Update Customer Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    apiResponse(false, 'Wystąpił błąd podczas przetwarzania żądania', null, 500);
}

/**
 * Funkcja pomocnicza do mapowania nazw krajów na kody ISO
 */
function getCountryCode($countryName)
{
    $countryMap = [
        'Polska' => 'PL',
        'Poland' => 'PL',
        'Niemcy' => 'DE',
        'Germany' => 'DE',
        'Wielka Brytania' => 'GB',
        'United Kingdom' => 'GB',
        'Francja' => 'FR',
        'France' => 'FR',
        'Włochy' => 'IT',
        'Italy' => 'IT',
        'Hiszpania' => 'ES',
        'Spain' => 'ES',
        'Czechy' => 'CZ',
        'Czech Republic' => 'CZ',
        'Słowacja' => 'SK',
        'Slovakia' => 'SK',
        'Ukraina' => 'UA',
        'Ukraine' => 'UA',
        'Litwa' => 'LT',
        'Lithuania' => 'LT',
    ];

    if (strlen($countryName) === 2) {
        return strtoupper($countryName);
    }

    if (isset($countryMap[$countryName])) {
        return $countryMap[$countryName];
    }

    return 'PL';
}