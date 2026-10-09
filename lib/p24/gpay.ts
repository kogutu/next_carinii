import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// Przelewy24 REST API v1 — Google Pay on-site. Bezstanowo (bez globalnych zmiennych jak w p24-sdk.ts),
// kwota zawsze z zamówienia w sklepie. Konfiguracja z tych samych zmiennych środowiskowych co reszta integracji P24.

const API_PATH = '/api/v1'

// Id metody Google Pay w P24 (w kodzie dotąd używane 266); do potwierdzenia w panelu P24 przy przejściu na produkcję
export const getGooglePayMethodId = (): number => Number(process.env.P24_GOOGLEPAY_METHOD_ID) || 266

export type P24Config = {
    merchantId: number
    posId: number
    crcKey: string
    apiKey: string
    sandbox: boolean
    merchantName: string
}

export const getP24Config = (): P24Config => {
    const merchantId = Number(process.env.NEXT_PUBLIC_P24_MERCHANT_ID)

    if (process.env.P24_SANDBOX === 'true') {
        return {
            merchantId,
            posId: merchantId,
            crcKey: process.env.P24_SANDBOX_CRC_KEY ?? '',
            apiKey: process.env.P24_SANDBOX_API_KEY ?? '',
            sandbox: true,
            merchantName: process.env.P24_SANDBOX_MERCHANT_NAME || 'Carinii',
        }
    }

    return {
        merchantId,
        posId: Number(process.env.P24_POS_ID) || merchantId,
        crcKey: process.env.P24_CRC_KEY ?? '',
        apiKey: process.env.P24_API_KEY ?? '',
        sandbox: false,
        merchantName: process.env.P24_MERCHANT_NAME || 'Carinii',
    }
}

export const getP24BaseUrl = (config: P24Config): string =>
    config.sandbox ? 'https://sandbox.przelewy24.pl' : 'https://secure.przelewy24.pl'

// Podpis P24: SHA-384 z JSON-a o ściśle określonej kolejności pól
const sha384 = (data: Record<string, unknown>): string =>
    createHash('sha384').update(JSON.stringify(data)).digest('hex')

// sessionId niesie numer zamówienia, dzięki czemu powiadomienie da się przypisać bez bazy
export const createSessionId = (oid: string): string => `${oid}-p24-${randomBytes(4).toString('hex')}`

export const oidFromSessionId = (sessionId: string): string | null =>
    /^([\w-]{1,40})-p24-[0-9a-f]{8}$/.exec(sessionId)?.[1] ?? null

const authHeader = (config: P24Config): string =>
    `Basic ${Buffer.from(`${config.posId}:${config.apiKey}`).toString('base64')}`

export class P24Error extends Error {
    constructor(message: string, public readonly status: number) {
        super(message)
        this.name = 'P24Error'
    }
}

const request = async (config: P24Config, method: 'POST' | 'PUT', path: string, body: unknown) => {
    if (!config.merchantId || !config.apiKey || !config.crcKey) throw new P24Error('Brak konfiguracji Przelewy24 w .env', 500)

    const res = await fetch(`${getP24BaseUrl(config)}${API_PATH}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: authHeader(config) },
        body: JSON.stringify(body),
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new P24Error(`P24: ${data?.error ?? data?.code ?? res.status}`, res.status)
    return data
}

type RegisterInput = {
    oid: string
    amountPln: number
    email: string
    client: string
    // token Google Pay (paymentMethodData.tokenizationData.token)
    methodRefId: string
    appUrl: string
}

export const registerGooglePayTransaction = async (input: RegisterInput): Promise<{ token: string; sessionId: string }> => {
    const config = getP24Config()
    const sessionId = createSessionId(input.oid)
    const amount = Math.round(input.amountPln * 100)
    const currency = 'PLN'

    const data = await request(config, 'POST', '/transaction/register', {
        merchantId: config.merchantId,
        posId: config.posId,
        sessionId,
        amount,
        currency,
        description: `Zamówienie ${input.oid}`,
        email: input.email,
        client: input.client,
        country: 'PL',
        language: 'pl',
        // po 3DS klient wraca na stronę zamówienia, wynik potwierdza powiadomienie na urlStatus
        urlReturn: `${input.appUrl}/success/oid/${encodeURIComponent(input.oid)}?payment=p24&result=return`,
        urlStatus: `${input.appUrl}/api/p24/notification`,
        timeLimit: 15,
        encoding: 'UTF-8',
        method: getGooglePayMethodId(),
        methodRefId: input.methodRefId,
        sign: sha384({ sessionId, merchantId: config.merchantId, amount, currency, crc: config.crcKey }),
    })

    return { token: data.data.token, sessionId }
}

export type P24Notification = {
    merchantId: number
    posId: number
    sessionId: string
    amount: number
    originAmount: number
    currency: string
    orderId: number
    methodId: number
    statement: string
    sign: string
}

const safeEqual = (a: string, b: string): boolean => {
    const left = Buffer.from(a)
    const right = Buffer.from(b)
    return left.length === right.length && timingSafeEqual(left, right)
}

// Podpis powiadomienia: SHA-384 z pól w kolejności z dokumentacji P24 + klucz CRC
export const verifyNotificationSign = (notification: P24Notification, config = getP24Config()): boolean => {
    if (!config.crcKey || notification.merchantId !== config.merchantId) return false

    const { merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement } = notification
    const expected = sha384({ merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, crc: config.crcKey })
    return typeof notification.sign === 'string' && safeEqual(expected, notification.sign)
}

// Potwierdzenie transakcji w P24 (bez niego P24 nie rozlicza płatności)
export const verifyTransaction = async (
    input: { sessionId: string; orderId: number; amount: number; currency: string },
    config = getP24Config(),
): Promise<boolean> => {
    const { sessionId, orderId, amount, currency } = input
    const data = await request(config, 'PUT', '/transaction/verify', {
        merchantId: config.merchantId,
        posId: config.posId,
        sessionId,
        amount,
        currency,
        orderId,
        sign: sha384({ sessionId, orderId, amount, currency, crc: config.crcKey }),
    })
    return data?.data?.status === 'success'
}
