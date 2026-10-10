import { COOKIE_CONSENT_EVENT, readCookieChoice, type CookieChoice } from '@/lib/cookieConsent'

// Analityka i piksele: Google Analytics 4, Google Ads (konwersje), Meta Pixel i edrone — te same identyfikatory,
// co w dotychczasowym sklepie Magento. Nic nie jest ładowane przed zgodą (Consent Mode v2 z domyślnym „denied”):
//  - analityczne -> Google Analytics 4,
//  - marketingowe -> Google Ads, Meta Pixel i edrone.
// Zdarzenia z chwili, gdy klient jeszcze nie zdecydował (np. pierwsza strona), czekają w kolejce i trafiają
// tylko do usług, na które się zgodził; po odmowie są wyrzucane.
// Produkty we wszystkich usługach mają to samo ID: ID produktu głównego z katalogu (np. „86071”), jak w Magento.

const GA_IDS = (process.env.NEXT_PUBLIC_GA_IDS ?? 'G-9CTP8TYMND,G-7F1MNRXVP8').split(',').map((id) => id.trim()).filter(Boolean)
const ADS_ID = process.env.NEXT_PUBLIC_ADS_ID ?? 'AW-730929499'
// Dwie akcje konwersji Google Ads, które Magento wysyła przy dodaniu do koszyka
const ADS_CART_LABELS = (process.env.NEXT_PUBLIC_ADS_CART_LABELS ?? 'RPrWCIqyyIEYENuyxNwC,7l-hCK_YzoEYENuyxNwC').split(',').map((label) => label.trim()).filter(Boolean)
// Etykieta konwersji „zakup” z Google Ads (opcjonalna). Zakupy trafiają do Ads przez konwersje zaimportowane z GA4
// („Zakup (Zdarzenie Google Analytics purchase)” i „Nowy (web) purchase”), więc zwykle nie jest potrzebna.
const ADS_PURCHASE_LABEL = process.env.NEXT_PUBLIC_ADS_PURCHASE_LABEL ?? ''
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '282334045919886'
const EDRONE_APP_ID = process.env.NEXT_PUBLIC_EDRONE_APP_ID ?? '65080459a9e62'
const EDRONE_SCRIPT = 'https://d3bo67muzbfgtl.cloudfront.net/edrone_2_0.js'

const PRODUCTION_HOST = 'sklep.carinii.com.pl'
const DEBUG_KEY = 'carinii_analytics_debug'
const TRACKED_ORDERS_KEY = 'carinii_tracked_orders'
const CURRENCY = 'PLN'
const BRAND = 'Carinii'
const MAX_QUEUED_EVENTS = 30
// Po zdarzeniu produktu/zamówienia nie wysyłamy do edrone zwykłej odsłony tej samej strony (nadpisałaby je)
const EDRONE_PAGE_VIEW_GUARD_MS = 1500

export type TrackItem = {
    // ID produktu głównego z katalogu (np. "86071")
    id: string
    sku?: string
    name: string
    price: number
    quantity: number
    variant?: string
    // poniższe pola są potrzebne edrone (karta produktu i zamówienie)
    url?: string
    image?: string
    categoryIds?: string[]
    categoryNames?: string[]
}

export type TrackCustomer = {
    email: string
    firstName: string
    lastName?: string
    city?: string
    country?: string
    // czy klient zaznaczył zgodę marketingową (status subskrybenta w edrone)
    subscribed: boolean
}

type PurchaseEvent = {
    type: 'purchase'
    orderId: string
    items: TrackItem[]
    value: number
    shipping: number
    customer?: TrackCustomer
}

type AnalyticsEvent =
    | { type: 'page_view' }
    | { type: 'view_item'; item: TrackItem }
    | { type: 'add_to_cart'; item: TrackItem }
    | { type: 'begin_checkout'; items: TrackItem[]; value: number }
    | PurchaseEvent

// 'live' = produkcja (albo wymuszone), 'log' = tylko zapis do konsoli (testy bez wysyłki do usług), 'off' = staging
type Mode = 'live' | 'log' | 'off'

const getMode = (): Mode => {
    try {
        const forced = window.localStorage.getItem(DEBUG_KEY)
        if (forced === 'log' || forced === 'live') return forced
    } catch {
        // storage niedostępny — decyduje domena
    }
    return process.env.NEXT_PUBLIC_ANALYTICS === 'on' || window.location.hostname === PRODUCTION_HOST ? 'live' : 'off'
}

type Fbq = {
    (...args: unknown[]): void
    queue?: unknown[]
    callMethod?: (...args: unknown[]) => void
    loaded?: boolean
    version?: string
    push?: unknown
}

type Edrone = Record<string, unknown> & { init?: () => void }

type AnalyticsWindow = Window & {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    fbq?: Fbq
    _fbq?: unknown
    _edrone?: Edrone
    __analyticsLog?: unknown[]
    [key: `ga-disable-${string}`]: boolean | undefined
}

const win = (): AnalyticsWindow => window as unknown as AnalyticsWindow

// undefined = jeszcze nie odczytano wyboru, null = klient nie zdecydował
let choice: CookieChoice | null | undefined
let googleLoaded = false
let metaLoaded = false
let edroneLoaded = false
let edroneReady = false
let lastEdroneEventAt = 0
const configuredGoogleIds = new Set<string>()
let queue: AnalyticsEvent[] = []

// ───────────────────────── Google ─────────────────────────

const ensureGoogle = (current: CookieChoice): void => {
    const w = win()

    if (!googleLoaded) {
        w.dataLayer = w.dataLayer || []
        w.gtag = function gtag() {
            // eslint-disable-next-line prefer-rest-params
            w.dataLayer!.push(arguments)
        }
        w.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        })
        w.gtag('js', new Date())

        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_IDS[0] ?? ADS_ID}`
        document.head.appendChild(script)
        googleLoaded = true
    }

    const marketing = current.marketing ? 'granted' : 'denied'
    w.gtag!('consent', 'update', {
        analytics_storage: current.analytics ? 'granted' : 'denied',
        ad_storage: marketing,
        ad_user_data: marketing,
        ad_personalization: marketing,
    })

    for (const id of GA_IDS) {
        w[`ga-disable-${id}`] = !current.analytics
        if (current.analytics && !configuredGoogleIds.has(id)) {
            w.gtag!('config', id, { send_page_view: false })
            configuredGoogleIds.add(id)
        }
    }
    if (current.marketing && !configuredGoogleIds.has(ADS_ID)) {
        w.gtag!('config', ADS_ID)
        configuredGoogleIds.add(ADS_ID)
    }
}

// ───────────────────────── Meta ─────────────────────────

const ensureMeta = (): void => {
    if (metaLoaded) {
        win().fbq?.('consent', 'grant')
        return
    }

    const w = win()
    const fbq: Fbq = function fbq(...args: unknown[]) {
        const self = fbq as Fbq
        if (self.callMethod) self.callMethod(...args)
        else self.queue!.push(args)
    }
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    w.fbq = fbq
    w._fbq = fbq

    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)

    fbq('init', META_PIXEL_ID)
    metaLoaded = true
}

// ───────────────────────── edrone ─────────────────────────

const ensureEdrone = (): void => {
    if (edroneLoaded) return

    const w = win()
    const edrone: Edrone = (w._edrone = w._edrone || {})
    edrone.app_id = EDRONE_APP_ID
    edrone.version = '1.0.0'
    edrone.platform = 'custom'
    // skrypt sam wywołuje init() po załadowaniu — z tym, co zdążymy ustawić (zdarzenia z kolejki ustawiają action_type)
    edrone.action_type = 'other'

    const script = document.createElement('script')
    script.async = true
    script.src = EDRONE_SCRIPT
    script.onload = () => {
        edroneReady = true
    }
    document.head.appendChild(script)
    edroneLoaded = true
}

const EDRONE_PRODUCT_FIELDS = ['product_ids', 'product_skus', 'product_titles', 'product_images', 'product_urls', 'product_counts', 'product_category_ids', 'product_category_names']

const resetEdroneProducts = (edrone: Edrone): void => {
    for (const field of EDRONE_PRODUCT_FIELDS) delete edrone[field]
}

// Pola produktów wg dokumentacji edrone: kilka produktów rozdzielamy „|”, kategorie jednego produktu „~”;
// teksty (nazwy, adresy) przechodzą przez encodeURIComponent
const setEdroneProducts = (edrone: Edrone, items: TrackItem[], withCounts: boolean): void => {
    edrone.product_ids = items.map((item) => item.id).join('|')
    edrone.product_skus = items.map((item) => item.sku ?? '').join('|')
    edrone.product_titles = encodeURIComponent(items.map((item) => item.name).join('|'))
    edrone.product_images = encodeURIComponent(items.map((item) => item.image ?? '').join('|'))
    edrone.product_urls = encodeURIComponent(items.map((item) => item.url ?? '').join('|'))
    edrone.product_category_ids = items.map((item) => (item.categoryIds ?? []).join('~')).join('|')
    edrone.product_category_names = encodeURIComponent(items.map((item) => (item.categoryNames ?? []).join('~')).join('|'))
    if (withCounts) edrone.product_counts = items.map((item) => item.quantity).join('|')
}

const sendToEdrone = (event: AnalyticsEvent): void => {
    const edrone = win()._edrone
    if (!edrone) return

    // action_type ustawiamy na końcu, po wszystkich danych (zalecenie edrone)
    const send = (actionType: string) => {
        edrone.action_type = actionType
        if (edroneReady) edrone.init?.()
        lastEdroneEventAt = Date.now()
    }

    switch (event.type) {
        case 'page_view':
            if (Date.now() - lastEdroneEventAt < EDRONE_PAGE_VIEW_GUARD_MS) return
            resetEdroneProducts(edrone)
            edrone.action_type = 'other'
            if (edroneReady) edrone.init?.()
            break
        case 'view_item':
            resetEdroneProducts(edrone)
            setEdroneProducts(edrone, [event.item], false)
            send('product_view')
            break
        case 'add_to_cart':
            // dane produktu zostają ustawione z karty produktu; przy dodaniu z innego miejsca ustawiamy je ponownie
            setEdroneProducts(edrone, [event.item], false)
            send('add_to_cart')
            break
        case 'purchase': {
            const customer = event.customer
            if (!customer) return // zamówienie w edrone wymaga adresu e-mail klienta
            edrone.email = customer.email
            edrone.first_name = customer.firstName
            if (customer.lastName) edrone.last_name = customer.lastName
            edrone.subscriber_status = customer.subscribed ? '1' : '0'
            edrone.order_id = event.orderId
            edrone.country = customer.country || 'PL'
            edrone.city = customer.city || ''
            edrone.base_currency = CURRENCY
            edrone.order_currency = CURRENCY
            edrone.base_payment_value = event.value.toFixed(2)
            edrone.order_payment_value = event.value.toFixed(2)
            setEdroneProducts(edrone, event.items, true)
            send('order')
            break
        }
        default:
            break
    }
}

// ───────────────────────── Wycofanie zgody ─────────────────────────

const TRACKING_COOKIES = /^(_ga|_ga_.+|_gid|_gat.*|_gcl_.+|_fbp|_fbc|.*edrone.*)$/i

// Najlepsze możliwe czyszczenie po wycofaniu zgody: usuwamy znane cookies z domeny i domeny nadrzędnej
const clearTrackingCookies = (): void => {
    const hostParts = window.location.hostname.split('.')
    const domains = [window.location.hostname]
    for (let i = 1; i < hostParts.length - 1; i += 1) domains.push(`.${hostParts.slice(i).join('.')}`)

    for (const entry of document.cookie.split('; ')) {
        const name = entry.split('=')[0]
        if (!TRACKING_COOKIES.test(name)) continue
        for (const domain of domains) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`
        }
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
}

const revoke = (next: CookieChoice): void => {
    const w = win()
    if (googleLoaded && w.gtag) {
        const marketing = next.marketing ? 'granted' : 'denied'
        w.gtag('consent', 'update', {
            analytics_storage: next.analytics ? 'granted' : 'denied',
            ad_storage: marketing,
            ad_user_data: marketing,
            ad_personalization: marketing,
        })
        for (const id of GA_IDS) w[`ga-disable-${id}`] = !next.analytics
    }
    if (metaLoaded && !next.marketing) w.fbq?.('consent', 'revoke')
    clearTrackingCookies()
}

// ───────────────────────── Wysyłka zdarzeń ─────────────────────────

const round2 = (value: number): number => Math.round(value * 100) / 100

const googleItems = (items: TrackItem[]) =>
    items.map((item, index) => ({
        item_id: item.id,
        item_name: item.name,
        item_brand: BRAND,
        index,
        price: item.price,
        quantity: item.quantity,
        ...(item.variant ? { item_variant: item.variant } : {}),
    }))

const metaContents = (items: TrackItem[]) => items.map((item) => ({ id: item.id, quantity: item.quantity, item_price: item.price }))

const sendToGoogle = (event: AnalyticsEvent, current: CookieChoice): void => {
    const gtag = win().gtag
    if (!gtag) return

    if (current.analytics) {
        switch (event.type) {
            case 'page_view':
                gtag('event', 'page_view', { page_location: window.location.href, page_title: document.title })
                break
            case 'view_item':
            case 'add_to_cart':
                gtag('event', event.type, {
                    currency: CURRENCY,
                    value: round2(event.item.price * event.item.quantity),
                    items: googleItems([event.item]),
                })
                break
            case 'begin_checkout':
                gtag('event', 'begin_checkout', { currency: CURRENCY, value: round2(event.value), items: googleItems(event.items) })
                break
            case 'purchase':
                gtag('event', 'purchase', {
                    transaction_id: event.orderId,
                    currency: CURRENCY,
                    value: round2(event.value),
                    shipping: round2(event.shipping),
                    items: googleItems(event.items),
                })
                break
        }
    }

    if (!current.marketing) return

    if (event.type === 'add_to_cart') {
        for (const label of ADS_CART_LABELS) {
            gtag('event', 'conversion', { send_to: `${ADS_ID}/${label}`, value: round2(event.item.price * event.item.quantity), currency: CURRENCY })
        }
    }
    if (event.type === 'purchase' && ADS_PURCHASE_LABEL) {
        gtag('event', 'conversion', {
            send_to: `${ADS_ID}/${ADS_PURCHASE_LABEL}`,
            value: round2(event.value),
            currency: CURRENCY,
            transaction_id: event.orderId,
        })
    }
}

const sendToMeta = (event: AnalyticsEvent): void => {
    const fbq = win().fbq
    if (!fbq) return

    switch (event.type) {
        case 'page_view':
            fbq('track', 'PageView')
            break
        case 'view_item':
        case 'add_to_cart':
            fbq('track', event.type === 'view_item' ? 'ViewContent' : 'AddToCart', {
                content_type: 'product',
                content_ids: [event.item.id],
                content_name: event.item.name,
                value: round2(event.item.price * event.item.quantity),
                currency: CURRENCY,
            })
            break
        case 'begin_checkout':
        case 'purchase': {
            const items = event.items
            fbq('track', event.type === 'purchase' ? 'Purchase' : 'InitiateCheckout', {
                content_type: 'product',
                content_ids: items.map((item) => item.id),
                contents: metaContents(items),
                num_items: items.reduce((sum, item) => sum + item.quantity, 0),
                value: round2(event.value),
                currency: CURRENCY,
            })
            break
        }
    }
}

const dispatch = (event: AnalyticsEvent, current: CookieChoice): void => {
    const mode = getMode()
    if (mode === 'off') return

    if (mode === 'log') {
        const w = win()
        const vendors = [current.analytics && 'ga4', current.marketing && 'google-ads', current.marketing && 'meta', current.marketing && 'edrone'].filter(Boolean)
        ;(w.__analyticsLog = w.__analyticsLog || []).push({ event, vendors })
        console.info('[analytics]', event.type, vendors.join(', ') || 'brak zgody — nie wysyłam')
        return
    }

    sendToGoogle(event, current)
    if (current.marketing) {
        sendToMeta(event)
        sendToEdrone(event)
    }
}

const applyChoice = (next: CookieChoice | null): void => {
    const previous = choice
    choice = next
    if (next === null) return // klient jeszcze nie zdecydował — zdarzenia czekają w kolejce

    if (previous && ((previous.analytics && !next.analytics) || (previous.marketing && !next.marketing))) revoke(next)

    if (getMode() === 'live') {
        if (next.analytics || next.marketing) ensureGoogle(next)
        if (next.marketing) {
            ensureMeta()
            ensureEdrone()
        }
    }

    const pending = queue
    queue = []
    for (const event of pending) dispatch(event, next)
}

/** Podłącza analitykę do wyboru klienta; zwraca funkcję odpinającą. Wołane raz, z komponentu <Tracking />. */
export const initAnalytics = (): (() => void) => {
    applyChoice(readCookieChoice())

    const onChange = (event: Event) => applyChoice((event as CustomEvent<CookieChoice>).detail)
    window.addEventListener(COOKIE_CONSENT_EVENT, onChange)
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onChange)
}

const track = (event: AnalyticsEvent): void => {
    if (typeof window === 'undefined') return

    if (!choice) {
        if (queue.length < MAX_QUEUED_EVENTS) queue.push(event)
        return
    }
    dispatch(event, choice)
}

export const trackPageView = (): void => track({ type: 'page_view' })
export const trackViewItem = (item: TrackItem): void => track({ type: 'view_item', item })
export const trackAddToCart = (item: TrackItem): void => track({ type: 'add_to_cart', item })
export const trackBeginCheckout = (items: TrackItem[], value: number): void => {
    if (items.length > 0) track({ type: 'begin_checkout', items, value })
}

/** Zakup liczymy raz na zamówienie (odświeżenie strony potwierdzenia nie dubluje konwersji). */
export const trackPurchase = (order: Omit<PurchaseEvent, 'type'>): void => {
    if (typeof window === 'undefined') return

    try {
        const seen: string[] = JSON.parse(window.localStorage.getItem(TRACKED_ORDERS_KEY) ?? '[]')
        if (seen.includes(order.orderId)) return
        window.localStorage.setItem(TRACKED_ORDERS_KEY, JSON.stringify([...seen.slice(-49), order.orderId]))
    } catch {
        // bez storage nie da się zdeduplikować — wysyłamy raz na załadowanie strony
    }
    track({ type: 'purchase', ...order })
}
