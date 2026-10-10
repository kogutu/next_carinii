import { NextRequest, NextResponse } from 'next/server'
import { isValidSku, removeFromWishlist } from '@/lib/wishlist/server'
import { badRequest, parseWishlistRequest, serverError } from '@/lib/wishlist/routeHelpers'

// Usunięcie produktu z listy e-maila ({ email, sku })
export async function POST(request: NextRequest) {
    const parsed = await parseWishlistRequest(request)
    if ('error' in parsed) return parsed.error

    const sku = String(parsed.body.sku ?? '')
    if (!isValidSku(sku)) return badRequest('Nieprawidłowy produkt')

    try {
        await removeFromWishlist(parsed.email, sku)
        return NextResponse.json({ success: true })
    } catch (error) {
        return serverError(error)
    }
}
