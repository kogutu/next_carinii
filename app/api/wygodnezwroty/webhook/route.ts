import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getWygodneZwrotyConfig, parseReturnWebhookEvent, verifyWebhookSignature } from '@/lib/wygodneZwroty'

// Webhooki Wygodnych Zwrotów (return.created / return.updated): status zwrotu i przesyłki trafia do Magento
// (tabela carinii_wz_returns + wpis w historii zamówienia). Adres tego endpointu ustawiasz jako webhook_url
// (docs/wygodne-zwroty.md).
//
// Kolejność: najpierw podpis (na SUROWYM body), potem JSON. Zdarzenie przetwarzamy synchronicznie, bo zapis w Magento jest
// szybki, a przy błędzie odpowiadamy 500 — Wygodne Zwroty ponowią dostawę (do 12 prób przez ok. 8,5 godziny).
// Duplikaty odrzuca Magento po event_id. Nie logujemy sekretu ani treści zdarzenia (dane osobowe klienta).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const config = getWygodneZwrotyConfig()
    if (!config) {
        // bez klucza nie zweryfikujemy podpisu; 503 sprawi, że dostawa zostanie ponowiona po skonfigurowaniu
        return NextResponse.json({ success: false, message: 'Integracja nie jest skonfigurowana' }, { status: 503 })
    }

    const rawBody = Buffer.from(await request.arrayBuffer())

    const signature = request.headers.get('x-signature')
    if (!signature) return NextResponse.json({ success: false, message: 'Brak podpisu' }, { status: 401 })
    if (!verifyWebhookSignature(rawBody, signature, config.apiKey)) {
        return NextResponse.json({ success: false, message: 'Niepoprawny podpis' }, { status: 403 })
    }

    let json: unknown
    try {
        json = JSON.parse(rawBody.toString('utf8'))
    } catch {
        return NextResponse.json({ success: false, message: 'Body nie jest poprawnym JSON-em' }, { status: 400 })
    }

    const event = parseReturnWebhookEvent(json)
    if (!event) return NextResponse.json({ success: false, message: 'Nieprawidłowe zdarzenie' }, { status: 400 })

    const shipment = event.return.shipment ?? null

    try {
        // do Magento idzie tylko to, co potrzebne do statusu: bez imienia, e-maila, adresu, telefonu i numeru konta
        const result = await customerApi('returns/wz_event.php', {
            eventId: event.event_id,
            event: event.event,
            occurredAt: event.occurred_at,
            returnId: event.return.return_id,
            orderNumber: event.order_number,
            status: event.return.status ?? '',
            carrier: shipment?.carrier ?? '',
            trackingNumber: shipment?.tracking_number ?? '',
            shipmentStatus: shipment?.status ?? '',
            sentAt: shipment?.sent_at ?? '',
            deliveredAt: shipment?.delivered_at ?? '',
            estimatedRefund: event.return.estimated_refund_amount ?? '',
            currency: event.return.currency ?? '',
        })

        if (!result.success) {
            console.error('[wygodnezwroty] zapis zdarzenia nie powiódł się:', result.status)
            return NextResponse.json({ success: false }, { status: 500 })
        }
        return NextResponse.json({ success: true, duplicate: Boolean(result.data?.duplicate) })
    } catch (error) {
        console.error('[wygodnezwroty] webhook failed:', error instanceof Error ? error.message : 'błąd')
        return NextResponse.json({ success: false }, { status: 500 })
    }
}
