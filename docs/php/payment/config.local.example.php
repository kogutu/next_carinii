<?php
// WZÓR — prawdziwy plik config.local.php leży tylko na serwerze (payment/config.local.php, uprawnienia 640)
// i jest blokowany przez payment/.htaccess. NIE commitować prawdziwych wartości.
return array(
    // ten sam token musi być w .env aplikacji jako ORDER_MARK_PAID_TOKEN
    'mark_paid_token' => 'ZAMIEN_NA_LOSOWY_TOKEN_48_ZNAKOW',
    // baza z tabelą payment_callbacks (ta sama, której używa orders/index.php)
    'db' => array('dsn' => 'mysql:host=HOST;dbname=NAZWA;charset=utf8mb4', 'user' => 'UZYTKOWNIK', 'pass' => 'HASLO'),
);
