import { createHmac, timingSafeEqual } from 'node:crypto'

// Klient Partner API Wygodnych Zwrotów (logistyka przesyłki zwrotnej: kod nadania w punkcie, bez etykiety).
// Tylko po stronie serwera: klucz API nie może trafić do przeglądarki ani do repozytorium.
// Specyfikacja: https://integracje.wygodnezwroty.pl/integracje/api (docs/wygodne-zwroty.md).

const REQUEST_TIMEOUT_MS = 10_000
const MAX_ATTEMPTS = 3
const RETRY_BASE_DELAY_MS = 400

export type WygodneZwrotyConfig = {
    baseUrl: string
    apiKey: string
    mailboxHid: string
}

/** Konfiguracja ze zmiennych środowiskowych; null, gdy integracja nie jest skonfigurowana. */
export const getWygodneZwrotyConfig = (): WygodneZwrotyConfig | null => {
    const baseUrl = process.env.WYGODNE_ZWROTY_API_BASE_URL?.trim().replace(/\/+$/, '')
    const apiKey = process.env.WYGODNE_ZWROTY_API_KEY?.trim()
    const mailboxHid = process.env.WYGODNE_ZWROTY_MAILBOX_HID?.trim()
    return baseUrl && apiKey && mailboxHid ? { baseUrl, apiKey, mailboxHid } : null
}

// ───────────────────────── draft zwrotu ─────────────────────────

export type DraftProduct = {
    id: string
    name: string
    unit_price: string
    quantity: number | string
    link?: string
    unit?: string
    img?: string
    is_returnable?: boolean
    is_quantity_editable?: boolean
    attributes?: Record<string, string>
}

export type DraftClient = {
    name: string
    email: string
    city?: string
    address?: string
    postal_code?: string
    phone?: string
    country?: string
    state?: string
}

export type DraftOrder = {
    number: string
    // „2022-05-21 12:33:11”
    date_created: string
    currency: string
    products?: DraftProduct[]
    client: DraftClient
}

// shipment (domyślnie) kończy się nadaniem przesyłki; withdrawal to odstąpienie od umowy po stronie Wygodnych Zwrotów
export type ReturnFlow = 'shipment' | 'withdrawal'

export class WygodneZwrotyError extends Error {
    constructor(
        message: string,
        readonly status: number,
        readonly code: string = '',
    ) {
        super(message)
        this.name = 'WygodneZwrotyError'
    }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Błąd z odpowiedzi API: { failure, successful, mainError: { message, code }, errors: [...] }
const failureMessage = (json: any): { message: string; code: string } => ({
    message: String(json?.mainError?.message ?? json?.errors?.[0]?.message ?? ''),
    code: String(json?.mainError?.code ?? json?.errors?.[0]?.code ?? ''),
})

// 502 i błędy sieci ponawiamy z rosnącą przerwą; pozostałe odpowiedzi (400, 401, 403) są ostateczne
const isRetryable = (error: unknown): boolean => error instanceof WygodneZwrotyError && (error.status === 502 || error.status === 0)

const post = async (config: WygodneZwrotyConfig, path: string, body: unknown): Promise<any> => {
    let lastError: unknown

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (attempt > 0) await sleep(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))

        try {
            const response = await fetch(`${config.baseUrl}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-api-key': config.apiKey },
                body: JSON.stringify(body),
                cache: 'no-store',
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
            })
            const json = await response.json().catch(() => null)
            if (response.ok) return json

            const failure = failureMessage(json)
            throw new WygodneZwrotyError(failure.message || `HTTP ${response.status}`, response.status, failure.code)
        } catch (error) {
            // timeout i brak połączenia -> status 0 (też do ponowienia)
            lastError = error instanceof WygodneZwrotyError ? error : new WygodneZwrotyError('Brak połączenia z Wygodnymi Zwrotami', 0, 'network')
            if (!isRetryable(lastError)) throw lastError
        }
    }

    throw lastError
}

/**
 * Tworzy draft zwrotu i zwraca adres formularza Wygodnych Zwrotów, pod który przekierowujemy klienta.
 * Draft nie jest jeszcze zwrotem; kolejne wywołanie dla tego samego zamówienia nadpisuje poprzedni (API może odmówić
 * po przekroczeniu limitu darmowych draftów — wtedy status 400).
 */
export const createReturnDraft = async (input: {
    order: DraftOrder
    flow?: ReturnFlow
    // dokąd wraca klient po zakończeniu formularza; nadpisuje adres z ustawień sklepu
    callbackUrl?: string
}): Promise<{ redirectUrl: string }> => {
    const config = getWygodneZwrotyConfig()
    if (!config) throw new WygodneZwrotyError('Integracja z Wygodnymi Zwrotami nie jest skonfigurowana', 503, 'not_configured')

    const json = await post(config, '/partner-api/v1/returns/draft', {
        mailbox_hid: config.mailboxHid,
        order: { ...input.order, products: input.order.products ?? [] },
        flow: input.flow ?? 'shipment',
        // dane znamy z zamówienia — klient nie ma ich zmieniać w formularzu
        is_email_editable: false,
        is_order_number_editable: false,
        ...(input.callbackUrl ? { callback_url: input.callbackUrl } : {}),
    })

    const redirectUrl = typeof json?.redirect_url === 'string' ? json.redirect_url : ''
    // przekierowujemy klienta, więc przyjmujemy wyłącznie zwykły adres https
    try {
        if (new URL(redirectUrl).protocol !== 'https:') throw new Error('protocol')
    } catch {
        throw new WygodneZwrotyError('Nieprawidłowa odpowiedź Wygodnych Zwrotów', 502, 'bad_redirect')
    }
    return { redirectUrl }
}

// ───────────────────────── webhooki ─────────────────────────

/** Nagłówek X-Signature: HMAC-SHA-256 surowego body (hex, 64 znaki), sekretem jest klucz API. Porównanie w stałym czasie. */
export const verifyWebhookSignature = (rawBody: Buffer, signature: string | null, secret: string): boolean => {
    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) return false
    const expected = createHmac('sha256', secret).update(rawBody).digest()
    const received = Buffer.from(signature, 'hex')
    return received.length === expected.length && timingSafeEqual(received, expected)
}

// Zdarzenie return.created / return.updated (tylko pola, których używamy; dane osobowe klienta celowo pomijamy)
export type ReturnWebhookEvent = {
    event: 'return.created' | 'return.updated'
    event_id: string
    occurred_at: string
    mailbox_hid: string
    order_number: string
    return: {
        return_id: string
        status?: string
        estimated_refund_amount?: string
        currency?: string
        shipment?: {
            carrier?: string | null
            tracking_number?: string | null
            status?: string | null
            sent_at?: string | null
            delivered_at?: string | null
        } | null
    }
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '')

/** Sprawdza kształt zdarzenia; null = nie nadaje się do przetworzenia (zły JSON, brak identyfikatorów). */
export const parseReturnWebhookEvent = (value: unknown): ReturnWebhookEvent | null => {
    const input = value as any
    if (!input || typeof input !== 'object') return null
    if (input.event !== 'return.created' && input.event !== 'return.updated') return null
    if (!text(input.event_id) || !text(input.order_number) || !text(input.return?.return_id)) return null
    return input as ReturnWebhookEvent
}
