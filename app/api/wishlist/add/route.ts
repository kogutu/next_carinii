import { NextRequest, NextResponse } from 'next/server'
import { addToWishlist, listWishlist, sanitizeEntry, MAX_WISHLIST_ITEMS } from '@/lib/wishlist/server'
import { parseWishlistRequest, serverError } from '@/lib/wishlist/routeHelpers'

const MAX_ITEMS_PER_REQUEST = 50

// Dodanie produktów do listy e-maila ({ email, items: [{ sku, slug? }] }); zwraca pełną listę.
// Kilka wpisów naraz: pierwsze zapisanie e-maila przenosi też produkty, które klient miał już w przeglądarce.
export async function POST(request: NextRequest) {
    const parsed = await parseWishlistRequest(request)
    if ('error' in parsed) return parsed.error

    const incoming = Array.isArray(parsed.body.items) ? parsed.body.items.slice(0, MAX_ITEMS_PER_REQUEST) : []
    const entries = incoming.map(sanitizeEntry).filter((entry): entry is NonNullable<typeof entry> => entry !== null)

    try {
        if (entries.length > 0 && !(await addToWishlist(parsed.email, entries))) {
            // lista pełna: dopisujemy tyle najnowszych, ile się mieści
            const room = MAX_WISHLIST_ITEMS - (await listWishlist(parsed.email)).length
            if (room <= 0) {
                return NextResponse.json({ success: false, message: `Lista ulubionych może mieć maksymalnie ${MAX_WISHLIST_ITEMS} produktów` }, { status: 409 })
            }
            await addToWishlist(parsed.email, [...entries].sort((a, b) => b.addedAt - a.addedAt).slice(0, room))
        }
        return NextResponse.json({ success: true, data: { items: await listWishlist(parsed.email) } })
    } catch (error) {
        return serverError(error)
    }
}
