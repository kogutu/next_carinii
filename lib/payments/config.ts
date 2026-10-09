// Które metody płatności (i którego dostawcy) są dostępne — sterowane przez .env.
// Zmienne NEXT_PUBLIC_* muszą być czytane literalnie, żeby Next wstawił je do bundla przeglądarki.

export type WhiteLabelProvider = 'tpay' | 'p24' | 'off'
export type PaypoProvider = 'tpay' | 'payu' | 'off'
export type Toggle = 'on' | 'off'
// redirect = przekierowanie do panelu Tpay (działa u każdego agenta rozliczeniowego),
// onsite = płatność tokenem na naszej stronie (Google Pay: tylko agent Pekao)
export type WalletMode = 'redirect' | 'onsite'

const pick = <T extends string>(value: string | undefined, allowed: readonly T[], fallback: T): T =>
    (allowed as readonly string[]).includes(value ?? '') ? (value as T) : fallback

export const paymentConfig = {
    // white label: kto obsługuje daną metodę (p24 = stare przyciski Przelewy24, schowane domyślnie)
    blik: pick(process.env.NEXT_PUBLIC_PAY_BLIK, ['tpay', 'p24', 'off'], 'tpay'),
    googlepay: pick(process.env.NEXT_PUBLIC_PAY_GOOGLEPAY, ['tpay', 'p24', 'off'], 'tpay'),
    card: pick<'tpay' | 'off'>(process.env.NEXT_PUBLIC_PAY_CARD, ['tpay', 'off'], 'tpay'),
    applepay: pick<'tpay' | 'off'>(process.env.NEXT_PUBLIC_PAY_APPLEPAY, ['tpay', 'off'], 'tpay'),
    googlepayMode: pick<WalletMode>(process.env.NEXT_PUBLIC_PAY_GOOGLEPAY_MODE, ['redirect', 'onsite'], 'redirect'),
    applepayMode: pick<WalletMode>(process.env.NEXT_PUBLIC_PAY_APPLEPAY_MODE, ['redirect', 'onsite'], 'redirect'),
    paypo: pick(process.env.NEXT_PUBLIC_PAY_PAYPO, ['tpay', 'payu', 'off'], 'tpay'),
    // zwykłe przekierowania
    przelewy24: pick<Toggle>(process.env.NEXT_PUBLIC_PAY_P24, ['on', 'off'], 'on'),
    tpay: pick<Toggle>(process.env.NEXT_PUBLIC_PAY_TPAY, ['on', 'off'], 'on'),
    payu: pick<Toggle>(process.env.NEXT_PUBLIC_PAY_PAYU, ['on', 'off'], 'off'),
    // szybka płatność (Apple Pay / Google Pay) na karcie produktu i w mini-koszyku
    express: pick<Toggle>(process.env.NEXT_PUBLIC_PAY_EXPRESS, ['on', 'off'], 'on'),
} as const

export type PaymentConfig = typeof paymentConfig

export const tpayPublicConfig = {
    environment: pick(process.env.NEXT_PUBLIC_TPAY_ENV, ['sandbox', 'production'], 'sandbox'),
    // identyfikator sprzedawcy dla Google Pay (gatewayMerchantId)
    merchantId: process.env.NEXT_PUBLIC_TPAY_MERCHANT_ID ?? '',
    // identyfikator zatwierdzony w Google Pay & Wallet Console (wymagany tylko na produkcji)
    googleMerchantId: process.env.NEXT_PUBLIC_GOOGLE_MERCHANT_ID ?? '',
    // Merchant ID z Apple Developer (np. merchant.carnii) — sprawdzanie dostępności Apple Pay i walidacja przez QR
    appleMerchantId: process.env.NEXT_PUBLIC_APPLE_MERCHANT_ID ?? '',
} as const
