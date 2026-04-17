// components/cart/CartIcon.tsx (Server Component)
import { ShoppingBasket } from 'lucide-react'
import { CartIconClient } from './CartIconBadge'
import { useCartStore } from '@/stores/cartZustand';

export function CartIcon() {
    const getGrandTotalCart = useCartStore(store => store.getGrandTotalCart);
    const totalItems = useCartStore(state =>
        state.items.reduce((sum, item) => sum + item.qty, 0)
    )
    return (
        <CartIconClient>
            <div className="flex gap-2">  <div className="bg-gray-100 p-3 relative rounded-full hover:bg-gray-100 transition-colors">
                <ShoppingBasket size={20} className="text-hert" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                        {totalItems}
                    </span>
                )}
            </div>
                <div className="text-right ml-2 hidden md:block">
                    <div className="text-xs text-gray-500">Twój koszyk</div>
                    <div className="font-bold text-gray-900">{getGrandTotalCart()}</div>
                </div></div>
        </CartIconClient>
    )
}