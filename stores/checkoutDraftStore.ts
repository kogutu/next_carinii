'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CustomerFormData, InpostPoint, InvoiceFormData } from '@/hooks/useCheckoutValidation'

// Zapamiętane w przeglądarce dane z ostatniego checkoutu (gość) — żeby przy
// kolejnym zamówieniu nie wpisywać wszystkiego od nowa. Bez zgód i bez zawartości koszyka.
const DRAFT_TTL_MS = 90 * 24 * 60 * 60 * 1000

export type CheckoutDraft = {
    customer: CustomerFormData
    invoiceEnabled: boolean
    invoice: InvoiceFormData
    shippingMethod: string
    paymentMethod: string
    inpost: InpostPoint
}

type CheckoutDraftStore = {
    draft: CheckoutDraft | null
    savedAt: number
    saveDraft: (draft: CheckoutDraft) => void
    clearDraft: () => void
}

export const useCheckoutDraftStore = create<CheckoutDraftStore>()(
    persist(
        (set) => ({
            draft: null,
            savedAt: 0,
            saveDraft: (draft) => set({ draft, savedAt: Date.now() }),
            clearDraft: () => set({ draft: null, savedAt: 0 }),
        }),
        {
            name: 'carinii-checkout-draft-v1',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined'
                    ? localStorage
                    : { getItem: () => null, setItem: () => { }, removeItem: () => { } },
            ),
            // wygasły zapis traktujemy jak brak zapisu
            merge: (persisted, current) => {
                const saved = persisted as Partial<CheckoutDraftStore> | undefined
                const isFresh = saved?.savedAt && Date.now() - saved.savedAt < DRAFT_TTL_MS
                return isFresh ? { ...current, ...saved } : current
            },
        },
    ),
)

export const readCheckoutDraft = (): CheckoutDraft | null => useCheckoutDraftStore.getState().draft
