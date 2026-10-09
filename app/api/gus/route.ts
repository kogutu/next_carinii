import { NextResponse } from 'next/server'
import { isValidNip, normalizeNip } from '@/lib/nip'

const GUS_API_URL = process.env.GUS_API_URL || 'https://devback.it/GUS/getData.php'
const GUS_TIMEOUT_MS = 5000
const CACHE_SECONDS = 60 * 60 * 24

type GusRecord = {
    Nazwa?: string
    Ulica?: string
    NrNieruchomosci?: string | string[]
    NrLokalu?: string | string[]
    KodPocztowy?: string
    Miejscowosc?: string
    street?: string
    ErrorCode?: string
    DataZakonczeniaDzialalnosci?: string | string[]
}

// GUS zwraca puste pola jako [] lub "" — sprowadzamy do stringa
const text = (value: unknown): string =>
    typeof value === 'string' ? value.trim() : ''

const buildStreet = (record: GusRecord): string => {
    const street = text(record.Ulica)
    if (!street) return text(record.street)

    const building = text(record.NrNieruchomosci)
    const flat = text(record.NrLokalu)
    return [street, flat ? `${building}/${flat}` : building].filter(Boolean).join(' ')
}

const isActive = (record: GusRecord): boolean =>
    text(record.DataZakonczeniaDzialalnosci) === ''

export async function POST(req: Request) {
    const body = await req.json().catch(() => null)
    const nip = normalizeNip(String(body?.nip ?? ''))

    if (!isValidNip(nip)) {
        return NextResponse.json({ error: 'Nieprawidłowy numer NIP' }, { status: 400 })
    }

    try {
        const res = await fetch(`${GUS_API_URL}?nip=${nip}`, {
            signal: AbortSignal.timeout(GUS_TIMEOUT_MS),
            next: { revalidate: CACHE_SECONDS },
        })
        if (!res.ok) throw new Error(`GUS responded ${res.status}`)

        const record: GusRecord = await res.json()
        const companyName = text(record.Nazwa)

        // Brak firmy: GUS odpowiada 200 z ErrorCode i pustymi polami
        if (record.ErrorCode || !companyName) {
            return NextResponse.json({ error: 'Nie znaleziono firmy w GUS' }, { status: 404 })
        }

        return NextResponse.json({
            nip,
            companyName,
            street: buildStreet(record),
            postcode: text(record.KodPocztowy),
            city: text(record.Miejscowosc),
            active: isActive(record),
        })
    } catch (error) {
        console.error('[gus] lookup failed:', error)
        return NextResponse.json({ error: 'Usługa GUS jest chwilowo niedostępna' }, { status: 502 })
    }
}
