import { getTpayConfig } from '@/lib/tpay/config'
import { verifyTpayNotification } from '@/lib/tpay/jws'
import { isValidOrderId, settlePaidTransaction } from '@/lib/tpay/orders'

// Tpay oczekuje HTTP 200 i treści TRUE; każda inna odpowiedź uruchamia ponawianie.
const ACK = () => new Response('TRUE', { status: 200, headers: { 'Content-Type': 'text/plain' } })

// POST /api/tpay/notification — webhook Tpay (application/x-www-form-urlencoded, podpis JWS w X-JWS-Signature).
export async function POST(request: Request) {
    // podpis liczony jest z surowego ciała — nie parsujemy go wcześniej
    const rawBody = await request.text()

    const isAuthentic = await verifyTpayNotification(rawBody, request.headers.get('x-jws-signature'))
    if (!isAuthentic) {
        console.error('[tpay] notification rejected: invalid JWS signature')
        return new Response('Invalid signature', { status: 400 })
    }

    const data = new URLSearchParams(rawBody)

    // powiadomienia o aliasach BLIK (nieużywane) — potwierdzamy, żeby nie były ponawiane
    if (data.get('event')) return ACK()

    const oid = data.get('tr_crc')
    const transactionId = data.get('tr_id')
    const status = data.get('tr_status')
    const isTestPayment = data.get('test_mode') === '1'

    if (status !== 'true') {
        // np. chargeback — wymaga ręcznej obsługi w panelu, nie zmieniamy zamówienia automatycznie
        console.warn(`[tpay] notification ${transactionId} for ${oid} has status "${status}" — ignored`)
        return ACK()
    }

    if (!isValidOrderId(oid) || !transactionId) {
        console.error('[tpay] notification without valid tr_crc / tr_id')
        return ACK()
    }

    // płatność testowa na produkcji nie może oznaczać prawdziwego zamówienia jako opłaconego
    if (isTestPayment && getTpayConfig().environment === 'production') {
        console.warn(`[tpay] test payment ${transactionId} for ${oid} ignored on production`)
        return ACK()
    }

    try {
        const result = await settlePaidTransaction(oid, {
            provider: 'tpay',
            transactionId,
            amount: Number(data.get('tr_paid') ?? data.get('tr_amount')),
            testMode: isTestPayment,
        })
        console.info(`[tpay] ${transactionId} for ${oid}: ${result}`)
        return ACK()
    } catch (error) {
        // błąd po stronie Magento — niech Tpay ponowi powiadomienie
        console.error('[tpay] marking order as paid failed:', error)
        return new Response('Temporary error', { status: 500 })
    }
}
