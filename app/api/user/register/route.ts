import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'

// Rejestracja konta (hasło). Szczegółową walidację robi Magento; tu przepuszczamy tylko znane pola.
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    const payload = {
        firstname: String(body.firstname ?? ''),
        lastname: String(body.lastname ?? ''),
        email: String(body.email ?? ''),
        password: String(body.password ?? ''),
        telephone: String(body.telephone ?? ''),
    }

    try {
        const result = await customerApi('user/register.php', payload)
        return NextResponse.json(
            { success: result.success, message: result.message },
            { status: result.status || (result.success ? 201 : 500) },
        )
    } catch (error) {
        console.error('[user] register failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się utworzyć konta' }, { status: 502 })
    }
}
