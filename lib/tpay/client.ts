import { getTpayConfig } from './config'

const REQUEST_TIMEOUT_MS = 15000
// odnawiamy token chwilę przed wygaśnięciem
const TOKEN_SAFETY_MARGIN_MS = 120_000

export class TpayError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly codes: string[] = [],
    ) {
        super(message)
        this.name = 'TpayError'
    }
}

type TpayApiError = { errorCode?: string; errorMessage?: string; fieldName?: string }

export type TpayTransaction = {
    result?: string
    transactionId: string
    status?: string
    title?: string
    amount?: number
    paid?: number
    hiddenDescription?: string
    transactionPaymentUrl?: string
    payments?: { status?: string; method?: string; errors?: TpayApiError[] }
    errors?: TpayApiError[]
}

export type TpayCreateInput = {
    amount: number
    description: string
    // numer zamówienia — wraca w webhooku jako tr_crc
    hiddenDescription: string
    payer: { email: string; name: string; ip?: string; userAgent?: string }
    pay?: {
        groupId?: number
        channelId?: number
        blikPaymentData?: { blikToken: string }
    }
    callbacks: {
        payerUrls: { success: string; error: string }
        notification: { url: string }
    }
}

let tokenCache: { token: string; expiresAt: number } | null = null

const fetchWithTimeout = (url: string, init: RequestInit) =>
    fetch(url, { ...init, cache: 'no-store', signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })

const getAccessToken = async (forceRefresh = false): Promise<string> => {
    if (!forceRefresh && tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token

    const { apiUrl, clientId, clientSecret } = getTpayConfig()
    if (!clientId || !clientSecret) throw new TpayError('Brak TPAY_CLIENT_ID / TPAY_CLIENT_SECRET', 500)

    const res = await fetchWithTimeout(`${apiUrl}/oauth/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
    })
    if (!res.ok) throw new TpayError('Autoryzacja w Tpay nie powiodła się', res.status)

    const data = await res.json()
    tokenCache = {
        token: data.access_token,
        expiresAt: Date.now() + Math.max(0, Number(data.expires_in) * 1000 - TOKEN_SAFETY_MARGIN_MS),
    }
    return tokenCache.token
}

const extractErrors = (body: any): TpayApiError[] =>
    [...(body?.errors ?? []), ...(body?.payments?.errors ?? [])]

const request = async <T>(method: 'GET' | 'POST', path: string, body?: unknown, retried = false): Promise<T> => {
    const { apiUrl } = getTpayConfig()
    const token = await getAccessToken(retried)

    const res = await fetchWithTimeout(`${apiUrl}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    // token mógł zostać unieważniony — jedno ponowienie z nowym tokenem
    if (res.status === 401 && !retried) return request<T>(method, path, body, true)

    const data = await res.json().catch(() => ({}))
    const errors = extractErrors(data)
    if (!res.ok || data?.result === 'failed' || errors.length > 0) {
        const codes = errors.map((error) => error.errorCode ?? '').filter(Boolean)
        const message = errors.map((error) => error.errorMessage).filter(Boolean).join('; ') || `Tpay: błąd ${res.status}`
        throw new TpayError(message, res.status || 502, codes)
    }
    return data as T
}

export const createTransaction = (input: TpayCreateInput) =>
    request<TpayTransaction>('POST', '/transactions', input)

export const payTransaction = (transactionId: string, body: Record<string, unknown>) =>
    request<TpayTransaction>('POST', `/transactions/${encodeURIComponent(transactionId)}/pay`, body)

export const getTransaction = (transactionId: string) =>
    request<TpayTransaction>('GET', `/transactions/${encodeURIComponent(transactionId)}`)

export const initApplePaySession = (input: { domainName: string; displayName: string; validationUrl: string }) =>
    request<{ session?: unknown }>('POST', '/wallet/applepay/init', input)

type TpayChannel = { id: number; name?: string; fullName?: string }

let channelsCache: { channels: TpayChannel[]; expiresAt: number } | null = null
const CHANNELS_TTL_MS = 60 * 60 * 1000

const listChannels = async (): Promise<TpayChannel[]> => {
    if (channelsCache && Date.now() < channelsCache.expiresAt) return channelsCache.channels

    const data = await request<{ channels?: TpayChannel[] }>('GET', '/transactions/channels')
    const channels = data.channels ?? []
    channelsCache = { channels, expiresAt: Date.now() + CHANNELS_TTL_MS }
    return channels
}

// Id kanału po nazwie (np. PayPo) — z listy kanałów Tpay; env może wymusić stałe id
export const findChannelId = async (nameFragment: string, override: number | null): Promise<number | null> => {
    if (override) return override

    const needle = nameFragment.toLowerCase()
    const channel = (await listChannels()).find((item) =>
        `${item.name ?? ''} ${item.fullName ?? ''}`.toLowerCase().includes(needle),
    )
    return channel?.id ?? null
}

// Status z Tpay sprowadzony do trzech wartości używanych w UI
export type NormalizedStatus = 'paid' | 'pending' | 'failed'

const PAID_STATUSES = ['paid', 'correct', 'success']
const FAILED_STATUSES = ['declined', 'error', 'failed', 'chargeback', 'refund', 'canceled', 'cancelled']

export const normalizeStatus = (transaction: Pick<TpayTransaction, 'status' | 'payments'>): NormalizedStatus => {
    const status = (transaction.status ?? transaction.payments?.status ?? '').toLowerCase()
    if (PAID_STATUSES.includes(status)) return 'paid'
    if (FAILED_STATUSES.includes(status)) return 'failed'
    return 'pending'
}
