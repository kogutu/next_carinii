import { NextResponse } from 'next/server'
import { paymentConfig } from '@/lib/payments/config'
import { getTpayConfig } from '@/lib/tpay/config'
import { initApplePaySession } from '@/lib/tpay/client'
import { isTpayMethodEnabled, jsonError, tpayErrorResponse } from '@/lib/tpay/service'

// Tpay zwraca sesję jako obiekt albo jako JSON zakodowany w base64
const decodeSession = (session: unknown): unknown => {
    if (typeof session !== 'string') return session
    try {
        return JSON.parse(Buffer.from(session, 'base64').toString('utf8'))
    } catch {
        return session
    }
}

// POST /api/tpay/applepay/session — walidacja sprzedawcy Apple Pay (wywoływana z onvalidatemerchant).
// Musi iść z backendu: /wallet/applepay/init wymaga autoryzacji.
export async function POST(request: Request) {
    if (!isTpayMethodEnabled('applepay') || paymentConfig.applepayMode !== 'onsite') {
        return jsonError('Apple Pay na stronie jest wyłączone', 403)
    }

    const { validationUrl } = await request.json().catch(() => ({}))
    let validationHost = ''
    try {
        const url = new URL(validationUrl)
        if (url.protocol === 'https:') validationHost = url.hostname
    } catch { }

    // adres walidacji podaje przeglądarka — przyjmujemy tylko domeny Apple
    if (!validationHost.endsWith('.apple.com')) return jsonError('Nieprawidłowy adres walidacji', 400)

    const { appleDomain, appleDisplayName } = getTpayConfig()
    // domena zarejestrowana w Apple i Tpay: z .env, a gdy jej brak — z nagłówków (za proxy hostname z request.url bywa wewnętrzny)
    const requestHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? new URL(request.url).host
    const domainName = appleDomain || requestHost.split(',')[0].trim().replace(/:\d+$/, '')

    try {
        const result = await initApplePaySession({
            domainName,
            displayName: appleDisplayName,
            validationUrl,
        })
        return NextResponse.json({ session: decodeSession(result.session) })
    } catch (error) {
        return tpayErrorResponse(error)
    }
}
