// components/cart/CartIconClient.tsx (Client Component)
'use client'

import { useCartStore } from '@/stores/cartZustand'

interface CartIconClientProps {
    children: React.ReactNode
}

export function CartIconClient({ children }: CartIconClientProps) {
    const setOpen = useCartStore(state => state.setShowMiniCart)

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


        </div>
    )
}