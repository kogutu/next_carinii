import { NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getCustomerSession } from '@/lib/customerSession'

// Dane zalogowanego klienta (konto, adresy). Identyfikator pochodzi z sesji — treść żądania jest ignorowana.
export async function POST() {
    const customer = await getCustomerSession()
    if (!customer) return NextResponse.json({ success: false, message: 'Zaloguj się, aby zobaczyć dane konta' }, { status: 401 })

    try {
        const result = await customerApi('user/getUser.php', { uid: customer.customerId })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[user] getUser failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się pobrać danych konta' }, { status: 502 })
    }
}
