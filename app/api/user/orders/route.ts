import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getCustomerSession } from '@/lib/customerSession'

// Zamówienia zalogowanego klienta (lista z pozycjami, płatnością i przesyłkami).
export async function GET(request: NextRequest) {
    const customer = await getCustomerSession()
    if (!customer) return NextResponse.json({ success: false, message: 'Zaloguj się, aby zobaczyć zamówienia' }, { status: 401 })

    const params = request.nextUrl.searchParams
    const page = Math.max(1, Number(params.get('page')) || 1)
    const limit = Math.min(50, Math.max(1, Number(params.get('limit')) || 10))

    try {
        const result = await customerApi('user/getUserOrders.php', { uid: customer.customerId, page, limit })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[user] getUserOrders failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się pobrać zamówień' }, { status: 502 })
    }
}
