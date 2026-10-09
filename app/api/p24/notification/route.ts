import { oidFromSessionId, verifyNotificationSign, verifyTransaction, getP24Config, type P24Notification } from '@/lib/p24/gpay'
import { settlePaidTransaction } from '@/lib/tpay/orders'

// P24 oczekuje HTTP 200; inne odpowiedzi uruchamiają ponawianie powiadomienia.
const ACK = () => new Response('OK', { status: 200, headers: { 'Content-Type': 'text/plain' } })

// POST /api/p24/notification — powiadomienie o płatności z Przelewy24 (JSON z podpisem SHA-384).
export async function POST(request: Request) {
    const notification: P24Notification | null = await request.json().catch(() => null)
    const config = getP24Config()

    if (!notification || !verifyNotificationSign(notification, config)) {
        console.error('[p24] notification rejected: invalid signature')
        return new Response('Invalid signature', { status: 400 })
    }

    const oid = oidFromSessionId(notification.sessionId)
    if (!oid || notification.currency !== 'PLN') {
        console.error('[p24] notification for unknown session:', notification.sessionId)
        return ACK()
    }

    try {
        // bez potwierdzenia transakcji P24 jej nie rozlicza
        const verified = await verifyTransaction({
            sessionId: notification.sessionId,
            orderId: notification.orderId,
            amount: notification.amount,
            currency: notification.currency,
        }, config)
        if (!verified) {
            console.error(`[p24] transaction ${notification.orderId} for ${oid} not verified`)
            return new Response('Not verified', { status: 500 })
        }

        const result = await settlePaidTransaction(oid, {
            provider: 'p24',
            transactionId: String(notification.orderId),
            amount: notification.amount / 100,
            testMode: config.sandbox,
        })
        console.info(`[p24] ${notification.orderId} for ${oid}: ${result}`)
        return ACK()
    } catch (error) {
        // błąd po stronie P24 lub Magento — niech P24 ponowi powiadomienie
        console.error('[p24] settling payment failed:', error)
        return new Response('Temporary error', { status: 500 })
    }
}
