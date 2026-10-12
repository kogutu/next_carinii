'use client'

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import {
    DEFAULT_PROMO_CONFIG,
    campaignIsLive,
    isWithinWindow,
    matchingCampaigns,
    type Campaign,
    type PromoConfig,
    type PromoProductLike,
    type TopBarConfig,
} from '@/lib/promoConfig'

// Konfiguracja promocji z panelu (/admin) udostępniona całej stronie. Layout (serwer) czyta ją z cache'owanej bazy i podaje
// tutaj razem z czasem serwera: dzięki temu pierwszy render w przeglądarce jest identyczny jak ten z serwera, a zaraz
// po hydracji wszystko przelicza się według zegara klientki (okna dat kampanii).

type PromoContextValue = { config: PromoConfig; serverNow: number }

const PromoContext = createContext<PromoContextValue>({ config: DEFAULT_PROMO_CONFIG, serverNow: 0 })

type PromoProviderProps = { config: PromoConfig; serverNow: number; children: ReactNode }

export function PromoProvider({ config, serverNow, children }: PromoProviderProps) {
    const value = useMemo(() => ({ config, serverNow }), [config, serverNow])
    return <PromoContext.Provider value={value}>{children}</PromoContext.Provider>
}

export const usePromoConfig = (): PromoConfig => useContext(PromoContext).config

const MINUTE = 60_000
const minuteOf = (time: number): number => Math.floor(time / MINUTE) * MINUTE

const subscribeToMinute = (notify: () => void) => {
    const timer = setInterval(notify, MINUTE)
    return () => clearInterval(timer)
}

/** Bieżący czas z dokładnością do minuty. Na serwerze i przy hydracji — czas serwera, potem zegar klientki. */
export const usePromoNow = (): number => {
    const { serverNow } = useContext(PromoContext)
    return useSyncExternalStore(subscribeToMinute, () => minuteOf(Date.now()), () => minuteOf(serverNow))
}

export type TopBarState = { bar: TopBarConfig; visible: boolean }

/** Pasek na górze strony: konfiguracja i to, czy ma być teraz widoczny. */
export const useTopBar = (): TopBarState => {
    const { topBar } = usePromoConfig()
    const now = usePromoNow()
    return { bar: topBar, visible: topBar.enabled && isWithinWindow(topBar.startsAt, topBar.endsAt, now) }
}

/** Czy jakakolwiek kampania z plakietką na liście jest teraz aktywna (karty bez plakietki zostawiają wtedy miejsce, żeby się wyrównały). */
export const useAnyCardCampaign = (): boolean => {
    const config = usePromoConfig()
    const now = usePromoNow()
    return useMemo(() => config.campaigns.some((campaign) => campaign.card.enabled && campaignIsLive(campaign, now)), [config, now])
}

/** Kampanie, które teraz obejmują produkt — osobno dla plakietek na liście i dla boksu na karcie produktu. */
export const useProductCampaigns = (product: PromoProductLike | null | undefined): { card: Campaign[]; productBox: Campaign[] } => {
    const config = usePromoConfig()
    const now = usePromoNow()

    return useMemo(() => {
        if (!product || config.campaigns.length === 0) return { card: [], productBox: [] }
        const matching = matchingCampaigns(config, product, now)
        return {
            card: matching.filter((campaign) => campaign.card.enabled),
            productBox: matching.filter((campaign) => campaign.productBox.enabled),
        }
    }, [config, now, product])
}
