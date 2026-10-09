import paymentData from '../../data/shipping_payment_methods.json'
import { paymentConfig, type PaymentConfig } from './config'

export type PaymentMethodDef = {
    // kod zapisywany w Magento jako payment.method
    code: string
    mcode: string
    title: string
    description: string
    html_desc?: string
    shipping_methods: string[]
    exclude_hipping_methods: string[]
}

const NOT_WITH_COD_COURIER = {
    shipping_methods: ['*'],
    exclude_hipping_methods: ['flatrate48_flatrate48'],
}

const TPAY_METHODS: PaymentMethodDef[] = [
    {
        code: 'tpay_blik',
        mcode: 'tpay_blik',
        title: 'Blik',
        description: 'Po złożeniu zamówienia wpiszesz kod BLIK i zapłacisz.',
        ...NOT_WITH_COD_COURIER,
    },
    {
        code: 'tpay_card',
        mcode: 'tpay_card',
        title: 'Płatność kartą',
        description: 'Zapłać kartą, Google Pay lub Apple Pay.',
        ...NOT_WITH_COD_COURIER,
    },
    {
        code: 'tpay',
        mcode: 'tpay',
        title: 'Tpay',
        description: 'Po złożeniu zamówienia zostaniesz przeniesiony do Tpay w celu dokonania płatności.',
        ...NOT_WITH_COD_COURIER,
    },
]

const ALL_METHODS: PaymentMethodDef[] = [
    ...(paymentData.payment_methods as PaymentMethodDef[]),
    ...TPAY_METHODS,
]

// Kolejność na liście wyboru (jak w sklepie): BLIK, karta, PayPo, przelew, P24, Tpay
const DISPLAY_ORDER = [
    'tpay_blik',
    'devbackblik',
    'tpay_card',
    'carinii_sklep',
    'purchaseorder',
    'banktransfer',
    'cashondelivery',
    'dialcom_przelewy',
    'payu_account',
    'tpay',
]

const isEnabled = (code: string, config: PaymentConfig): boolean => {
    switch (code) {
        case 'tpay_blik':
            return config.blik === 'tpay'
        case 'devbackblik':
            return config.blik === 'p24'
        case 'tpay_card':
            return config.card === 'tpay' || config.googlepay !== 'off' || config.applepay === 'tpay'
        // Google Pay przez P24 jest przyciskiem w „Płatność kartą” (tpay_card), nie osobną opcją
        case 'carinii_sklep':
            return false
        case 'purchaseorder':
            return config.paypo !== 'off'
        case 'dialcom_przelewy':
            return config.przelewy24 === 'on'
        case 'payu_account':
            return config.payu === 'on'
        case 'tpay':
            return config.tpay === 'on'
        default:
            return true
    }
}

// Metody do wyboru w koszyku (i przy zmianie płatności) — wg .env
export const getPaymentMethods = (config: PaymentConfig = paymentConfig): PaymentMethodDef[] =>
    DISPLAY_ORDER
        .map((code) => ALL_METHODS.find((method) => method.code === code))
        .filter((method): method is PaymentMethodDef => !!method && isEnabled(method.code, config))

// Dowolna metoda po kodzie, także wyłączona w .env — dla istniejących zamówień
export const getPaymentMethod = (code: string): PaymentMethodDef | undefined =>
    ALL_METHODS.find((method) => method.code === code)
