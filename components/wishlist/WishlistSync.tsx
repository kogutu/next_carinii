'use client'

import { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useWishlistStore } from '@/stores/wishlistStore'

// Łączy listę ulubionych z kontem (po e-mailu z sesji):
// - przy starcie wczytuje listę z localStorage,
// - po zalogowaniu scala listę gościa z listą na koncie, a lista z konta staje się źródłem prawdy,
// - po wylogowaniu czyści listę w przeglądarce (nie zostaje na wspólnym komputerze).
export function WishlistSync() {
    const { status, data } = useSession()
    const email = data?.user?.email ?? null
    const wasAuthenticated = useRef(false)

    useEffect(() => {
        useWishlistStore.persist.rehydrate()
    }, [])

    useEffect(() => {
        const { setAuthenticated, replaceAll, clear } = useWishlistStore.getState()

        if (status === 'authenticated' && email) {
            setAuthenticated(true)
            wasAuthenticated.current = true

            const local = useWishlistStore.getState().entries
            fetch('/api/wishlist/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: local }),
            })
                .then((response) => response.json())
                .then((json) => {
                    if (json?.success) replaceAll(json.data.items)
                })
                .catch((error) => console.error('[wishlist] synchronizacja nie powiodła się:', error))
            return
        }

        if (status === 'unauthenticated') {
            setAuthenticated(false)
            if (wasAuthenticated.current) {
                wasAuthenticated.current = false
                clear()
            }
        }
    }, [status, email])

    return null
}
