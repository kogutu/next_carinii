// Dane zamówień z /api/user/orders (docs/php/user/getUserOrders.php) i ich prezentacja w panelu klienta.

export type PanelOrderItem = {
    item_id: number
    sku: string
    name: string
    qty_ordered: number
    price_incl_tax: number
    row_total_incl_tax: number
    image_url: string
}

export type PanelOrder = {
    order_id: number
    increment_id: string
    status: string
    status_label: string
    state: string
    created_at: string
    shipping_description: string
    grand_total: number
    total_qty_ordered: number
    payment: { method: string; method_title: string } | null
    items: PanelOrderItem[]
    shipments: { shipment_id: string; created_at: string; tracks: { carrier: string; title: string; number: string }[] }[]
}

export type StatusTone = 'success' | 'warning' | 'neutral'

// Statusy zamówień w Magento sklepu (w tym własne: zwrot_*, reklamacja, wyslano)
const STATUS_TONES: Record<string, StatusTone> = {
    complete: 'success',
    wyslano: 'success',
    processing: 'warning',
    pending: 'warning',
    pending_payment: 'warning',
    zaplacono_przelewem: 'warning',
}

export const statusTone = (status: string): StatusTone => STATUS_TONES[status] ?? 'neutral'

// Zwrot lub reklamację można zgłosić, gdy zamówienie dotarło do klienta (ta sama reguła co w returns/_lib.php)
export const canReportReturn = (status: string): boolean => status === 'complete' || status === 'wyslano'

// Zamówienie czeka na płatność: klient może wrócić na stronę zamówienia i zapłacić
export const isAwaitingPayment = (status: string): boolean => status === 'pending' || status === 'pending_payment'

export const formatOrderDate = (value: string): string => {
    const date = new Date(value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}
