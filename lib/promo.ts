'use client'

import { useSyncExternalStore } from 'react'
import promo from '@/data/promo.json'

// Kampania rabatowa z kodem (baner na górze strony, plakietki na kartach, odznaka na karcie produktu) jest sterowana
// z jednego miejsca: data/promo.json. Po dacie `endsAt` (albo przy `enabled: false`) wszystkie te elementy znikają same.
// Nowa kampania = zmiana kodu, treści i daty w tym pliku. Rzeczywisty rabat liczy Magento (kupon), więc kod musi tam istnieć.

export type Promo = {
    enabled: boolean
    code: string
    endsAt: string
    bannerText: string
    badgeNote: string
}

export const getPromo = (): Promo => promo as Promo

export const isPromoActive = (now: number = Date.now()): boolean => {
    const current = getPromo()
    return current.enabled && Date.parse(current.endsAt) > now
}

const subscribe = (notify: () => void) => {
    // kampania kończy się o określonej godzinie — sprawdzamy co minutę, więc baner znika bez przeładowania strony
    const timer = setInterval(notify, 60_000)
    return () => clearInterval(timer)
}

/** Czy kampania trwa. Na serwerze zawsze false (brak niezgodności przy hydracji); w przeglądarce — stan na teraz. */
export const usePromoActive = (): boolean => useSyncExternalStore(subscribe, () => isPromoActive(), () => false)
