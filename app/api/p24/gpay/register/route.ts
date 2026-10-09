import { NextResponse } from 'next/server'
import { paymentConfig } from '@/lib/payments/config'
import { P24Error, registerGooglePayTransaction } from '@/lib/p24/gpay'
import { jsonError, loadUnpaidOrder } from '@/lib/tpay/service'

type RegisterBody = {
    oid?: string
    // token Google Pay (paymentMethodData.tokenizationData.token)
    token?: string
    // kwota zatwierdzona przez klienta w oknie Google Pay
    expectedAmount?: number
}

const AMOUNT_TOLERANCE = 0.01

// POST /api/p24/gpay/register — rejestruje transakcję Google Pay w Przelewy24. Kwota i e-mail pochodzą z zamówienia.
export async function POST(request: Request) {
    if (paymentConfig.googlepay !== 'p24') return jsonError('Google Pay przez Przelewy24 jest wyłączony', 403)

    const body: RegisterBody = await request.json().catch(() => ({}))
    if (!body.token || typeof body.token !== 'string') return jsonError('Brak tokenu Google Pay', 400)

    const loaded = await loadUnpaidOrder(body.oid)
    if ('response' in loaded) return loaded.response
    const { order } = loaded

    // klient nie może zostać obciążony inną kwotą niż ta, którą zatwierdził w oknie portfela
    if (typeof body.expectedAmount === 'number' && Math.abs(body.expectedAmount - order.amount) > AMOUNT_TOLERANCE) {
        console.error(`[p24] amount mismatch for ${order.incrementId}: wallet ${body.expectedAmount}, order ${order.amount}`)
        return jsonError('Kwota zamówienia różni się od zatwierdzonej w portfelu', 409, 'amount_changed')
    }

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin).replace(/\/$/, '')

    try {
        const { token } = await registerGooglePayTransaction({
            oid: order.incrementId,
            amountPln: order.amount,
            email: order.email,
            client: order.payerName,
            methodRefId: body.token,
            appUrl,
        })
        return NextResponse.json({ token })
    } catch (error) {
        console.error('[p24] register failed:', error instanceof P24Error ? error.message : error)
        return jsonError('Nie udało się zainicjować płatności. Spróbuj ponownie lub wybierz inną metodę.', 422)
    }
}
