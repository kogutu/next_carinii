<?php

require_once __DIR__ . '/_guard.php';
customerApiGuard();

/**
 * POST /directseo/nextjs/user/login.php  (tylko z serwera Next.js, nagłówek X-Api-Token)
 *
 * Logowanie klienta Magento 1.9.
 *  - hasło:   { "email", "password" }
 *  - zewnętrzne (Google/Apple/Facebook): { "email", "nextauth": true, "name", "provider", "providerId" }
 *    Next.js woła ten tryb dopiero po tym, jak dostawca OAuth potwierdził tożsamość; konto, które
 *    jeszcze nie istnieje, jest tworzone tutaj, w Magento sklepu (z losowym hasłem).
 *
 * Odpowiedź: { success, message, data: { customer: { id, email, firstname, lastname, ... } } }
 * Zgodny z PHP 7.0.
 */

require_once '/home/directseo/domains/sklep.carinii.com.pl/public_html/app/Mage.php';
Mage::app();

header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

const LOGIN_MAX_FAILURES = 8;     // błędnych haseł...
const LOGIN_WINDOW_SECONDS = 900; // ...w ciągu 15 minut blokuje kolejne próby dla tego adresu

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

function throttleFile($email)
{
    $dir = '/home/directseo/logs/login_throttle';
    if (!is_dir($dir)) {
        @mkdir($dir, 0750, true);
    }
    return $dir . '/' . sha1(strtolower($email)) . '.json';
}

function recentFailures($email)
{
    $file = throttleFile($email);
    if (!is_file($file)) {
        return [];
    }
    $times = json_decode((string) @file_get_contents($file), true);
    if (!is_array($times)) {
        return [];
    }
    $since = time() - LOGIN_WINDOW_SECONDS;
    return array_values(array_filter($times, function ($t) use ($since) {
        return $t >= $since;
    }));
}

function recordFailure($email)
{
    $times = recentFailures($email);
    $times[] = time();
    @file_put_contents(throttleFile($email), json_encode($times), LOCK_EX);
}

function clearFailures($email)
{
    @unlink(throttleFile($email));
}

function customerPayload($customer, $loginType)
{
    return [
        'id' => $customer->getId(),
        'email' => $customer->getEmail(),
        'firstname' => $customer->getFirstname(),
        'lastname' => $customer->getLastname(),
        'website_id' => $customer->getWebsiteId(),
        'created_at' => $customer->getCreatedAt(),
        'login_type' => $loginType
    ];
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    apiResponse(false, 'Metoda nie jest dozwolona. Użyj POST.', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
    $input = $_POST;
}

$nextauth = isset($input['nextauth']) && $input['nextauth'] === true;
$email = isset($input['email']) ? trim($input['email']) : '';
$password = isset($input['password']) ? (string) $input['password'] : '';

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    apiResponse(false, 'Nieprawidłowy adres e-mail', null, 400);
}
if (!$nextauth && $password === '') {
    apiResponse(false, 'Hasło jest wymagane', null, 400);
}
if ($nextauth && empty($input['providerId'])) {
    apiResponse(false, 'Brak identyfikatora dostawcy logowania', null, 400);
}

try {
    $websiteId = Mage::app()->getStore()->getWebsiteId();
    $customer = Mage::getModel('customer/customer');
    $customer->setWebsiteId($websiteId);
    $customer->loadByEmail($email);

    if ($nextauth) {
        // Tożsamość potwierdził dostawca OAuth po stronie Next.js (token zaufania sprawdzony wyżej)
        if (!$customer->getId()) {
            $name = isset($input['name']) ? trim($input['name']) : '';
            $parts = $name === '' ? [] : preg_split('/\s+/', $name, 2);

            $customer = Mage::getModel('customer/customer');
            $customer->setWebsiteId($websiteId);
            $customer->setStoreId(Mage::app()->getStore()->getId());
            $customer->setEmail($email);
            $customer->setFirstname(!empty($parts[0]) ? $parts[0] : 'Klient');
            $customer->setLastname(!empty($parts[1]) ? $parts[1] : 'Carinii');
            $customer->setPassword(bin2hex(random_bytes(16)));
            $customer->save();
        }

        apiResponse(true, 'Weryfikacja konta udana', ['customer' => customerPayload($customer, 'external')], 200);
    }

    // Logowanie hasłem: te same komunikaty dla "brak konta" i "złe hasło" (nie zdradzamy, kto ma konto)
    if (count(recentFailures($email)) >= LOGIN_MAX_FAILURES) {
        apiResponse(false, 'Zbyt wiele nieudanych prób. Spróbuj ponownie za kilkanaście minut.', null, 429);
    }

    $valid = false;
    if ($customer->getId()) {
        try {
            $valid = (bool) $customer->validatePassword($password);
        } catch (Exception $e) {
            $valid = false;
        }
    }

    if (!$valid) {
        recordFailure($email);
        apiResponse(false, 'Nieprawidłowe dane logowania', null, 401);
    }

    clearFailures($email);
    apiResponse(true, 'Logowanie udane', ['customer' => customerPayload($customer, 'standard')], 200);
} catch (Exception $e) {
    error_log('API Login Error: ' . $e->getMessage());
    apiResponse(false, 'Wystąpił błąd podczas przetwarzania żądania', null, 500);
}
