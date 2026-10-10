'use client'

import { useEffect } from 'react'
import { useWishlistStore } from '@/stores/wishlistStore'
import WishlistEmailModal from './WishlistEmailModal'

// Start ulubionych: wczytuje adres e-mail i listę z localStorage, a potem odświeża listę z serwera
// (żeby zmiany z innego urządzenia były widoczne). Montuje też okno „podaj e-mail” używane przez serduszka.
export function WishlistSync() {
    useEffect(() => {
        useWishlistStore.persist.rehydrate()
        useWishlistStore.getState().refresh()
    }, [])

    return <WishlistEmailModal />
}
