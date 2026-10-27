import home from "@/data/home.json"

// Strona główna sklepu składa się z bloku CMS Magento (id 856, identyfikator „video”): banery kampanii, widżet „Nowości”
// i film. Blok nie ma własnego adresu, więc czytamy jego wyrenderowaną postać z publicznej strony głównej sklepu
// i zamieniamy na dane dla Next.js. Zmiana bloku w Magento pojawia się tu po kilku minutach (REVALIDATE_SECONDS).
const SHOP_ORIGIN = "https://sklep.carinii.com.pl"
const BLOCK_SOURCE_URL = `${SHOP_ORIGIN}/`
const REVALIDATE_SECONDS = 300

// Zdjęcia banerów tylko z tych hostów — blok pochodzi z zewnątrz, więc nie ufamy dowolnym adresom
const ALLOWED_IMAGE_HOSTS = /^https:\/\/(wsrv\.nl|images\.weserv\.nl|media-0\d\.carinii\.com\.pl|sklep\.carinii\.com\.pl)\//

export type HomeBanner = { type: "banner"; href: string; alt: string; mob: string; desk: string }
export type HomeProducts = { type: "products"; title: string }
export type HomeSection = HomeBanner | HomeProducts | { type: "magda-video"; [key: string]: unknown } | { type: "seo" }

export type HomeBlock = {
    // magento = świeżo z bloku 856, snapshot = zapasowa kopia z data/home.json (gdy sklep nie odpowiada)
    source: "magento" | "snapshot"
    fetchedAt: string
    sections: HomeSection[]
}

// Dawne adresy kategorii Maison z Magento mają teraz własne strony Next.js (strefa /maison)
const PATH_ALIASES: Record<string, string> = {
    "/maison-carinii.html": "/maison",
    "/maison-carinii/kozaki.html": "/maison/kozaki",
    "/maison-carinii/botki.html": "/maison/botki",
}

const ALT_BY_PATH: Record<string, string> = {
    "/maison": "Maison Carinii",
    "/maison/kozaki": "Kozaki Maison Carinii",
    "/maison/botki": "Botki Maison Carinii",
    "/nowosci.html": "Nowości",
    "/by-magda-pieczonka.html": "By Magda Pieczonka",
    "/obuwie/kozaki.html": "Kozaki",
    "/obuwie/botki.html": "Botki",
    "/torebki.html": "Torebki",
    "/obuwie/sneakersy.html": "Sneakersy",
}

const humanize = (path: string): string => {
    const last = path.split("/").filter(Boolean).pop() ?? ""
    const text = last.replace(/\.html$/, "").replace(/-/g, " ")
    return text.charAt(0).toUpperCase() + text.slice(1)
}

// Adres z bloku → ścieżka w sklepie Next.js; adresy spoza sklepu odrzucamy
const toLocalPath = (href: string): string | null => {
    try {
        const url = new URL(href, SHOP_ORIGIN)
        if (url.origin !== SHOP_ORIGIN) return null
        return PATH_ALIASES[url.pathname] ?? url.pathname
    } catch {
        return null
    }
}

const firstMatch = (html: string, pattern: RegExp): string | null => pattern.exec(html)?.[1] ?? null

const decode = (value: string): string => value.replace(/&amp;/g, "&")

const parseBanner = (html: string): HomeBanner | null => {
    const mob = firstMatch(html, /class="vmob"[^>]*?src="([^"]+)"/)
    const desk = firstMatch(html, /class="vdes"[^>]*?src="([^"]+)"/)
    const rawHref = firstMatch(html, /class="arel"[^>]*?href="([^"]+)"/)
    if (!mob || !desk || !rawHref) return null

    const href = toLocalPath(decode(rawHref))
    const mobUrl = decode(mob)
    const deskUrl = decode(desk)
    if (!href || !ALLOWED_IMAGE_HOSTS.test(mobUrl) || !ALLOWED_IMAGE_HOSTS.test(deskUrl)) return null

    return { type: "banner", href, alt: ALT_BY_PATH[href] ?? humanize(href), mob: mobUrl, desk: deskUrl }
}

// Blok zaczyna się od pierwszego baneru, kończy na kontenerze filmu (#video_cont). W środku: banery (div.avid)
// i widżet „Nowości” (swiper) — jego miejsce zapamiętujemy, zawartość bierzemy z naszego API produktów.
export const parseHomeBlock = (html: string): HomeSection[] => {
    const start = html.indexOf('<div class="widget widget-static-block"><div class="avid"')
    const end = html.indexOf('id="video_cont"', start)
    if (start < 0 || end < 0) return []

    const region = html.slice(start, end)
    const tokens = region.matchAll(/<div class="avid"[\s\S]*?<\/div>|class="swiper mySwiper/g)

    const sections: HomeSection[] = []
    for (const [token] of tokens) {
        if (token.startsWith("class=")) {
            sections.push({ type: "products", title: "Nowości" })
            continue
        }
        const banner = parseBanner(token)
        if (banner) sections.push(banner)
    }
    return sections
}

// Elementy, których blok nie niesie w użytecznej postaci (film z mediów sklepu, tekst SEO) — z lokalnej konfiguracji
const staticTail = (): HomeSection[] =>
    ((home as { sections: HomeSection[] }).sections).filter((section) => section.type === "magda-video" || section.type === "seo")

const snapshot = (): HomeBlock => ({
    source: "snapshot",
    fetchedAt: new Date().toISOString(),
    sections: (home as { sections: HomeSection[] }).sections,
})

export async function getHomeBlock(): Promise<HomeBlock> {
    try {
        const response = await fetch(BLOCK_SOURCE_URL, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; CariniiNext/1.0)", Accept: "text/html" },
            next: { revalidate: REVALIDATE_SECONDS },
        })
        if (!response.ok) throw new Error(`Home block source: ${response.status}`)

        const sections = parseHomeBlock(await response.text())
        // zepsuty lub pusty blok nie może zostawić pustej strony głównej
        if (!sections.some((section) => section.type === "banner")) throw new Error("Home block: no banners found")

        return { source: "magento", fetchedAt: new Date().toISOString(), sections: [...sections, ...staticTail()] }
    } catch (error) {
        console.error("[home-block]", error)
        return snapshot()
    }
}
