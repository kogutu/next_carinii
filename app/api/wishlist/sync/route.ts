import { NextRequest, NextResponse } from 'next/server'
import { addToWishlist, getSessionEmail, listWishlist, sanitizeEntry, MAX_WISHLIST_ITEMS } from '@/lib/wishlist/server'

// Po zalogowaniu: scala produkty zapisane w przeglądarce (jako gość) z listą na koncie
// i zwraca pełną listę z konta, która staje się źródłem prawdy dla przeglądarki.
export async function POST(request: NextRequest) {
    const email = await getSessionEmail()
    if (!email) return NextResponse.json({ success: false, message: 'Zaloguj się, aby zapisać ulubione na koncie' }, { status: 401 })

    const body = await request.json().catch(() => null)
    const incoming = Array.isArray(body?.items) ? body.items.slice(0, MAX_WISHLIST_ITEMS) : []
    const entries = incoming.map(sanitizeEntry).filter((entry: unknown) => entry !== null)

    try {
        // gdy łączna liczba przekracza limit, dopisujemy tyle, ile się zmieści (najnowsze)
        if (entries.length > 0 && !(await addToWishlist(email, entries))) {
            const room = MAX_WISHLIST_ITEMS - (await listWishlist(email)).length
            if (room > 0) await addToWishlist(email, entries.sort((a: any, b: any) => b.addedAt - a.addedAt).slice(0, room))
        }
        return NextResponse.json({ success: true, data: { items: await listWishlist(email) } })
    } catch (error) {
        console.error('[wishlist] sync failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się zsynchronizować ulubionych' }, { status: 500 })
    }
}
