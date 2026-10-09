import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getCustomerSession } from '@/lib/customerSession'

const ALLOWED_TYPES = ['personal', 'billing', 'shipping', 'password']

// Zmiana danych konta zalogowanego klienta. Identyfikator pochodzi z sesji, a nie z treści żądania.
export async function POST(request: NextRequest) {
    const customer = await getCustomerSession()
    if (!customer) return NextResponse.json({ success: false, message: 'Zaloguj się, aby zmienić dane konta' }, { status: 401 })

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object' || !ALLOWED_TYPES.includes(body.type)) {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    // uid z przeglądarki jest nadpisywany identyfikatorem z sesji
    const { uid: _ignored, ...fields } = body

    try {
        const result = await customerApi('user/editUser.php', { ...fields, uid: customer.customerId })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[user] editUser failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się zapisać zmian' }, { status: 502 })
    }
}
