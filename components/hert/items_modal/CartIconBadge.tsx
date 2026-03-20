// components/cart/CartIconClient.tsx (Client Component)
'use client'

import { useCartStore } from '@/stores/cartZustand'

interface CartIconClientProps {
    children: React.ReactNode
}

export function CartIconClient({ children }: CartIconClientProps) {
    const setOpen = useCartStore(state => state.setShowMiniCart)
    const totalItems = useCartStore(state =>
        state.items.reduce((sum, item) => sum + item.qty, 0)
    )
    const isHydrated = useCartStore(state => state.isHydrated)

    if (!isHydrated) {
        return (
            <div className="relative">
                {children}
            </div>
        )
    }

    return (
        <div
            onClick={() => setOpen(true)}
            className="relative cursor-pointer"
        >
            {children}

            {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                    {totalItems}
                </span>
            )}
        </div>
    )
}