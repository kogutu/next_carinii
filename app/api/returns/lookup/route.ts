import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getReturnsCaller } from '@/lib/returnsApi'

// Krok 1 formularza: numer zamówienia + e-mail (albo zalogowany właściciel) -> pozycje do zwrotu.
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    const caller = await getReturnsCaller(request)
    const orderNumber = String(body.orderNumber ?? '').trim()
    const email = String(body.email ?? caller.sessionEmail).trim()

    if (!orderNumber) {
        return NextResponse.json({ success: false, message: 'Podaj numer zamówienia' }, { status: 400 })
    }

    try {
        const result = await customerApi('returns/lookup.php', {
            orderNumber,
            email,
            customerId: caller.customerId,
            clientIp: caller.clientIp,
        })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[returns] lookup failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się sprawdzić zamówienia. Spróbuj ponownie.' }, { status: 502 })
    }
}
