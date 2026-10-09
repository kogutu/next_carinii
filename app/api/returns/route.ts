import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getCustomerSession } from '@/lib/customerSession'
import { getReturnsCaller } from '@/lib/returnsApi'

// Złożenie zgłoszenia zwrotu lub reklamacji (zapis w Magento: tabela, historia zamówienia, e-maile).
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    const caller = await getReturnsCaller(request)

    // przepuszczamy tylko znane pola — reszta treści żądania nie trafia do Magento
    const payload = {
        orderNumber: String(body.orderNumber ?? '').trim(),
        email: String(body.email ?? caller.sessionEmail).trim(),
        type: String(body.type ?? ''),
        items: Array.isArray(body.items)
            ? body.items.map((item: any) => ({ itemId: Number(item?.itemId), qty: Number(item?.qty) }))
            : [],
        reason: String(body.reason ?? ''),
        resolution: String(body.resolution ?? ''),
        description: String(body.description ?? '').slice(0, 3000),
        bankAccount: String(body.bankAccount ?? '').slice(0, 40),
        photos: Array.isArray(body.photos) ? body.photos.map((token: unknown) => String(token)).slice(0, 6) : [],
        customerId: caller.customerId,
        clientIp: caller.clientIp,
    }

    try {
        const result = await customerApi('returns/create.php', payload)
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 201 : result.status || 500 },
        )
    } catch (error) {
        console.error('[returns] create failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.' }, { status: 502 })
    }
}

// Zgłoszenia zalogowanego klienta (panel).
export async function GET() {
    const customer = await getCustomerSession()
    if (!customer) return NextResponse.json({ success: false, message: 'Zaloguj się, aby zobaczyć zgłoszenia' }, { status: 401 })

    try {
        const result = await customerApi('returns/list.php', { customerId: Number(customer.customerId), email: customer.email })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[returns] list failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się pobrać zgłoszeń' }, { status: 502 })
    }
}
