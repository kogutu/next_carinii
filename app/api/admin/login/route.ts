import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_SECONDS, adminConfigured, adminCookie, checkAdminPassword, createAdminToken, isAdminRequest } from '@/lib/adminAuth'
import { allowRequest, clientIpFrom } from '@/lib/rateLimit'

const WINDOW_MS = 15 * 60 * 1000
const ATTEMPTS_PER_WINDOW = 8

// Stan sesji panelu: czy panel jest skonfigurowany (ADMIN_PASSWORD) i czy jesteś zalogowana/y
export async function GET(request: NextRequest) {
    return NextResponse.json({ configured: adminConfigured(), authenticated: isAdminRequest(request) })
}

export async function POST(request: NextRequest) {
    if (!adminConfigured()) {
        return NextResponse.json({ success: false, message: 'Panel jest wyłączony: ustaw zmienną ADMIN_PASSWORD na serwerze.' }, { status: 503 })
    }
    if (!allowRequest(`admin-login:${clientIpFrom(request.headers)}`, ATTEMPTS_PER_WINDOW, WINDOW_MS)) {
        return NextResponse.json({ success: false, message: 'Zbyt wiele prób logowania. Spróbuj ponownie za kilkanaście minut.' }, { status: 429 })
    }

    const body = await request.json().catch(() => null)
    if (!checkAdminPassword(body?.password)) {
        // stałe opóźnienie utrudnia zgadywanie hasła
        await new Promise((resolve) => setTimeout(resolve, 600))
        return NextResponse.json({ success: false, message: 'Nieprawidłowe hasło.' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(adminCookie(createAdminToken(), ADMIN_SESSION_SECONDS))
    return response
}

// Wylogowanie
export async function DELETE() {
    const response = NextResponse.json({ success: true })
    response.cookies.set(adminCookie('', 0))
    return response
}
