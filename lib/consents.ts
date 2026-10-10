// Wspólne dla klienta i serwera: źródła zgód, wersja treści i kształt wpisu w rejestrze zgód.
// Zmieniając treść zgód w components/consent/ConsentFields.tsx, podnieś CONSENT_VERSION — wpis w rejestrze
// pokazuje wtedy, na którą wersję tekstu klient się zgodził.

export const CONSENT_VERSION = '2026-10-10'

export const CONSENT_SOURCES = [
    'checkout',
    'express',
    'wishlist',
    'size-alert',
    'register',
    'contact',
    'returns',
] as const

export type ConsentSource = (typeof CONSENT_SOURCES)[number]

export type ConsentRecord = {
    source: ConsentSource
    email?: string
    phone?: string
    // regulamin i polityka prywatności (wymagane do skorzystania z formularza)
    terms: boolean
    // osobna, dobrowolna zgoda marketingowa
    marketing: boolean
    // dodatkowy kontekst zapisu: numer zamówienia, sku i rozmiar itp. (tylko krótkie wartości tekstowe i liczby)
    context?: Record<string, string | number>
}
