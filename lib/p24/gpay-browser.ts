import { BASE_REQUEST, googleApi, loadGooglePayScript } from '@/lib/google-pay'

// Google Pay on-site przez Przelewy24 — część przeglądarkowa.
// Przepływ P24: token Google → rejestracja transakcji (nasz serwer) → skrypt .../bundle/payWithGoogle/{TOKEN} → charge().

export type P24GpayConfig = {
    merchantId: string
    merchantName: string
    environment: 'TEST' | 'PRODUCTION'
    baseUrl: string
}

export class P24PaymentError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message)
    }
}

let configPromise: Promise<P24GpayConfig> | null = null

export const getP24GpayConfig = (): Promise<P24GpayConfig> => {
    configPromise ??= fetch('/api/p24/gpay/config', { cache: 'no-store' })
        .then((res) => {
            if (!res.ok) throw new P24PaymentError('Nie udało się pobrać konfiguracji Google Pay')
            return res.json()
        })
        .catch((error) => {
            configPromise = null
            throw error
        })
    return configPromise
}

export const allowedPaymentMethods = (config: P24GpayConfig) => [
    {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: { gateway: 'przelewy24', gatewayMerchantId: config.merchantId },
        },
    },
]

// Klient Google Pay (lub null, gdy niedostępny w tej przeglądarce)
export const createPaymentsClient = async (
    config: P24GpayConfig,
    options: { callbacks?: Record<string, unknown> } = {},
) => {
    await loadGooglePayScript()

    const client = new (googleApi().payments.api.PaymentsClient)({
        environment: config.environment,
        ...(options.callbacks ? { paymentDataCallbacks: options.callbacks } : {}),
    })
    const { result } = await client.isReadyToPay({
        ...BASE_REQUEST,
        allowedPaymentMethods: allowedPaymentMethods(config),
    })
    return result ? client : null
}

export const registerP24Payment = async (oid: string, googleToken: string, expectedAmount?: number): Promise<string> => {
    const res = await fetch('/api/p24/gpay/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oid, token: googleToken, expectedAmount }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new P24PaymentError(data.error ?? 'Nie udało się zainicjować płatności', data.code)
    return data.token
}

// Opłaca zarejestrowaną transakcję skryptem P24. 3DS przekierowuje do banku, a stamtąd na urlReturn (strona zamówienia).
export const chargeWithP24Bundle = (baseUrl: string, p24Token: string): Promise<void> =>
    new Promise((resolve, reject) => {
        document.querySelectorAll('script[data-p24-gpay]').forEach((element) => element.remove())

        const script = document.createElement('script')
        script.src = `${baseUrl}/bundle/payWithGoogle/${encodeURIComponent(p24Token)}`
        script.dataset.p24Gpay = '1'
        script.onerror = () => reject(new P24PaymentError('Nie udało się załadować skryptu Przelewy24'))
        script.onload = () => {
            const api = (window as any).Przelewy24PayWithGoogle
            if (!api) return reject(new P24PaymentError('Brak obiektu Przelewy24PayWithGoogle'))

            const fail = (reason: string) => () => reject(new P24PaymentError(`Płatność Google Pay nie powiodła się (${reason}).`))
            api.config({
                errorCallback: fail('error'),
                exceptionCallback: fail('exception'),
                requestFailedCallback: fail('requestFailed'),
                completePaymentCallback: () => resolve(),
            })
            api.charge()
        }
        document.body.appendChild(script)
    })

const POLL_INTERVAL_MS = 3000

// Wynik potwierdza powiadomienie P24 → markPaid.php, więc czekamy aż zamówienie dostanie flagę „opłacone”.
export const waitForOrderPaid = async (oid: string, timeoutMs = 60_000): Promise<boolean> => {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline) {
        try {
            const res = await fetch(`/api/orders/${encodeURIComponent(oid)}`, { cache: 'no-store' })
            if (res.ok && (await res.json())?.pay) return true
        } catch {
            // chwilowy błąd sieci — próbujemy dalej
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
    return false
}
