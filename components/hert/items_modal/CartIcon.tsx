// components/cart/CartIcon.tsx (Server Component)
import { ShoppingBasket } from 'lucide-react'
import { CartIconClient } from './CartIconBadge'

export function CartIcon() {
    return (
        <CartIconClient>
            <div className="rounded-full bg-muted p-2.5 transition-colors hover:bg-muted/70 sm:p-3">
                <ShoppingBasket size={20} className="text-hert" />
            </div>
        </CartIconClient>
    )
}