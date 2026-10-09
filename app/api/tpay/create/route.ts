import { NextResponse } from 'next/server'
import { TPAY_CHANNEL, TPAY_GROUP, getTpayConfig } from '@/lib/tpay/config'
import { createTransaction, findChannelId } from '@/lib/tpay/client'
import {
    buildTransactionInput,
    isTpayMethodEnabled,
    jsonError,
    loadUnpaidOrder,
    tpayErrorResponse,
    type TpayMethod,
} from '@/lib/tpay/service'

type CreateBody = {
    oid?: string
    method?: TpayMethod
    blikToken?: string
}

const SUPPORTED_METHODS: readonly TpayMethod[] = ['blik', 'card', 'tpay', 'paypo', 'googlepay', 'applepay']
const BLIK_CODE = /^\d{6}$/

// POST /api/tpay/create — BLIK Level 0 (kod na stronie) albo przekierowanie do panelu Tpay
// (karta / Tpay / PayPo / Google Pay / Apple Pay). Płatność tokenem portfela na stronie: /api/tpay/wallet.
export async function POST(request: Request) {
    const body: CreateBody = await request.json().catch(() => ({}))
    const method = SUPPORTED_METHODS.find((allowed) => allowed === body.method)

    if (!method) return jsonError('Nieobsługiwana metoda płatności', 400)
    if (!isTpayMethodEnabled(method)) return jsonError('Ta metoda płatności jest wyłączona', 403)

    const loaded = await loadUnpaidOrder(body.oid)
    if ('response' in loaded) return loaded.response
    const { order } = loaded

    try {
        if (method === 'blik') {
            if (!body.blikToken || !BLIK_CODE.test(body.blikToken)) {
                return jsonError('Kod BLIK składa się z 6 cyfr', 400, 'bad_blik_code')
            }

            const transaction = await createTransaction(
                buildTransactionInput({
                    order,
                    request,
                    pay: { groupId: TPAY_GROUP.blik, blikPaymentData: { blikToken: body.blikToken } },
                }),
            )
            return NextResponse.json({ transactionId: transaction.transactionId, status: 'pending' })
        }

        let pay: { groupId?: number; channelId?: number } | undefined
        if (method === 'card') pay = { groupId: TPAY_GROUP.card }
        if (method === 'googlepay') pay = { groupId: TPAY_GROUP.googlePay }
        if (method === 'applepay') pay = { channelId: TPAY_CHANNEL.applePay }
        if (method === 'paypo') {
            const channelId = await findChannelId('paypo', getTpayConfig().paypoChannelId)
            if (!channelId) return jsonError('PayPo jest obecnie niedostępne w Tpay', 422, 'paypo_unavailable')
            pay = { channelId }
        }

        const transaction = await createTransaction(buildTransactionInput({ order, request, pay }))
        if (!transaction.transactionPaymentUrl) return jsonError('Tpay nie zwróciło adresu płatności', 502)

        return NextResponse.json({
            transactionId: transaction.transactionId,
            status: 'pending',
            redirectUrl: transaction.transactionPaymentUrl,
        })
    } catch (error) {
        return tpayErrorResponse(error)
    }
}
