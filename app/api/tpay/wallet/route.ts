import { NextResponse } from 'next/server'
import { paymentConfig } from '@/lib/payments/config'
import { TPAY_CHANNEL, TPAY_GROUP } from '@/lib/tpay/config'
import { createTransaction, normalizeStatus, payTransaction } from '@/lib/tpay/client'
import {
    buildTransactionInput,
    isTpayMethodEnabled,
    jsonError,
    loadUnpaidOrder,
    tpayErrorResponse,
} from '@/lib/tpay/service'

type WalletBody = {
    oid?: string
    kind?: 'googlepay' | 'applepay'
    // token z Google Pay / Apple Pay zakodowany w base64
    token?: string
    // kwota zatwierdzona przez klienta w oknie portfela (szybka płatność)
    expectedAmount?: number
}

// POST /api/tpay/wallet — płatność tokenem portfela: tworzy transakcję i od razu ją opłaca.
// Gdy wymagane jest 3DS, zwraca redirectUrl.
export async function POST(request: Request) {
    const body: WalletBody = await request.json().catch(() => ({}))
    const { kind, token } = body

    if (kind !== 'googlepay' && kind !== 'applepay') return jsonError('Nieobsługiwany portfel', 400)
    if (!token || typeof token !== 'string') return jsonError('Brak tokenu płatności', 400)
    if (!isTpayMethodEnabled(kind)) return jsonError('Ta metoda płatności jest wyłączona', 403)
    // tryb „redirect” korzysta z /api/tpay/create — token portfela przyjmujemy tylko, gdy włączono płatność na stronie
    const mode = kind === 'googlepay' ? paymentConfig.googlepayMode : paymentConfig.applepayMode
    if (mode !== 'onsite') return jsonError('Płatność tokenem na stronie jest wyłączona dla tej metody', 403)

    const loaded = await loadUnpaidOrder(body.oid)
    if ('response' in loaded) return loaded.response
    const { order } = loaded

    // klient nie może zostać obciążony inną kwotą niż ta, którą zatwierdził w oknie portfela
    if (typeof body.expectedAmount === 'number' && Math.abs(body.expectedAmount - order.amount) > 0.01) {
        console.error(`[tpay] amount mismatch for ${order.incrementId}: wallet ${body.expectedAmount}, order ${order.amount}`)
        return jsonError('Kwota zamówienia różni się od zatwierdzonej w portfelu', 409, 'amount_changed')
    }

    try {
        const pay = kind === 'googlepay' ? { groupId: TPAY_GROUP.googlePay } : { channelId: TPAY_CHANNEL.applePay }
        const transaction = await createTransaction(buildTransactionInput({ order, request, pay }))

        const payment = await payTransaction(
            transaction.transactionId,
            kind === 'googlepay'
                ? { groupId: TPAY_GROUP.googlePay, googlePayPaymentData: token }
                : { channelId: TPAY_CHANNEL.applePay, applePayPaymentData: token },
        )

        return NextResponse.json({
            transactionId: transaction.transactionId,
            status: normalizeStatus(payment),
            // status „pending” przy portfelach oznacza wymagane 3DS
            redirectUrl: payment.transactionPaymentUrl ?? transaction.transactionPaymentUrl,
        })
    } catch (error) {
        return tpayErrorResponse(error)
    }
}
