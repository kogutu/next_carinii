// Konfiguracja promocji edytowana w panelu /admin (zakładka Promo): pasek na górze strony oraz kampanie z plakietkami
// na kartach produktów i boksem na karcie produktu. Ten plik nie ma zależności serwerowych — używają go i panel,
// i strona (przeglądarka), i serwer (walidacja zapisu).

export type PriceMode = 'all' | 'sale' | 'regular'

export type PromoCategory = { id: string; name: string }

// Kogo dotyczy kampania: wszystkie produkty / tylko przecenione / tylko nieprzecenione, ewentualnie zawężone do kategorii
export type PromoTarget = {
    priceMode: PriceMode
    // pusta lista = wszystkie kategorie
    categories: PromoCategory[]
}

export type TopBarConfig = {
    enabled: boolean
    // tekst paska; {code} zamienia się w kod rabatowy (przycisk kopiujący)
    text: string
    code: string
    startsAt: string | null
    endsAt: string | null
    counterEnabled: boolean
    // od kiedy widać licznik (domyślnie od początku paska)
    counterFrom: string | null
    bg: string
    color: string
    counterBg: string
    counterColor: string
}

// Plakietka pod zdjęciem produktu na liście; w tekście {percent} i {code}, pierwsza linia jest pogrubiona
export type CardBadge = {
    enabled: boolean
    text: string
    bg: string
    color: string
}

// Boks na karcie produktu (obok ceny)
export type ProductBox = {
    enabled: boolean
    heading: string
    lead: string
    suffix: string
    footer: string
    bg: string
    color: string
    accent: string
}

// Rabat per produkt: produkty z listy (po SKU) dostają własny rabat zamiast podstawowego z kampanii
export type SkuTier = {
    percent: number
    skus: string[]
}

export type Campaign = {
    id: string
    name: string
    enabled: boolean
    startsAt: string | null
    endsAt: string | null
    code: string
    // rabat podstawowy: dla produktów spoza list SKU
    percent: number
    // listy SKU z własnym rabatem (kod rabatowy zostaje wspólny, zmienia się tylko wyświetlany rabat)
    skuTiers: SkuTier[]
    target: PromoTarget
    card: CardBadge
    productBox: ProductBox
}

export type PromoConfig = {
    topBar: TopBarConfig
    campaigns: Campaign[]
}

export const MAX_CAMPAIGNS = 30
export const MAX_TARGET_CATEGORIES = 300
// Listy SKU trafiają do każdej strony (konfiguracja jest w layoucie), więc mają twardy limit
export const MAX_CAMPAIGN_SKUS = 3000

/** SKU w jednej postaci (wielkie litery, bez spacji), żeby „b10747-t89…” i „B10747-T89…” były tym samym. */
export const SKU_PATTERN = /^[A-Za-z0-9._/-]{1,60}$/
export const normalizeSku = (value: unknown): string => (typeof value === 'string' || typeof value === 'number' ? String(value).trim().toUpperCase() : '')

export const DEFAULT_TOP_BAR: TopBarConfig = {
    enabled: false,
    text: 'WEEKEND OKAZJI w Carinii! -30% na wszystko z kodem: {code}. Nie przegap, tylko do niedzieli!',
    code: 'WEEKEND',
    startsAt: null,
    endsAt: null,
    counterEnabled: true,
    counterFrom: null,
    bg: '#1c1917',
    color: '#e7e5e4',
    counterBg: '#ffffff',
    counterColor: '#1c1917',
}

export const DEFAULT_CARD_BADGE: CardBadge = {
    enabled: true,
    text: '-{percent}%\nz kodem: {code}',
    bg: '#000000',
    color: '#ffffff',
}

export const DEFAULT_PRODUCT_BOX: ProductBox = {
    enabled: true,
    heading: 'TYLKO DO PÓŁNOCY!',
    lead: 'Ten produkt kupisz',
    suffix: 'taniej z kodem:',
    footer: 'Nie przegap okazji!',
    bg: '#000000',
    color: '#ffffff',
    accent: '#fde68a',
}

export const DEFAULT_PROMO_CONFIG: PromoConfig = {
    topBar: DEFAULT_TOP_BAR,
    campaigns: [],
}

export const newCampaign = (id: string): Campaign => ({
    id,
    name: 'Nowa kampania',
    enabled: false,
    startsAt: null,
    endsAt: null,
    code: 'KOD',
    percent: 30,
    skuTiers: [],
    target: { priceMode: 'all', categories: [] },
    card: { ...DEFAULT_CARD_BADGE },
    productBox: { ...DEFAULT_PRODUCT_BOX },
})

// ───────────────────────── walidacja ─────────────────────────

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const CODE_PATTERN = /^[A-Za-z0-9_-]{1,30}$/

const text = (value: unknown, max: number, fallback: string): string => {
    if (typeof value !== 'string') return fallback
    return value.replace(/\r\n/g, '\n').slice(0, max)
}

const color = (value: unknown, fallback: string): string => (typeof value === 'string' && HEX_COLOR.test(value) ? value.toLowerCase() : fallback)

const bool = (value: unknown, fallback: boolean): boolean => (typeof value === 'boolean' ? value : fallback)

const isoDate = (value: unknown): string | null => {
    if (typeof value !== 'string' || !value) return null
    const time = Date.parse(value)
    return Number.isNaN(time) ? null : new Date(time).toISOString()
}

const code = (value: unknown, fallback: string): string => {
    const trimmed = typeof value === 'string' ? value.trim() : ''
    return CODE_PATTERN.test(trimmed) ? trimmed.toUpperCase() : fallback
}

const normalizeCategories = (value: unknown): PromoCategory[] => {
    if (!Array.isArray(value)) return []
    const seen = new Set<string>()
    const result: PromoCategory[] = []
    for (const entry of value.slice(0, MAX_TARGET_CATEGORIES)) {
        const id = typeof entry?.id === 'string' || typeof entry?.id === 'number' ? String(entry.id).trim() : ''
        if (!/^\d{1,10}$/.test(id) || seen.has(id)) continue
        seen.add(id)
        result.push({ id, name: text(entry?.name, 120, id).trim() || id })
    }
    return result
}

/**
 * Listy SKU -> poprawne, bez powtórzeń. Gdy ten sam SKU jest na kilku listach, obowiązuje NIŻSZY rabat
 * (nie obiecujemy klientce więcej, niż daje najniższa lista). Kolejność w obrębie listy zostaje, listy idą od największego rabatu.
 */
export const normalizeSkuTiers = (value: unknown): SkuTier[] => {
    if (!Array.isArray(value)) return []

    const lowest = new Map<string, number>()
    const order: string[] = []
    for (const tier of value) {
        const percent = Math.round(Number(tier?.percent))
        if (!Number.isFinite(percent) || percent < 1 || percent > 99 || !Array.isArray(tier?.skus)) continue
        for (const raw of tier.skus) {
            const sku = normalizeSku(raw)
            if (!SKU_PATTERN.test(sku)) continue
            const known = lowest.get(sku)
            if (known === undefined) {
                if (lowest.size >= MAX_CAMPAIGN_SKUS) continue
                order.push(sku)
                lowest.set(sku, percent)
            } else if (percent < known) {
                lowest.set(sku, percent)
            }
        }
    }

    const byPercent = new Map<number, string[]>()
    for (const sku of order) {
        const percent = lowest.get(sku) as number
        byPercent.set(percent, [...(byPercent.get(percent) ?? []), sku])
    }
    return [...byPercent.entries()].sort((a, b) => b[0] - a[0]).map(([percent, skus]) => ({ percent, skus }))
}

const normalizeTopBar = (value: any): TopBarConfig => {
    const d = DEFAULT_TOP_BAR
    return {
        enabled: bool(value?.enabled, d.enabled),
        text: text(value?.text, 300, d.text),
        code: code(value?.code, d.code),
        startsAt: isoDate(value?.startsAt),
        endsAt: isoDate(value?.endsAt),
        counterEnabled: bool(value?.counterEnabled, d.counterEnabled),
        counterFrom: isoDate(value?.counterFrom),
        bg: color(value?.bg, d.bg),
        color: color(value?.color, d.color),
        counterBg: color(value?.counterBg, d.counterBg),
        counterColor: color(value?.counterColor, d.counterColor),
    }
}

const normalizeCampaign = (value: any, fallbackId: string): Campaign => {
    const base = newCampaign(fallbackId)
    const percent = Math.round(Number(value?.percent))
    const priceMode: PriceMode = value?.target?.priceMode === 'sale' || value?.target?.priceMode === 'regular' ? value.target.priceMode : 'all'

    return {
        id: typeof value?.id === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(value.id) ? value.id : fallbackId,
        name: text(value?.name, 80, base.name).trim() || base.name,
        enabled: bool(value?.enabled, false),
        startsAt: isoDate(value?.startsAt),
        endsAt: isoDate(value?.endsAt),
        code: code(value?.code, base.code),
        percent: Number.isFinite(percent) && percent >= 1 && percent <= 99 ? percent : base.percent,
        skuTiers: normalizeSkuTiers(value?.skuTiers),
        target: { priceMode, categories: normalizeCategories(value?.target?.categories) },
        card: {
            enabled: bool(value?.card?.enabled, base.card.enabled),
            text: text(value?.card?.text, 160, base.card.text),
            bg: color(value?.card?.bg, base.card.bg),
            color: color(value?.card?.color, base.card.color),
        },
        productBox: {
            enabled: bool(value?.productBox?.enabled, base.productBox.enabled),
            heading: text(value?.productBox?.heading, 80, base.productBox.heading),
            lead: text(value?.productBox?.lead, 80, base.productBox.lead),
            suffix: text(value?.productBox?.suffix, 80, base.productBox.suffix),
            footer: text(value?.productBox?.footer, 120, base.productBox.footer),
            bg: color(value?.productBox?.bg, base.productBox.bg),
            color: color(value?.productBox?.color, base.productBox.color),
            accent: color(value?.productBox?.accent, base.productBox.accent),
        },
    }
}

/** Dowolny obiekt (z bazy lub z formularza) -> poprawna konfiguracja; błędne pola wracają do wartości domyślnych. */
export const normalizePromoConfig = (value: unknown, makeId: () => string): PromoConfig => {
    const input = (value ?? {}) as { topBar?: unknown; campaigns?: unknown }
    const campaigns = Array.isArray(input.campaigns) ? input.campaigns.slice(0, MAX_CAMPAIGNS) : []
    const usedIds = new Set<string>()

    return {
        topBar: normalizeTopBar(input.topBar),
        campaigns: campaigns.map((campaign) => {
            const normalized = normalizeCampaign(campaign, makeId())
            // identyfikatory muszą być unikalne
            if (usedIds.has(normalized.id)) normalized.id = makeId()
            usedIds.add(normalized.id)
            return normalized
        }),
    }
}

// ───────────────────────── logika wyświetlania ─────────────────────────

/** Czy `now` mieści się w oknie [od, do]; brak granicy = bez ograniczenia z tej strony. */
export const isWithinWindow = (startsAt: string | null, endsAt: string | null, now: number): boolean => {
    if (startsAt && Date.parse(startsAt) > now) return false
    if (endsAt && Date.parse(endsAt) <= now) return false
    return true
}

export type PromoProductLike = {
    sku?: unknown
    cids?: unknown
    categories?: unknown
    has_special_price?: unknown
    special_price?: unknown
}

const toStringList = (value: unknown): string[] => (Array.isArray(value) ? value.map((item) => String(item).trim()) : [])

export const isOnSale = (product: PromoProductLike): boolean => Boolean(product.has_special_price) && Number(product.special_price) > 0

/** Czy produkt podpada pod kampanię (tryb ceny + kategorie). Kategorie dopasowujemy po ID, a gdy ich brak w danych — po nazwie. */
export const productMatchesTarget = (target: PromoTarget, product: PromoProductLike): boolean => {
    const onSale = isOnSale(product)
    if (target.priceMode === 'sale' && !onSale) return false
    if (target.priceMode === 'regular' && onSale) return false
    if (target.categories.length === 0) return true

    const ids = new Set(toStringList(product.cids))
    const names = new Set(toStringList(product.categories).map((name) => name.toLowerCase()))
    return target.categories.some((category) => ids.has(category.id) || names.has(category.name.trim().toLowerCase()))
}

export const campaignIsLive = (campaign: Campaign, now: number): boolean => campaign.enabled && isWithinWindow(campaign.startsAt, campaign.endsAt, now)

/** Kampanie aktywne w tej chwili, które obejmują produkt (w kolejności z panelu). */
export const matchingCampaigns = (config: PromoConfig, product: PromoProductLike, now: number): Campaign[] =>
    config.campaigns.filter((campaign) => campaignIsLive(campaign, now) && productMatchesTarget(campaign.target, product))

/** SKU -> rabat z list kampanii (do szybkiego wyszukiwania przy renderowaniu kart). */
export const buildSkuPercentMap = (tiers: SkuTier[]): Map<string, number> => {
    const map = new Map<string, number>()
    for (const tier of tiers) for (const sku of tier.skus) map.set(sku, tier.percent)
    return map
}

/** Rabat pokazywany dla produktu: z listy SKU, a bez wpisu — podstawowy rabat kampanii. */
export const percentForProduct = (campaign: Campaign, skuPercents: Map<string, number> | undefined, product: PromoProductLike): number =>
    skuPercents?.get(normalizeSku(product.sku)) ?? campaign.percent

export const fillTemplate =(template: string, values: { code: string; percent: number }): string =>
    template.replace(/\{code\}/g, values.code).replace(/\{percent\}/g, String(values.percent))
