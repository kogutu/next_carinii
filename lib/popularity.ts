// Sortowanie "wg popularności": płaska lista SKU (od najpopularniejszego)
// generowana per kategoria przez sklep: /directseo/kolejnosc/{cid}.json

const POPULARITY_URL = "https://sklep.carinii.com.pl/directseo/kolejnosc"
const REVALIDATE_SECONDS = 300

export const POPULARITY_SORT = "popularity"

const clientCache = new Map<string, Promise<string[]>>()

const parseSkus = (data: unknown): string[] =>
    Array.isArray(data)
        ? data.filter((sku): sku is string => typeof sku === "string" && sku !== "")
        : []

const fetchSkusOnServer = async (catId: string): Promise<string[]> => {
    const res = await fetch(`${POPULARITY_URL}/${encodeURIComponent(catId)}.json`, {
        next: { revalidate: REVALIDATE_SECONDS },
    })
    return res.ok ? parseSkus(await res.json()) : []
}

// Przeglądarka idzie przez nasze proxy (CORS + cache), wynik trzymamy w pamięci.
const fetchSkusOnClient = (catId: string): Promise<string[]> => {
    const cached = clientCache.get(catId)
    if (cached) return cached

    const request = fetch(`/api/category-order/${encodeURIComponent(catId)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then(parseSkus)
        .catch(() => {
            clientCache.delete(catId)
            return []
        })
    clientCache.set(catId, request)
    return request
}

export const getPopularitySkus = (catId: string): Promise<string[]> =>
    typeof window === "undefined" ? fetchSkusOnServer(catId).catch(() => []) : fetchSkusOnClient(catId)

const escapeTypesenseValue = (value: string): string =>
    value.replace(/\\/g, "\\\\").replace(/`/g, "\\`")

// Pierwszy SKU z listy dostaje najwyższą wagę; produkty spoza listy
// (waga 0) lecą na koniec, wg nowości.
export const buildPopularitySortBy = (skus: string[]): string => {
    const conditions = skus
        .map((sku, i) => `(sku:=\`${escapeTypesenseValue(sku)}\`):${skus.length - i}`)
        .join(",")
    return `_eval([${conditions}]):desc,createdat:desc`
}
