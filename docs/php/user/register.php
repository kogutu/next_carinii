<?php

require_once __DIR__ . '/_guard.php';
customerApiGuard();

/**
 * API do rejestracji klientów w Magento 1.9
 * Metoda: POST
 * Endpoint: /api/register.php
 * Dane: 
 * - firstname: imię (wymagane)
 * - lastname: nazwisko (wymagane)
 * - email: adres email (wymagane)
 * - password: hasło (wymagane)
 * - telephone: numer telefonu (opcjonalne)
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
$requiredFields = ['firstname', 'lastname', 'email', 'password'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || empty(trim($input[$field]))) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    apiResponse(false, 'Brakujące wymagane pola: ' . implode(', ', $missingFields), null, 400);
}

// Pobranie i oczyszczenie danych
$firstname = trim($input['firstname']);
$lastname = trim($input['lastname']);
$email = trim($input['email']);
$password = $input['password'];
$telephone = isset($input['telephone']) ? trim($input['telephone']) : '';

// Walidacja długości pól
if (strlen($firstname) < 2) {
    apiResponse(false, 'Imię musi mieć co najmniej 2 znaki', null, 400);
}

if (strlen($lastname) < 2) {
    apiResponse(false, 'Nazwisko musi mieć co najmniej 2 znaki', null, 400);
}

// Walidacja emaila
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiResponse(false, 'Nieprawidłowy format email', null, 400);
}

// Walidacja hasła
if (strlen($password) < 8) {
    apiResponse(false, 'Hasło musi mieć co najmniej 8 znaków', null, 400);
}

// Walidacja numeru telefonu (jeśli podano)
if (!empty($telephone)) {
    $cleanPhone = preg_replace('/[^\d\s\+\-\(\)]/', '', $telephone);
    if (preg_replace('/\D/', '', $cleanPhone) === '') {
        apiResponse(false, 'Nieprawidłowy format numeru telefonu', null, 400);
    }
}

try {
    $websiteId = Mage::app()->getStore()->getWebsiteId();
    $storeId = Mage::app()->getStore()->getId();

    // Sprawdzenie czy użytkownik już istnieje
    $existingCustomer = Mage::getModel('customer/customer');
    $existingCustomer->setWebsiteId($websiteId);
    $existingCustomer->loadByEmail($email);

    if ($existingCustomer->getId()) {
        apiResponse(false, 'Użytkownik z tym adresem email już istnieje', null, 409);
    }


    // Utworzenie nowego klienta
    $customer = Mage::getModel('customer/customer');
    $customer->setWebsiteId($websiteId);
    $customer->setStoreId($storeId);
    $customer->setFirstname($firstname);
    $customer->setLastname($lastname);
    $customer->setEmail($email);
    $customer->setPassword($password);

    // Zapisanie klienta
    $customer->save();

    // Jeśli podano numer telefonu, dodaj go jako atrybut
    if (!empty($telephone)) {
        try {
            $customer->setData('telephone', $telephone);
            $customer->save();
        } catch (Exception $e) {
            error_log('Nie udało się zapisać numeru telefonu: ' . $e->getMessage());
        }
    }

    // Przygotowanie danych odpowiedzi
    $customerInfo = [
        'id' => $customer->getId(),
        'email' => $customer->getEmail(),
        'firstname' => $customer->getFirstname(),
        'lastname' => $customer->getLastname(),
        'website_id' => $customer->getWebsiteId(),
        'created_at' => $customer->getCreatedAt(),
    ];

    if (!empty($telephone)) {
        $customerInfo['telephone'] = $telephone;
    }

    // Zwrócenie sukcesu
    apiResponse(true, 'Rejestracja zakończona pomyślnie', ['customer' => $customerInfo], 201);

} catch (Mage_Core_Exception $e) {
    apiResponse(false, 'Błąd podczas rejestracji: ' . $e->getMessage(), null, 400);
} catch (Exception $e) {
    error_log('API Register Error: ' . $e->getMessage());
    error_log('Stack trace: ' . $e->getTraceAsString());
    apiResponse(false, 'Wystąpił błąd podczas przetwarzania żądania', null, 500);
}