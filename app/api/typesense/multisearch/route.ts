import { NextResponse } from 'next/server'

// Serwerowe proxy do Typesense multi_search.
// Po co: przeglądarka na https:// nie może wołać http://46.224.114.11:8108
// (mixed-content jest blokowane) — dlatego filtrowanie/sortowanie/paginacja
// wykonywane po stronie klienta kończyły się błędem i brakiem reakcji UI.
// Ten route woła Typesense z serwera (http jest OK) i zwraca wynik do klienta.

const TYPESENSE_HOST = '46.224.114.11'
const TYPESENSE_PORT = 8108
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'xyz'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const searches = body?.searches

        if (!Array.isArray(searches) || searches.length === 0) {
            return NextResponse.json(
                { error: 'Missing searches[]' },
                { status: 400 }
            )
        }

        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000)

        const res = await fetch(
            `http://${TYPESENSE_HOST}:${TYPESENSE_PORT}/multi_search`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TYPESENSE-API-KEY': TYPESENSE_API_KEY,
                },
                body: JSON.stringify({ searches }),
                signal: controller.signal,
                // Filtry są dynamiczne — nigdy nie cachuj na poziomie fetch
                cache: 'no-store',
            }
        ).finally(() => clearTimeout(timeout))

        if (!res.ok) {
            const text = await res.text().catch(() => '')
            console.error('[typesense-proxy] upstream error:', res.status, text.slice(0, 500))
            return NextResponse.json(
                { error: `Typesense upstream error: ${res.status}` },
                { status: 502 }
            )
        }

        const data = await res.json()
        return NextResponse.json(data, {
            headers: {
                // krótki CDN cache dla identycznych zapytań, ale nie blokuj świeżości
                'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30',
            },
        })
    } catch (error: any) {
        if (error?.name === 'AbortError') {
            return NextResponse.json({ error: 'Typesense timeout' }, { status: 504 })
        }
        console.error('[typesense-proxy] error:', error)
        return NextResponse.json({ error: 'Proxy failed' }, { status: 500 })
    }
}
