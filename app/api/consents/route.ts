import { NextRequest, NextResponse } from 'next/server'
import { allowRequest, clientIpFrom } from '@/lib/rateLimit'
import { parseConsent, saveConsent } from '@/lib/consentLog'

const WINDOW_MS = 10 * 60 * 1000
const REQUESTS_PER_WINDOW = 60

// Zapis zgody z formularza do rejestru (consent_log): { source, email?, phone?, terms, marketing, context? }.
export async function POST(request: NextRequest) {
    if (!allowRequest(`consents:${clientIpFrom(request.headers)}`, REQUESTS_PER_WINDOW, WINDOW_MS)) {
        return NextResponse.json({ success: false, message: 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.' }, { status: 429 })
    }

    const consent = parseConsent(await request.json().catch(() => null))
    if (!consent) {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe dane zgody' }, { status: 400 })
    }
    // w rejestrze zapisujemy tylko zgody udzielone przy wysłaniu formularza (regulamin jest warunkiem skorzystania)
    if (!consent.terms) {
        return NextResponse.json({ success: false, message: 'Wymagana akceptacja regulaminu' }, { status: 400 })
    }

    try {
        await saveConsent(consent, request.headers.get('user-agent'))
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[consents]', error)
        return NextResponse.json({ success: false, message: 'Nie udało się zapisać zgody' }, { status: 500 })
    }
}
