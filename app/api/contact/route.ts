import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { allowRequest, clientIpFrom } from '@/lib/rateLimit'

const WINDOW_MS = 10 * 60 * 1000
const REQUESTS_PER_WINDOW = 10

// Wiadomość z formularza kontaktowego -> e-mail do sklepu (z Reply-To na klientkę) i potwierdzenie dla klientki.
// Wysyłkę i zapis w bazie robi skrypt PHP na serwerze Magento (contact/send.php).
export async function POST(request: NextRequest) {
    const clientIp = clientIpFrom(request.headers)
    if (!allowRequest(`contact:${clientIp}`, REQUESTS_PER_WINDOW, WINDOW_MS)) {
        return NextResponse.json({ success: false, message: 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }
    if (body.terms !== true) {
        return NextResponse.json({ success: false, message: 'Aby wysłać wiadomość, zaakceptuj regulamin sklepu.' }, { status: 400 })
    }

    // przepuszczamy tylko znane pola (długości przycina i sprawdza jeszcze PHP)
    const payload = {
        name: String(body.name ?? '').trim().slice(0, 120),
        email: String(body.email ?? '').trim().slice(0, 255),
        phone: String(body.phone ?? '').slice(0, 32),
        subject: String(body.subject ?? ''),
        message: String(body.message ?? '').slice(0, 3000),
        orderNumber: String(body.orderNumber ?? '').trim().slice(0, 40),
        marketing: body.marketing === true,
        clientIp: clientIp === 'unknown' ? '' : clientIp,
    }

    try {
        const result = await customerApi('contact/send.php', payload)
        return NextResponse.json(
            { success: result.success, message: result.message || (result.success ? '' : 'Nie udało się wysłać wiadomości.') },
            { status: result.success ? 200 : result.status || 502 },
        )
    } catch (error) {
        console.error('[contact] send failed:', error)
        return NextResponse.json(
            { success: false, message: 'Nie udało się wysłać wiadomości. Napisz do nas na sklep@carinii.com.pl lub zadzwoń.' },
            { status: 502 },
        )
    }
}
