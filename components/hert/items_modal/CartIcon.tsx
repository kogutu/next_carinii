// components/cart/CartIcon.tsx (Server Component)
import { ShoppingBasket } from 'lucide-react'
import { CartIconClient } from './CartIconBadge'

export function CartIcon() {
    return (
        <CartIconClient>
            <div className="bg-gray-100 p-3 rounded-full hover:bg-purple-100 transition-colors">
                <ShoppingBasket size={20} className="text-hert" />
            </div>
        </CartIconClient>
    )
}