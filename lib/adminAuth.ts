import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'

// Logowanie do panelu /admin: jedno hasło ze zmiennej środowiskowej ADMIN_PASSWORD (bez hasła panel jest wyłączony),
// sesja w podpisanym ciasteczku httpOnly (HMAC, ważne 12 godzin). Klientki sklepu mają osobne konta (NextAuth) i tu nie wchodzą.

export const ADMIN_COOKIE = 'carinii_admin'
const SESSION_MS = 12 * 60 * 60 * 1000

export const adminConfigured = (): boolean => Boolean(process.env.ADMIN_PASSWORD)

// Klucz podpisu: osobny sekret, a gdy go nie ma — pochodna hasła (zmiana hasła unieważnia sesje)
const signingKey = (): string => process.env.ADMIN_SESSION_SECRET || `session:${process.env.ADMIN_PASSWORD ?? ''}`

const sign = (payload: string): string => createHmac('sha256', signingKey()).update(payload).digest('base64url')

const safeEqual = (a: string, b: string): boolean => {
    const left = createHash('sha256').update(a).digest()
    const right = createHash('sha256').update(b).digest()
    return timingSafeEqual(left, right)
}

export const checkAdminPassword = (input: unknown): boolean => {
    const expected = process.env.ADMIN_PASSWORD
    if (!expected || typeof input !== 'string') return false
    return safeEqual(input, expected)
}

export const createAdminToken = (): string => {
    const payload = String(Date.now() + SESSION_MS)
    return `${payload}.${sign(payload)}`
}

export const verifyAdminToken = (token: string | undefined): boolean => {
    if (!token || !adminConfigured()) return false
    const [payload, signature] = token.split('.')
    if (!payload || !signature) return false
    if (!safeEqual(signature, sign(payload))) return false
    return Number(payload) > Date.now()
}

export const isAdminRequest = (request: NextRequest): boolean => verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)

export const adminCookie = (value: string, maxAgeSeconds: number) => ({
    name: ADMIN_COOKIE,
    value,
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeSeconds,
})

export const ADMIN_SESSION_SECONDS = SESSION_MS / 1000
