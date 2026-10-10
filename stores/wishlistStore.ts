'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Ulubione bez logowania: kluczem listy jest adres e-mail, zapamiętany w localStorage.
// Serce bez zapisanego adresu otwiera okno „podaj e-mail”; po podaniu adresu produkt trafia na listę w MySQL
// (/api/wishlist/*), a ten sam adres na innym urządzeniu przywraca całą listę. Wszystkie serduszka czytają stąd,
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

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SubmitEmailResult = { ok: true } | { ok: false; message: string }

type WishlistStore = {
    email: string | null
    entries: WishlistEntry[]
    isHydrated: boolean
    isEmailModalOpen: boolean
    // produkt, którego serduszko otworzyło okno — zapiszemy go po podaniu adresu
    pendingProduct: WishlistProduct | null
    setHydrated: () => void
    openEmailModal: (product?: WishlistProduct) => void
    closeEmailModal: () => void
    submitEmail: (rawEmail: string) => Promise<SubmitEmailResult>
    refresh: () => Promise<void>
    toggle: (product: WishlistProduct) => void
    remove: (sku: string) => void
    changeEmail: () => void
}

const sortNewestFirst = (entries: WishlistEntry[]): WishlistEntry[] => [...entries].sort((a, b) => b.addedAt - a.addedAt)

const postJson = async (url: string, body: unknown): Promise<any> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const json = await response.json().catch(() => null)
    if (!response.ok || !json?.success) throw new Error(json?.message ?? `HTTP ${response.status}`)
    return json
}

export const useWishlistStore = create<WishlistStore>()(
    persist(
        (set, get) => ({
            email: null,
            entries: [],
            isHydrated: false,
            isEmailModalOpen: false,
            pendingProduct: null,

            setHydrated: () => set({ isHydrated: true }),

            openEmailModal: (product) => set({ isEmailModalOpen: true, pendingProduct: product ?? null }),
            closeEmailModal: () => set({ isEmailModalOpen: false, pendingProduct: null }),

            // Zapisuje adres i od razu dodaje produkt z serduszka. Adres zapamiętujemy dopiero po udanym zapisie.
            submitEmail: async (rawEmail) => {
                const email = rawEmail.trim().toLowerCase()
                if (!EMAIL_PATTERN.test(email)) return { ok: false, message: 'Podaj poprawny adres e-mail' }

                const { pendingProduct, entries } = get()
                const now = Date.now()
                const items = [
                    // produkty, które klient miał w przeglądarce przed podaniem adresu (starsza wersja listy)
                    ...entries,
                    ...(pendingProduct?.sku ? [{ sku: pendingProduct.sku, slug: pendingProduct.slug ?? '', addedAt: now }] : []),
                ]

                try {
                    const json = await postJson('/api/wishlist/add', { email, items })
                    set({
                        email,
                        entries: sortNewestFirst(json.data.items),
                        isEmailModalOpen: false,
                        pendingProduct: null,
                    })
                    return { ok: true }
                } catch (error) {
                    return { ok: false, message: error instanceof Error && error.message ? error.message : 'Nie udało się zapisać. Spróbuj ponownie.' }
                }
            },

            // Lista z serwera dla zapamiętanego adresu (np. po otwarciu strony na innym urządzeniu)
            refresh: async () => {
                const { email } = get()
                if (!email) return
                try {
                    const json = await postJson('/api/wishlist/list', { email })
                    if (get().email === email) set({ entries: sortNewestFirst(json.data.items) })
                } catch (error) {
                    console.error('[wishlist] pobranie listy nie powiodło się:', error)
                }
            },

            toggle: (product) => {
                const { email, entries } = get()
                const sku = product.sku
                if (!sku) return

                // bez adresu e-mail nie mamy czyjej listy zapisać — pytamy o adres
                if (!email) {
                    get().openEmailModal(product)
                    return
                }

                const existing = entries.find((entry) => entry.sku === sku)

                if (existing) {
                    set({ entries: entries.filter((entry) => entry.sku !== sku) })
                    postJson('/api/wishlist/remove', { email, sku }).catch((error) => {
                        console.error('[wishlist] usunięcie nie powiodło się:', error)
                        set({ entries: sortNewestFirst([...get().entries, existing]) })
                    })
                    return
                }

                const entry: WishlistEntry = { sku, slug: product.slug ?? '', addedAt: Date.now() }
                set({ entries: [entry, ...entries] })
                postJson('/api/wishlist/add', { email, items: [entry] }).catch((error) => {
                    console.error('[wishlist] dodanie nie powiodło się:', error)
                    set({ entries: get().entries.filter((item) => item.sku !== sku) })
                })
            },

            remove: (sku) => {
                const { email, entries } = get()
                const existing = entries.find((entry) => entry.sku === sku)
                if (!existing) return

                set({ entries: entries.filter((entry) => entry.sku !== sku) })
                if (!email) return
                postJson('/api/wishlist/remove', { email, sku }).catch((error) => {
                    console.error('[wishlist] usunięcie nie powiodło się:', error)
                    set({ entries: sortNewestFirst([...get().entries, existing]) })
                })
            },

            // „To nie Ty?”: zapominamy adres i listę w tej przeglądarce (lista na serwerze zostaje)
            changeEmail: () => set({ email: null, entries: [] }),
        }),
        {
            name: 'carinii-wishlist',
            storage: createJSONStorage(() => localStorage),
            partialize: ({ email, entries }) => ({ email, entries }),
            // wczytanie z localStorage robi WishlistSync po zamontowaniu — bez rozjazdu z HTML z serwera
            skipHydration: true,
            onRehydrateStorage: () => (state) => state?.setHydrated(),
        },
    ),
)

export const selectIsFavorite = (sku: string) => (state: WishlistStore) =>
    state.isHydrated && Boolean(sku) && state.entries.some((entry) => entry.sku === sku)
