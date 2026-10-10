import { NextRequest, NextResponse } from 'next/server'
import { allowRequest, clientIpFrom } from '@/lib/rateLimit'
import { normalizeEmail } from '@/lib/wishlist/server'

const WINDOW_MS = 10 * 60 * 1000
const REQUESTS_PER_WINDOW = 240

export const badRequest = (message: string) => NextResponse.json({ success: false, message }, { status: 400 })

export const serverError = (error: unknown) => {
    console.error('[wishlist]', error)
    return NextResponse.json({ success: false, message: 'Nie udało się zapisać zmian. Spróbuj ponownie.' }, { status: 500 })
}

type ParsedRequest = { email: string; body: Record<string, unknown> } | { error: NextResponse }

/** Wspólne dla tras: limit zapytań, ciało JSON i poprawny adres e-mail (klucz listy). */
export const parseWishlistRequest = async (request: NextRequest): Promise<ParsedRequest> => {
    if (!allowRequest(`wishlist:${clientIpFrom(request.headers)}`, REQUESTS_PER_WINDOW, WINDOW_MS)) {
        return { error: NextResponse.json({ success: false, message: 'Zbyt wiele zapytań. Spróbuj ponownie za chwilę.' }, { status: 429 }) }
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') return { error: badRequest('Nieprawidłowe żądanie') }

    const email = normalizeEmail((body as Record<string, unknown>).email)
    if (!email) return { error: badRequest('Podaj poprawny adres e-mail') }

    return { email, body: body as Record<string, unknown> }
}
