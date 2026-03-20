'use client'

import { useEffect } from 'react'
import { useCartStore } from '@/stores/cartZustand'

export default function CartHydrator() {
    const setHydratedCart = useCartStore(state => state.setHydratedCart)

    useEffect(() => {
        setHydratedCart(true)
    }, [setHydratedCart])

    return null
}
