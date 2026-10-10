'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Ulubione po stronie przeglądarki. Gość: lista tylko w localStorage. Zalogowany klient: ta sama lista jest
// zapisywana w MySQL (/api/wishlist), a WishlistSync scala ją po zalogowaniu. Wszystkie serduszka czytają stąd,
// więc dodanie/usunięcie jest widoczne na całej stronie od razu.

export type WishlistEntry = {
    sku: string
    slug: string
    addedAt: number
}

export type WishlistProduct = {
    sku: string
    slug?: string
}

type WishlistStore = {
    entries: WishlistEntry[]
    isHydrated: boolean
    isAuthenticated: boolean
    setHydrated: () => void
    setAuthenticated: (isAuthenticated: boolean) => void
    replaceAll: (entries: WishlistEntry[]) => void
    toggle: (product: WishlistProduct) => void
    remove: (sku: string) => void
    clear: () => void
}

const sortNewestFirst = (entries: WishlistEntry[]): WishlistEntry[] => [...entries].sort((a, b) => b.addedAt - a.addedAt)

// Zapis na koncie jest wtórny wobec UI: przy błędzie cofamy zmianę w przeglądarce
const saveRemotely = (request: Promise<Response>, rollback: () => void) => {
    request
        .then((response) => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
        })
        .catch((error) => {
            console.error('[wishlist] zapis na koncie nie powiódł się:', error)
            rollback()
        })
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            entries: [],
            isHydrated: false,
            isAuthenticated: false,

            setHydrated: () => set({ isHydrated: true }),
            setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
            replaceAll: (entries) => set({ entries: sortNewestFirst(entries) }),

            toggle: (product) => {
                const sku = product.sku
                if (!sku) return
                const existing = get().entries.find((entry) => entry.sku === sku)

                if (existing) {
                    set({ entries: get().entries.filter((entry) => entry.sku !== sku) })
                    if (get().isAuthenticated) {
                        saveRemotely(fetch(`/api/wishlist?sku=${encodeURIComponent(sku)}`, { method: 'DELETE' }), () =>
                            set({ entries: sortNewestFirst([...get().entries, existing]) }),
                        )
                    }
                    return
                }

                const entry: WishlistEntry = {
                    sku,
                    slug: product.slug ?? '',
                    addedAt: Date.now(),
                }
                set({ entries: [entry, ...get().entries] })
                if (get().isAuthenticated) {
                    saveRemotely(
                        fetch('/api/wishlist', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(entry),
                        }),
                        () => set({ entries: get().entries.filter((item) => item.sku !== sku) }),
                    )
                }
            },

            remove: (sku) => {
                const existing = get().entries.find((entry) => entry.sku === sku)
                if (!existing) return
                set({ entries: get().entries.filter((entry) => entry.sku !== sku) })
                if (get().isAuthenticated) {
                    saveRemotely(fetch(`/api/wishlist?sku=${encodeURIComponent(sku)}`, { method: 'DELETE' }), () =>
                        set({ entries: sortNewestFirst([...get().entries, existing]) }),
                    )
                }
            },

            clear: () => set({ entries: [] }),
        }),
        {
            name: 'carinii-wishlist',
            storage: createJSONStorage(() => localStorage),
            partialize: ({ entries }) => ({ entries }),
            // wczytanie z localStorage robi WishlistSync po zamontowaniu — bez rozjazdu z HTML z serwera
            skipHydration: true,
            onRehydrateStorage: () => (state) => state?.setHydrated(),
        },
    ),
)

export const selectIsFavorite = (sku: string) => (state: WishlistStore) =>
    state.isHydrated && Boolean(sku) && state.entries.some((entry) => entry.sku === sku)
