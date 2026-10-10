import { NextRequest, NextResponse } from 'next/server'
import { listWishlist } from '@/lib/wishlist/server'
import { parseWishlistRequest, serverError } from '@/lib/wishlist/routeHelpers'

// Lista ulubionych dla adresu e-mail (POST, żeby adres nie trafiał do adresu URL i logów)
export async function POST(request: NextRequest) {
    const parsed = await parseWishlistRequest(request)
    if ('error' in parsed) return parsed.error

    try {
        return NextResponse.json({ success: true, data: { items: await listWishlist(parsed.email) } })
    } catch (error) {
        return serverError(error)
    }
}
