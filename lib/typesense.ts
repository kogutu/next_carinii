import Typesense from "typesense"

// ─── Config ──────────────────────────────────────────────────────────

const TYPESENSE_API_URL =
    "https://sklep.carinii.com.pl/directseo/nextjs/api/index.php"

const COLLECTION_PRODUCTS = "carinii_prs"
const COLLECTION_CATEGORIES = "carinii_cats"

/**
 * Revalidation times (in seconds).
 * Jedno miejsce do tuningowania — łatwo zmienić dla całej apki.
 */
const CACHE_TTL = {
    /** Produkty listingowe (kategoria, search) — odświeżaj co 60s */
    PRODUCTS: 60,
    /** Pojedynczy produkt (PDP) — odświeżaj co 5 min */
    PRODUCT_DETAIL: 300,
    /** Kategorie — zmieniają się rzadko, co 1h */
    CATEGORIES: 3600,
    /** Featured / bestsellery — co 5 min */
    FEATURED: 300,
} as const

export const typesenseClient = new Typesense.Client({
    nodes: [
        {
            host: "46.224.114.11",
            port: 8108,
            protocol: "http",
        },
    ],
    apiKey: "xyz",
    connectionTimeoutSeconds: 5,
})

export const query_by = "name,sku,slug,url,categories,cids"
export const exclude_fields = [
    "embedding",
    "imgs",
    "charakterystyka_string",
    "description",
    "specyfikacja_string",
    "charakterystyka",
    "specyfikacja",
]

// ─── Interfaces ──────────────────────────────────────────────────────

export interface TypesenseProduct {
    id: string
    name: string
    subtitle?: string
    category: string[]
    price: number
    regularPrice: number
    image: string
    images: string[]
    isNew: boolean
    isBestseller: boolean
    formattedPrice: string
    formattedRegularPrice: string
    discount: number
    reviewsCount: number
    reviewsStars: number
    stock: number
    shipping_amount: number
    shipping_termin: string
    qty: number
    enabled: boolean
    ispresale: boolean
    shipping_days: number
    [key: string]: any
}

export interface TypesenseCategory {
    cid: string
    slug: string
    name: string
    description?: string
    parent_id?: string
    image?: string
    meta_title?: string
    meta_description?: string
    [key: string]: any
}

export interface TypesenseFacet {
    field_name: string
    counts: Array<{
        value: string
        count: number
    }>
}

export interface TypesenseSearchResponse {
    found: number
    hits: Array<{
        document: any
    }>
    facet_counts?: TypesenseFacet[]
}

// ─── Transform ───────────────────────────────────────────────────────

export function transformDataProduct(data: any): TypesenseProduct[] {
    return data.hits.map((hit: any) => hit.document)
}

// ─── URL builder ─────────────────────────────────────────────────────

function buildSearchUrl(
    params: URLSearchParams,
    collection: string = COLLECTION_PRODUCTS
): string {
    return `${TYPESENSE_API_URL}?path=collections/${collection}/documents/search?${params.toString()}`
}

// ─── Products ────────────────────────────────────────────────────────

/**
 * Multi-search (nowa wersja) — używa SDK Typesense.
 * SDK nie przechodzi przez fetch, więc cache Next.js nie działa.
 * Jeśli potrzebujesz cache'owania, rozważ przejście na fetch-based multi-search.
 */
export async function searchProductsNew(
    searches: any
): Promise<TypesenseSearchResponse> {
    try {
        const response = await typesenseClient.multiSearch.perform({ searches })

        if (!response.results) {
            throw new Error("Typesense multi-search: brak results")
        }

        // Fasety z drugiego zapytania (bez filtrów) → do panelu filtrów
        response.results[0]["facet_counts"] = response.results[1]["facet_counts"]

        return response.results[0] as TypesenseSearchResponse
    } catch (error) {
        console.error("[typesense] multi-search error:", error)
        throw error
    }
}

export async function getProduct(slug: string): Promise<any> {
    try {
        const params = new URLSearchParams({
            q: "*",
            query_by: "slug",
            filter_by: `slug:=${slug}`,
            per_page: "1",
        })

        const response = await fetch(buildSearchUrl(params, COLLECTION_PRODUCTS), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-TYPESENSE-API-KEY": process.env.TYPESENSE_API_KEY || "",
            },
            next: { revalidate: CACHE_TTL.PRODUCT_DETAIL },
        })

        if (!response.ok) {
            throw new Error(`Typesense API error: ${response.status}`)
        }

        const data = await response.json()

        return data.hits.length > 0 ? data.hits[0].document : null
    } catch (error) {
        console.error("[typesense] getProduct error:", error)
        throw error
    }
}

export async function getFeaturedProducts(
    type: "new" | "bestseller"
): Promise<TypesenseProduct[]> {
    try {
        const filterField =
            type === "new" ? "isnew:true&&enabled:true" : "cids:354&&enabled:true"

        const params = new URLSearchParams({
            q: "*",
            exclude_fields: exclude_fields.join(","),
            page: "1",
            per_page: "8",
            filter_by: filterField,
        })

        const response = await fetch(buildSearchUrl(params, COLLECTION_PRODUCTS), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            next: { revalidate: CACHE_TTL.FEATURED },
        })

        if (!response.ok) {
            return []
        }

        return await response.json()
    } catch (error) {
        console.error(`[typesense] getFeaturedProducts(${type}) error:`, error)
        return []
    }
}

// ─── Categories ──────────────────────────────────────────────────────

export async function searchCategories(
    query = "*",
    page = 1,
    perPage = 120,
    filters?: {
        slug?: string
        cid?: string
    }
): Promise<TypesenseSearchResponse> {
    try {
        const params = new URLSearchParams({
            q: query || "*",
            page: page.toString(),
            per_page: perPage.toString(),
            query_by: "name,slug",
        })

        const filterConditions: string[] = []

        if (filters?.slug) {
            filterConditions.push(`slug:=${filters.slug}`)
        }

        if (filters?.cid) {
            filterConditions.push(`cid:=${filters.cid}`)
        }

        if (filterConditions.length > 0) {
            params.append("filter_by", filterConditions.join(" && "))
        }

        const response = await fetch(
            buildSearchUrl(params, COLLECTION_CATEGORIES),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                next: { revalidate: CACHE_TTL.CATEGORIES },
            }
        )

        if (!response.ok) {
            throw new Error(`Typesense API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("[typesense] searchCategories error:", error)
        throw error
    }
}

export async function getCategoryBySlug(
    slug: string
): Promise<TypesenseCategory | null> {
    try {
        const response = await searchCategories("*", 1, 1, { slug })

        if (response.found > 0 && response.hits.length > 0) {
            return response.hits[0].document as TypesenseCategory
        }

        return null
    } catch (error) {
        console.error("[typesense] getCategoryBySlug error:", error)
        return null
    }
}