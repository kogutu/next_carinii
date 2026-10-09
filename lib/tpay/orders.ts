// Dostęp do zamówienia po stronie serwera: kwota i dane płatnika pochodzą ze sklepu (Magento),
// nigdy od klienta. Opłacenie zamówienia zgłaszamy do PHP przez ORDER_MARK_PAID_URL.

const ORDERS_URL = process.env.ORDERS_API_URL || 'https://sklep.carinii.com.pl/directseo/nextjs/orders/'
const ORDER_ID_PATTERN = /^[\w-]{1,40}$/

export type PayableOrder = {
    incrementId: string
    paid: boolean
    amount: number
    currency: string
    email: string
    payerName: string
}

export const isValidOrderId = (oid: unknown): oid is string =>
    typeof oid === 'string' && ORDER_ID_PATTERN.test(oid)

export const fetchPayableOrder = async (oid: string): Promise<PayableOrder | null> => {
    // parametr _ omija cache odpowiedzi po stronie serwera sklepu (inaczej status "opłacone" mógłby się spóźniać)
    const res = await fetch(`${ORDERS_URL}?oid=${encodeURIComponent(oid)}&_=${Date.now()}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null

    const order = await res.json().catch(() => null)
    const amount = Number(order?.grandTotal ?? order?.total)
    if (!order?.incrementId || !Number.isFinite(amount) || amount <= 0) return null

    return {
        incrementId: String(order.incrementId),
        paid: Boolean(order.pay),
        amount,
        currency: order.currency || 'PLN',
        email: order.customer?.email ?? '',
        payerName: `${order.customer?.firstName ?? ''} ${order.customer?.lastName ?? ''}`.trim() || 'Klient',
    }
}

export type PaidDetails = {
    provider: 'tpay' | 'p24'
    transactionId: string
    amount: number
    testMode: boolean
}

// Kontrakt endpointu PHP: POST JSON { oid, provider, transactionId, amount, currency, paidAt, testMode },
// nagłówek Authorization: Bearer ORDER_MARK_PAID_TOKEN. Musi być idempotentny (ten sam transactionId → 200).
export const markOrderPaid = async (order: PayableOrder, details: PaidDetails): Promise<void> => {
    const url = process.env.ORDER_MARK_PAID_URL
    if (!url) throw new Error('Brak ORDER_MARK_PAID_URL — nie można oznaczyć zamówienia jako opłaconego')

    const token = process.env.ORDER_MARK_PAID_TOKEN
    // ORDER_MARK_PAID_DRY_RUN=1: PHP sprawdza wszystko (zamówienie, kwotę, SQL), ale niczego nie księguje — do testów na produkcyjnym Magento
    const dryRun = process.env.ORDER_MARK_PAID_DRY_RUN === '1'
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
            oid: order.incrementId,
            provider: details.provider,
            transactionId: details.transactionId,
            amount: details.amount,
            currency: order.currency,
            paidAt: new Date().toISOString(),
            testMode: details.testMode,
            ...(dryRun ? { dryRun: true } : {}),
        }),
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
    })

    const body = await res.json().catch(() => ({}))
    if (!res.ok || body?.success === false) {
        throw new Error(`Magento odrzuciło oznaczenie jako opłacone (${res.status}): ${body?.message ?? ''}`)
    }
    if (dryRun) console.info(`[tpay] DRY RUN ${order.incrementId}: ${JSON.stringify(body)}`)
}

export type SettleResult = 'settled' | 'already-paid' | 'order-not-found' | 'amount-too-low'

// Wspólna ścieżka dla webhooka i odpytywania statusu: sprawdza zamówienie i kwotę, potem oznacza jako opłacone.
export const settlePaidTransaction = async (oid: string, details: PaidDetails): Promise<SettleResult> => {
    const order = await fetchPayableOrder(oid)
    if (!order) return 'order-not-found'
    if (order.paid) return 'already-paid'

    // tolerancja 1 grosza na zaokrąglenia
    if (!Number.isFinite(details.amount) || details.amount + 0.01 < order.amount) {
        console.error(`[tpay] zapłacono ${details.amount}, a zamówienie ${oid} wymaga ${order.amount}`)
        return 'amount-too-low'
    }

    await markOrderPaid(order, details)
    return 'settled'
}
