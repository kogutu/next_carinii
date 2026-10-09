import { NextResponse } from 'next/server'
import { getTransaction, normalizeStatus } from '@/lib/tpay/client'
import { isValidOrderId, settlePaidTransaction } from '@/lib/tpay/orders'
import { jsonError, tpayErrorResponse } from '@/lib/tpay/service'

// GET /api/tpay/status?oid=…&transactionId=… — odpytywanie wyniku (BLIK czeka na potwierdzenie w aplikacji banku).
// Transakcja musi należeć do podanego zamówienia (hiddenDescription). Gdy Tpay zgłasza płatność,
// zamówienie jest oznaczane jako opłacone tą samą ścieżką co z webhooka (idempotentnie).
export async function GET(request: Request) {
    const params = new URL(request.url).searchParams
    const oid = params.get('oid')
    const transactionId = params.get('transactionId')

    if (!isValidOrderId(oid) || !transactionId) return jsonError('Brak parametrów', 400)

    try {
        const transaction = await getTransaction(transactionId)
        if (transaction.hiddenDescription !== oid) return jsonError('Transakcja nie należy do tego zamówienia', 403)

        const status = normalizeStatus(transaction)
        if (status === 'paid') {
            await settlePaidTransaction(oid, {
                provider: 'tpay',
                transactionId,
                amount: Number(transaction.paid ?? transaction.amount),
                testMode: false,
            })
        }

        return NextResponse.json({ status })
    } catch (error) {
        return tpayErrorResponse(error)
    }
}
