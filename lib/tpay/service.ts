import { NextResponse } from 'next/server'
import { paymentConfig } from '@/lib/payments/config'
import { getTpayConfig } from './config'
import { TpayError, type TpayCreateInput } from './client'
import { fetchPayableOrder, isValidOrderId, type PayableOrder } from './orders'

export const jsonError = (message: string, status: number, code?: string) =>
    NextResponse.json({ error: message, code }, { status })

export const clientIp = (request: Request): string => {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    return forwarded || request.headers.get('x-real-ip') || '127.0.0.1'
}

type LoadedOrder = { order: PayableOrder } | { response: NextResponse }

// Zamówienie do zapłaty: istnieje i nie jest jeszcze opłacone
export const loadUnpaidOrder = async (oid: unknown): Promise<LoadedOrder> => {
    if (!isValidOrderId(oid)) return { response: jsonError('Nieprawidłowy numer zamówienia', 400) }

    const order = await fetchPayableOrder(oid)
    if (!order) return { response: jsonError('Nie znaleziono zamówienia', 404) }
    if (order.paid) return { response: jsonError('Zamówienie jest już opłacone', 409, 'already_paid') }

    return { order }
}

export type TpayMethod = 'blik' | 'card' | 'googlepay' | 'applepay' | 'paypo' | 'tpay'

// Czy dana metoda jest włączona w .env dla Tpay (serwer nie ufa temu, co pokazał klient)
export const isTpayMethodEnabled = (method: TpayMethod): boolean => {
    switch (method) {
        case 'blik': return paymentConfig.blik === 'tpay'
        case 'card': return paymentConfig.card === 'tpay'
        case 'googlepay': return paymentConfig.googlepay === 'tpay'
        case 'applepay': return paymentConfig.applepay === 'tpay'
        case 'paypo': return paymentConfig.paypo === 'tpay'
        case 'tpay': return paymentConfig.tpay === 'on'
    }
}

type BaseTransactionInput = {
    order: PayableOrder
    request: Request
    pay?: TpayCreateInput['pay']
}

export const buildTransactionInput = ({ order, request, pay }: BaseTransactionInput): TpayCreateInput => {
    const { appUrl } = getTpayConfig()
    const oid = encodeURIComponent(order.incrementId)

    return {
        amount: Math.round(order.amount * 100) / 100,
        description: `Zamówienie ${order.incrementId}`,
        hiddenDescription: order.incrementId,
        payer: {
            email: order.email,
            name: order.payerName,
            ip: clientIp(request),
            userAgent: request.headers.get('user-agent') ?? undefined,
        },
        ...(pay ? { pay } : {}),
        callbacks: {
            payerUrls: {
                success: `${appUrl}/success/oid/${oid}?payment=tpay&result=success`,
                error: `${appUrl}/success/oid/${oid}?payment=tpay&result=error`,
            },
            notification: { url: `${appUrl}/api/tpay/notification` },
        },
    }
}

// Komunikat dla klienta; szczegóły techniczne zostają w logach serwera
export const tpayErrorResponse = (error: unknown) => {
    if (error instanceof TpayError) {
        console.error('[tpay]', error.status, error.codes, error.message)
        const isBlikCode = error.codes.some((code) => /blik|token|code/i.test(code))
        const message = isBlikCode
            ? 'Nieprawidłowy lub wygasły kod BLIK. Wygeneruj nowy kod w aplikacji banku.'
            : 'Nie udało się zainicjować płatności. Spróbuj ponownie lub wybierz inną metodę.'
        return jsonError(message, 422, error.codes[0])
    }
    console.error('[tpay] unexpected error:', error)
    return jsonError('Nie udało się zainicjować płatności. Spróbuj ponownie.', 500)
}
