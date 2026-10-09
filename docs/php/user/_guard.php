<?php
/**
 * Wspólna kontrola dostępu skryptów /directseo/nextjs/user/*.php i /directseo/nextjs/returns/*.php.
 *
 * Te skrypty przyjmują identyfikator klienta ("uid") i nie sprawdzają sesji, więc mogą być wywoływane
 * WYŁĄCZNIE z serwera aplikacji Next.js, który zna tajny token (customer_api_token w
 * payment/config.local.php) i sam ustala uid z zalogowanej sesji. Przeglądarka nigdy nie woła ich bezpośrednio.
 *
 * Nagłówek: X-Api-Token: <customer_api_token>
 *
 * Zgodny z PHP 7.0.
 */

function customerApiGuard()
{
    $path = __DIR__ . '/../payment/config.local.php';
    if (function_exists('opcache_invalidate')) {
        @opcache_invalidate($path, true);
    }
    $config = require $path;
    $expected = isset($config['customer_api_token']) ? (string) $config['customer_api_token'] : '';
    $given = isset($_SERVER['HTTP_X_API_TOKEN']) ? (string) $_SERVER['HTTP_X_API_TOKEN'] : '';

    // brak skonfigurowanego tokenu = dostęp zamknięty (nigdy otwarty)
    if ($expected === '' || $given === '' || !hash_equals($expected, $given)) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(array('success' => false, 'message' => 'Brak dostępu', 'data' => null));
        exit;
    }
}
