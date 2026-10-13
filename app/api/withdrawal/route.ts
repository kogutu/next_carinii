import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getReturnsCaller } from '@/lib/returnsApi'

// Złożenie oświadczenia o odstąpieniu od umowy (krok „Potwierdź odstąpienie od umowy”).
// Zapis, historia zamówienia i potwierdzenie e-mailem dzieją się w Magento (docs/php/returns/withdraw.php).
export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    const caller = await getReturnsCaller(request)

    // przepuszczamy tylko znane pola; tożsamość zalogowanego (id i adres konta) pochodzi z sesji, nie z przeglądarki
    const payload = {
        orderNumber: String(body.orderNumber ?? '').trim(),
        email: String(body.email ?? caller.sessionEmail).trim(),
        fullName: String(body.fullName ?? '').slice(0, 160),
        items: Array.isArray(body.items)
            ? body.items.slice(0, 100).map((item: any) => ({ itemId: Number(item?.itemId), qty: Number(item?.qty) }))
            : [],
        bankAccount: String(body.bankAccount ?? '').slice(0, 40),
        customerId: caller.customerId,
        accountEmail: caller.sessionEmail,
        clientIp: caller.clientIp,
    }

    if (!payload.orderNumber) {
        return NextResponse.json({ success: false, message: 'Podaj numer zamówienia' }, { status: 400 })
    }

    try {
        const result = await customerApi('returns/withdraw.php', payload)
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? (result.data?.alreadySubmitted ? 200 : 201) : result.status || 500 },
        )
    } catch (error) {
        console.error('[withdrawal] submit failed:', error)
        return NextResponse.json(
            { success: false, message: 'Nie udało się złożyć oświadczenia. Spróbuj ponownie lub napisz na sklep@carinii.com.pl.' },
            { status: 502 },
        )
    }
}
