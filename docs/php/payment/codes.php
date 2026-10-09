<?php
/**
 * Kody metod płatności aplikacji Next.js a metody zarejestrowane w Magento.
 *
 * Magento przyjmuje tylko zarejestrowane metody płatności (modułami), a aplikacja Next.js rozróżnia więcej
 * opcji niż Magento zna (np. "Płatność kartą" i "Tpay" to w Magento jedna metoda "tpay").
 * Dlatego do Magento idzie metoda zarejestrowana, a "prawdziwy" kod aplikacji i tytuł są zapisywane
 * w additional_information płatności (app_payment_code, method_title) i zwracane przez orders/index.php.
 *
 * Zgodny z PHP 7.0.
 */

/** kod aplikacji => array(metoda zarejestrowana w Magento, tytuł wyświetlany klientowi) */
function nextPaymentAliases()
{
    return array(
        'tpay_blik' => array('devbackblik', 'Blik'),
        'tpay_card' => array('tpay', 'Płatność kartą'),
    );
}

/** Metoda zarejestrowana w Magento dla kodu z aplikacji (kody niealiasowane przechodzą bez zmian). */
function magentoPaymentCode($appCode)
{
    $aliases = nextPaymentAliases();
    return isset($aliases[$appCode]) ? $aliases[$appCode][0] : $appCode;
}

/**
 * Zapisuje w płatności kod aplikacji i tytuł (dla aliasów) albo czyści je (dla zwykłych kodów),
 * żeby po zmianie metody nie zostały stare dane.
 */
function applyAppPaymentInfo($payment, $appCode)
{
    $aliases = nextPaymentAliases();

    if (isset($aliases[$appCode])) {
        $payment->setAdditionalInformation('app_payment_code', $appCode);
        $payment->setAdditionalInformation('method_title', $aliases[$appCode][1]);
    } else {
        $payment->unsAdditionalInformation('app_payment_code');
        $payment->unsAdditionalInformation('method_title');
    }
}
