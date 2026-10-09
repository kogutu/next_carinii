// Wywołania naszego backendu Tpay z przeglądarki (klucze Tpay nigdy nie trafiają do klienta).

export type PaymentStatus = 'paid' | 'pending' | 'failed'

export type TpayStartResult = {
    transactionId: string
    status: PaymentStatus
    redirectUrl?: string
}

export class PaymentRequestError extends Error {
    constructor(message: string, public readonly code?: string) {
        super(message)
    }
}

const post = async <T>(url: string, body: unknown): Promise<T> => {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new PaymentRequestError(data.error ?? 'Nie udało się zainicjować płatności', data.code)
    return data as T
}

export const startBlikPayment = (oid: string, blikToken: string) =>
    post<TpayStartResult>('/api/tpay/create', { oid, method: 'blik', blikToken })

export type RedirectMethod = 'card' | 'tpay' | 'paypo' | 'googlepay' | 'applepay'

export const startRedirectPayment = (oid: string, method: RedirectMethod) =>
    post<TpayStartResult>('/api/tpay/create', { oid, method })

export const payWithWallet = (oid: string, kind: 'googlepay' | 'applepay', token: string, expectedAmount?: number) =>
    post<TpayStartResult>('/api/tpay/wallet', { oid, kind, token, expectedAmount })

export const createApplePaySession = (validationUrl: string) =>
    post<{ session: unknown }>('/api/tpay/applepay/session', { validationUrl })

export const fetchPaymentStatus = async (oid: string, transactionId: string): Promise<PaymentStatus> => {
    const res = await fetch(`/api/tpay/status?oid=${encodeURIComponent(oid)}&transactionId=${encodeURIComponent(transactionId)}`, {
        cache: 'no-store',
    })
    if (!res.ok) return 'pending'
    return (await res.json()).status as PaymentStatus
}

const POLL_INTERVAL_MS = 2000

// Odpytuje status do skutku (paid/failed) albo do upływu czasu; wynik „pending” po timeoucie = nie wiadomo.
export const waitForPayment = async (
    oid: string,
    transactionId: string,
    { timeoutMs = 150_000, signal }: { timeoutMs?: number; signal?: AbortSignal } = {},
): Promise<PaymentStatus> => {
    const deadline = Date.now() + timeoutMs

    while (Date.now() < deadline && !signal?.aborted) {
        const status = await fetchPaymentStatus(oid, transactionId)
        if (status !== 'pending') return status
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS))
    }
    return 'pending'
}
