import { NextRequest, NextResponse } from 'next/server'
import {
    addToWishlist,
    getSessionEmail,
    isValidSku,
    listWishlist,
    removeFromWishlist,
    sanitizeEntry,
    MAX_WISHLIST_ITEMS,
} from '@/lib/wishlist/server'

const unauthorized = () => NextResponse.json({ success: false, message: 'Zaloguj się, aby zapisać ulubione na koncie' }, { status: 401 })
const failure = (error: unknown) => {
    console.error('[wishlist]', error)
    return NextResponse.json({ success: false, message: 'Nie udało się zapisać zmian. Spróbuj ponownie.' }, { status: 500 })
}

// Lista ulubionych zalogowanego klienta
export async function GET() {
    const email = await getSessionEmail()
    if (!email) return unauthorized()

    try {
        return NextResponse.json({ success: true, data: { items: await listWishlist(email) } })
    } catch (error) {
        return failure(error)
    }
}

// Dodanie produktu do ulubionych
export async function POST(request: NextRequest) {
    const email = await getSessionEmail()
    if (!email) return unauthorized()

    const entry = sanitizeEntry(await request.json().catch(() => null))
    if (!entry) return NextResponse.json({ success: false, message: 'Nieprawidłowy produkt' }, { status: 400 })

    try {
        const saved = await addToWishlist(email, [entry])
        if (!saved) {
            return NextResponse.json({ success: false, message: `Lista ulubionych może mieć maksymalnie ${MAX_WISHLIST_ITEMS} produktów` }, { status: 409 })
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        return failure(error)
    }
}

// Usunięcie produktu z ulubionych: DELETE /api/wishlist?sku=B10735-E50-000-000-LT1
export async function DELETE(request: NextRequest) {
    const email = await getSessionEmail()
    if (!email) return unauthorized()

    const sku = request.nextUrl.searchParams.get('sku') ?? ''
    if (!isValidSku(sku)) return NextResponse.json({ success: false, message: 'Nieprawidłowy produkt' }, { status: 400 })

    try {
        await removeFromWishlist(email, sku)
        return NextResponse.json({ success: true })
    } catch (error) {
        return failure(error)
    }
}
