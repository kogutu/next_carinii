import { create } from "zustand"
import { searchProductsNew, transformDataProduct } from "@/lib/typesense"
import type { ProductsCollection } from "./category-types"
import _ from "lodash"
import { buildPopularitySortBy, getPopularitySkus, POPULARITY_SORT } from "@/lib/popularity"

// Definicje typów
type FilterFields = Record<string, string[]>
type PriceRangeMap = Record<string, [number, number]>
type SortOption = string

interface CategoryConfig {
    categoryId: string
    initialProducts?: ProductsCollection
    initialFacets?: any[]
    initialTotalItems?: number
    fields?: any
    itemsPerPage?: number
}

interface CategoryState {
    // Stan
    products: ProductsCollection
    facets: any[]
    totalItems: number
    isLoading: boolean
    categoryId: string
    itemsPerPage: number
    fields: FilterFields
    priceRange: PriceRangeMap
    page: number
    sort: SortOption
    isInitialized: boolean
    filters: FilterFields
    selectedFiltersURL: any

    // Akcje
    setFilters: (filters: FilterFields) => void
    setPriceRange: (priceRange: PriceRangeMap) => void
    setProducts: (products: ProductsCollection) => void
    initializeStore: (config: CategoryConfig, fetch?: boolean) => void
    fetchProducts: () => Promise<void>
    fetchProductsWithoutCategory: () => Promise<void>
    setCategory: (cid: string) => void
    setPage: (page: number) => void
    setSort: (sort: SortOption) => void
    setPerPage: (perPage: number) => void
    resetFilters: () => void
    setUrlFilters: () => void
    getURLFilters: () => void
}

const startItemPerPage = 100
const DEFAULT_SORT = POPULARITY_SORT

// Rosnący licznik — odrzuca spóźnione (stale) odpowiedzi, gdy user
// szybko klika kilka filtrów pod rząd.
let fetchRequestId = 0

function getSearchString(): string {
    if (typeof window === "undefined") return ""
    return window.location.search || ""
}

export const useCategoryZustand = create<CategoryState>()(
    (set, get) => ({
        // Stan początkowy
        products: [],
        facets: [],
        totalItems: 0,
        categoryId: "0",
        selectedFiltersURL: {},
        filters: {},
        isLoading: false,
        itemsPerPage: startItemPerPage,
        fields: {},
        priceRange: {},
        page: 1,
        sort: DEFAULT_SORT,
        isInitialized: false,

        setProducts: (products: ProductsCollection) => set({ products }),

        initializeStore: (config: CategoryConfig, fetch = true) => {
            const prevCategoryId = get().categoryId
            const categoryChanged = prevCategoryId !== config.categoryId

            const restored = decodeFiltersFromUrl(getSearchString())

            // Zmiana kategorii = nowy kontekst, czyścimy filtry z poprzedniej.
            // Ta sama kategoria (np. re-mount) = szanujemy URL (?f.*, ?pr.*, ?page...).
            const filters = categoryChanged ? {} : sanitizeFilters(restored.filters)
            const priceRange = categoryChanged ? {} : restored.priceRange

            set({
                filters,
                selectedFiltersURL: { filters, priceRange },
                categoryId: config.categoryId,
                products: config.initialProducts || [],
                facets: config.initialFacets || [],
                totalItems: config.initialTotalItems || 0,
                itemsPerPage: restored.itemsPerPage || config.itemsPerPage || startItemPerPage,
                fields: config.fields || {},
                priceRange,
                page: categoryChanged ? 1 : restored.page,
                sort: restored.sort || DEFAULT_SORT,
                isLoading: false,
                isInitialized: true,
            })

            // Jeśli URL ma aktywne filtry/stronę/sort — dociągnij dane klienta.
            // Bez tego SSR-owe produkty nie zgadzałyby się z URL po odświeżeniu.
            const hasUrlState =
                !_.isEmpty(filters) ||
                !_.isEmpty(priceRange) ||
                restored.page > 1 ||
                (restored.sort && restored.sort !== DEFAULT_SORT)

            if (fetch || hasUrlState) {
                get().getURLFilters()
            }
        },

        setFilters: (fs) => {
            const clean = sanitizeFilters(fs)
            // Zmiana filtrów zawsze wraca na stronę 1
            set({ filters: clean, selectedFiltersURL: { filters: clean, priceRange: get().priceRange }, page: 1 })
            get().setUrlFilters()
        },

        setPriceRange: (r) => {
            const clean: PriceRangeMap = {}
            for (const [k, v] of Object.entries(r || {})) {
                if (Array.isArray(v) && v.length === 2 && v.every((n) => typeof n === "number" && !isNaN(n))) {
                    clean[k] = v
                }
            }
            set({ priceRange: clean, selectedFiltersURL: { filters: get().filters, priceRange: clean }, page: 1 })
            get().setUrlFilters()
        },

        setSort: (sort: SortOption) => {
            set({ sort: sort || DEFAULT_SORT, page: 1 })
            get().setUrlFilters()
        },

        setPage: (page: number) => {
            set({ page: Math.max(1, page) })
            if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" })
            }
            get().setUrlFilters()
        },

        setPerPage: (perPage: number) => {
            set({ itemsPerPage: perPage, page: 1 })
            get().setUrlFilters()
        },

        setUrlFilters: () => {
            const state = get()

            const qs = encodeFiltersToUrl(state)
            if (typeof window !== "undefined") {
                const base = window.location.pathname || ""
                window.history.replaceState(null, "", qs ? `${base}?${qs}` : base)
            }

            state.fetchProducts()
        },

        fetchProductsWithoutCategory: async () => {
            set({ isLoading: false })
        },

        fetchProducts: async () => {
            const state = get()

            if (state.categoryId === "0") {
                return get().fetchProductsWithoutCategory()
            }

            if (!state.categoryId) {
                return
            }

            const myId = ++fetchRequestId
            set({ isLoading: true })

            try {
                const popularitySkus = state.sort === POPULARITY_SORT
                    ? await getPopularitySkus(state.categoryId)
                    : []

                // UWAGA: bierzemy stan ze store, NIE z URL.
                // Poprzednia wersja dekodowała window.location.search, co przy
                // szybkim klikaniu dawało wyścig (stary URL vs nowy stan).
                const tsParams = buildTypesenseSearchParams({
                    filters: state.filters,
                    priceRange: state.priceRange,
                    page: state.page,
                    itemsPerPage: state.itemsPerPage,
                    sort: state.sort,
                    catId: state.categoryId,
                    popularitySkus,
                })

                const productsResponse = await searchProductsNew(tsParams)

                // Odrzuć spóźnioną odpowiedź — nowszy fetch już wystartował
                if (myId !== fetchRequestId) return

                const transformedProducts: any = transformDataProduct(productsResponse)

                set({
                    isLoading: false,
                    products: transformedProducts,
                    facets: productsResponse.facet_counts || [],
                    totalItems: productsResponse.found ?? 0,
                })
            } catch (error) {
                if (myId !== fetchRequestId) return
                console.error("[category] Error fetching products:", error)
                set({ isLoading: false })
            }
        },

        setCategory: (cid: string) => {
            set({ categoryId: cid })
        },

        resetFilters: () => {
            set({
                fields: {},
                filters: {},
                selectedFiltersURL: {},
                priceRange: {},
                page: 1,
            })
            get().setUrlFilters()
        },

        getURLFilters: () => {
            // Natychmiast, bez sztucznego setTimeout(100)
            get().fetchProducts()
        },
    })
)

function sanitizeFilters(filters: FilterFields | undefined): FilterFields {
    const out: FilterFields = {}
    if (!filters) return out
    for (const [k, v] of Object.entries(filters)) {
        if (Array.isArray(v)) {
            const vals = v.map((x) => String(x).trim()).filter(Boolean)
            if (vals.length > 0) out[k] = vals
        }
    }
    return out
}

// --- ENCODE: state → URL search params ---
function encodeFiltersToUrl(state: {
    filters: Record<string, string[]>
    priceRange: Record<string, [number, number]>
    page: number
    itemsPerPage: number
    sort: string
}): string {
    const params = new URLSearchParams()

    // filters: f.sizes=38,39&f.kolor=czarny
    if (!_.isEmpty(state.filters)) {
        for (const [key, values] of Object.entries(state.filters)) {
            if (Array.isArray(values) && values.length > 0) {
                params.set(`f.${key}`, values.join(","))
            }
        }
    }

    // priceRange: pr.price=129-593
    if (!_.isEmpty(state.priceRange)) {
        for (const [key, range] of Object.entries(state.priceRange)) {
            if (Array.isArray(range) && range.length === 2) {
                params.set(`pr.${key}`, `${range[0]}-${range[1]}`)
            }
        }
    }

    if (state.page > 1) params.set("page", String(state.page))
    if (state.itemsPerPage && state.itemsPerPage !== startItemPerPage) {
        params.set("perPage", String(state.itemsPerPage))
    }
    if (!_.isEmpty(state.sort) && state.sort && state.sort !== DEFAULT_SORT) {
        params.set("sort", state.sort)
    }

    return params.toString()
}

export function decodeFiltersFromUrl(
    search: string | Record<string, any> | URLSearchParams | undefined | null,
    defaults?: {
        filters?: Record<string, string[]>
        priceRange?: Record<string, [number, number]>
        page?: number
        itemsPerPage?: number
        sort?: string
    }
): {
    filters: Record<string, string[]>
    priceRange: Record<string, [number, number]>
    page: number
    itemsPerPage: number
    sort: string
} {
    // Serwerowy [...slug]/page.tsx przekazuje obiekt searchParams, nie string —
    // normalizujemy oba kształty, żeby filtry z URL działały też w SSR.
    let params: URLSearchParams
    if (!search) {
        params = new URLSearchParams()
    } else if (typeof search === "string") {
        params = new URLSearchParams(search.startsWith("?") ? search : `?${search}`)
    } else if (search instanceof URLSearchParams) {
        params = search
    } else if (typeof search === "object") {
        params = new URLSearchParams()
        for (const [key, value] of Object.entries(search)) {
            if (value === undefined || value === null) continue
            if (Array.isArray(value)) {
                const v = value.join(",")
                if (v) params.set(key, v)
            } else {
                params.set(key, String(value))
            }
        }
    } else {
        params = new URLSearchParams()
    }

    const filters: Record<string, string[]> = { ...(defaults?.filters ?? {}) }
    const priceRange: Record<string, [number, number]> = { ...(defaults?.priceRange ?? {}) }

    for (const [key, value] of params.entries()) {
        if (key.startsWith("f.")) {
            const vals = value.split(",").map((v) => v.trim()).filter(Boolean)
            if (vals.length > 0) filters[key.slice(2)] = vals
        } else if (key.startsWith("pr.")) {
            const parts = value.split("-").map(Number)
            if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
                priceRange[key.slice(3)] = [parts[0], parts[1]]
            }
        }
    }

    // Kompatybilność wstecz: stare linki ?sizes=38&kolor=czarny (bez prefiksu f.)
    const KNOWN_FACET_KEYS = new Set([
        "sizes", "kolor", "materiał", "typ", "cholewka", "wkładka", "wnętrze",
        "ocieplenie", "tęgość", "podeszwa materiał", "rodzaj podeszwy",
        "grubość podeszwy", "wysokość obcasa", "materiał obcasa",
        "wysokość całkowita buta", "ukryty klin", "cat_main", "new",
        "has_special_price", "price",
    ])
    for (const [key, value] of params.entries()) {
        if (key.startsWith("f.") || key.startsWith("pr.") || ["page", "perPage", "sort", "q"].includes(key)) continue
        if (KNOWN_FACET_KEYS.has(key) && value) {
            const vals = String(value).split(",").map((v) => v.trim()).filter(Boolean)
            if (vals.length > 0 && !filters[key]) filters[key] = vals
        }
    }

    return {
        filters,
        priceRange,
        page: Number(params.get("page")) || defaults?.page || 1,
        itemsPerPage: Number(params.get("perPage")) || defaults?.itemsPerPage || startItemPerPage,
        sort: params.get("sort") ?? defaults?.sort ?? DEFAULT_SORT,
    }
}

// Mapowanie wartości sortowania z UI na poprawne Typesense sort_by
function resolveSortBy(sort: string, catId: string, popularitySkus: string[] = []): string {
    const fallback = `sort_cat_${catId}:asc`
    if (!sort || sort === "relevance") return fallback
    if (sort === POPULARITY_SORT) {
        // Brak listy SKU (błąd/pusty plik) — zachowaj sensowną kolejność zamiast błędu
        return popularitySkus.length > 0
            ? buildPopularitySortBy(popularitySkus)
            : "createdat:desc"
    }
    switch (sort) {
        case "price_asc":
        case "price:asc":
            return "price:asc"
        case "price_desc":
        case "price:desc":
            return "price:desc"
        case "name_asc":
        case "name:asc":
            return "name:asc"
        case "name_desc":
        case "name:desc":
            return "name:desc"
        case "newest":
        case "createdat:desc":
            return "createdat:desc"
        case "oldest":
        case "createdat:asc":
            return "createdat:asc"
        default:
            // Pozwól na jawne sort_cat_* lub inne pola, resztę odrzuć do fallbacku
            if (/^[a-zA-Z0-9_]+:(asc|desc)$/.test(sort)) return sort
            return fallback
    }
}

function escapeTypesenseValue(v: string): string {
    return String(v).replace(/\\/g, "\\\\").replace(/`/g, "\\`")
}

// --- BUILD: state → Typesense search params object ---
export function buildTypesenseSearchParams(state: {
    filters: Record<string, string[]>
    priceRange: Record<string, [number, number]>
    page: number
    itemsPerPage: number
    sort: string
    catId: string
    popularitySkus?: string[]
}): Record<string, any>[] {
    const filterParts: string[] = []
    const store = useCategoryZustand.getState()

    if (!state.catId) state.catId = store.categoryId

    // facet filters: sizes:=[`38`, `39`]
    if (!_.isEmpty(state.filters)) {
        for (const [key, values] of Object.entries(state.filters)) {
            if (!Array.isArray(values) || values.length === 0) continue
            // cids/cids_all to de facto kategoria — nie dubluj z categoryFilter
            if (key === "cids" || key === "cids_all") continue
            const k = key
            filterParts.push(`${k}:=[${values.map((v) => `\`${escapeTypesenseValue(v)}\``).join(",")}]`)
        }
    }

    // range filters: price:[129..593]
    if (!_.isEmpty(state.priceRange)) {
        for (const [key, range] of Object.entries(state.priceRange)) {
            if (Array.isArray(range) && range.length === 2) {
                const [lo, hi] = range
                if (typeof lo === "number" && typeof hi === "number" && !isNaN(lo) && !isNaN(hi)) {
                    filterParts.push(`${key}:[${lo}..${hi}]`)
                }
            }
        }
    }

    const categoryFilter = `cids_all:=[${state.catId}]`
    const productFilterBy = filterParts.length > 0
        ? `${categoryFilter} && ${filterParts.join(" && ")}`
        : categoryFilter

    return [
        // produkty z filtrami + kategoria
        {
            collection: "carinii_prs",
            q: "*",
            filter_by: productFilterBy,
            facet_by: "*",
            max_facet_values: 1000,
            sort_by: resolveSortBy(state.sort, state.catId, state.popularitySkus),
            page: state.page ?? 1,
            per_page: state.itemsPerPage ?? startItemPerPage,
        },
        // fasety tylko z kategorią (do panelu filtrów)
        {
            collection: "carinii_prs",
            q: "*",
            filter_by: categoryFilter,
            facet_by: "*",
            max_facet_values: 1000,
            page: 1,
            per_page: 0,
        },
    ]
}
