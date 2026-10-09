import { tpayPublicConfig } from '@/lib/payments/config'

// Oficjalny SDK Apple Pay JS: w Safari działa natywnie, a w Chrome/Edge/Firefox dodaje Apple Pay
// z płatnością przez kod QR (skanowany iPhonem). Wg dokumentacji Tpay nie używamy `integrity` dla wersji 1.latest.
const APPLE_PAY_SDK_URL = 'https://applepay.cdn-apple.com/jsapi/1.latest/apple-pay-sdk.js'

let sdkPromise: Promise<void> | null = null

export const loadApplePaySdk = (): Promise<void> => {
    if (typeof window === 'undefined') return Promise.resolve()
    if (sdkPromise) return sdkPromise

    sdkPromise = new Promise<void>((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>(`script[src="${APPLE_PAY_SDK_URL}"]`)
        const script = existing ?? Object.assign(document.createElement('script'), {
            src: APPLE_PAY_SDK_URL,
            crossOrigin: 'anonymous',
            async: true,
        })
        // błąd ładowania nie blokuje — zostaje natywny Apple Pay w Safari, jeśli jest
        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () => resolve())
        if (!existing) document.head.appendChild(script)
    })
    return sdkPromise
}

const CAPABILITIES_TIMEOUT_MS = 3000

const withTimeout = <T,>(promise: Promise<T>, ms: number): Promise<T> =>
    Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))])

// Czy pokazać przycisk Apple Pay. Wg dokumentacji Tpay ukrywamy go tylko przy `applePayUnsupported`.
// Apple Pay JS działa wyłącznie przez HTTPS — na http://localhost zgłasza błąd, co tu oznacza „niedostępne”.
export const detectApplePay = async (): Promise<boolean> => {
    try {
        await loadApplePaySdk()

        const Session = (window as any).ApplePaySession
        if (!Session) return false

        const merchantId = tpayPublicConfig.appleMerchantId
        if (merchantId && typeof Session.applePayCapabilities === 'function') {
            try {
                const capabilities = await withTimeout<{ paymentCredentialStatus?: string }>(
                    Session.applePayCapabilities(merchantId),
                    CAPABILITIES_TIMEOUT_MS,
                )
                return capabilities.paymentCredentialStatus !== 'applePayUnsupported'
            } catch {
                // przechodzimy do prostszego sprawdzenia
            }
        }

        // SDK w przeglądarkach innych niż Safari nie zwraca boolean — tylko jawne false oznacza brak Apple Pay
        return Session.canMakePayments?.() !== false
    } catch {
        return false
    }
}

// Przycisk Apple Pay tylko w Safari / na urządzeniach Apple (bez SDK) — dla przekierowania do panelu Tpay
export const isNativeApplePay = (): boolean =>
    typeof window !== 'undefined' && Boolean((window as any).ApplePaySession)
