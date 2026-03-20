import { create } from "zustand"
import { searchProductsNew, transformDataProduct, type TypesenseProduct } from "@/lib/typesense"
import { ProductsCollection } from "./category-types"
import _ from "lodash"

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

interface ParsedFilterCondition {
    fields: FilterFields
    priceRange: [number, number] | null
}

const startItemPerPage = 100

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
        sort: "createdat:desc",
        isInitialized: false,

        setProducts: (products: ProductsCollection) => set({ products }),

        initializeStore: (config: CategoryConfig, fetch = true) => {
            const restored = decodeFiltersFromUrl(window.location.search)

            set({
                filters: {},
                categoryId: config.categoryId,
                products: config.initialProducts || [],
                facets: config.initialFacets || [],
                totalItems: config.initialTotalItems || 0,
                itemsPerPage: restored.itemsPerPage || startItemPerPage,
                fields: config.fields || {},
                priceRange: restored.priceRange,
                page: restored.page,
                sort: restored.sort || "createdat:desc",
                isLoading: false,
                isInitialized: true,
            })

            if (fetch) {
                get().getURLFilters()
            }
        },

        setFilters: (fs) => {
            set({ filters: fs })
            get().setUrlFilters()
        },

        setPriceRange: (r) => {
            set({ priceRange: r })
            get().setUrlFilters()
        },

        setSort: (sort: SortOption) => {
            set({ sort, page: 1 })
            get().setUrlFilters()
        },

        setPage: (page: number) => {
            set({ page })
            window.scrollTo({ top: 0, behavior: "smooth" })
            get().setUrlFilters()
        },

        setPerPage: (perPage: number) => {
            set({ itemsPerPage: perPage })
            get().setUrlFilters()
        },

        setUrlFilters: () => {
            const state = get()

            const qs = encodeFiltersToUrl(state)
            window.history.replaceState(null, "", `?${qs}`)

            state.fetchProducts()
        },

        fetchProductsWithoutCategory: async () => {
            const state = get()

            set({ isLoading: true })

            // try {100
            //     const productsResponse = await searchProducts(
            //         "*",
            //         [],
            //         state.page,
            //         state.itemsPerPage,
            //         {
            //             fields: state.fields,
            //         },
            //         state.sort,
            //     )

            //     const transformedProducts: any = transformDataProduct(productsResponse)

            //     set({
            //         isLoading: false,
            //         products: transformedProducts,
            //         facets: productsResponse.facet_counts || [],
            //         totalItems: productsResponse.found,
            //     })
            // } catch (error) {
            //     console.error("[v0] Error fetching products:", error)
            //     set({ isLoading: false })
            // }
        },

        fetchProducts: async () => {
            const state = get()

            if (state.categoryId === "0") {
                return get().fetchProductsWithoutCategory()
            }

            if (!state.categoryId) {
                console.log("[v0] fetchProducts: no categoryId, skipping")
                return
            }

            const restored = decodeFiltersFromUrl(window.location.search)
            const tsParams = buildTypesenseSearchParams({
                ...restored,
                catId: state.categoryId,
            })

            set({ isLoading: true })

            try {
                const productsResponse = await searchProductsNew(tsParams)
                const transformedProducts: any = transformDataProduct(productsResponse)

                console.log(productsResponse);

                set({
                    isLoading: false,
                    products: transformedProducts,
                    facets: productsResponse.facet_counts || [],
                    totalItems: productsResponse.found,
                })
            } catch (error) {
                console.error("[v0] Error fetching products:", error)
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
                priceRange: {},
                page: 1,
            })

            setTimeout(() => {
                get().setUrlFilters()
            }, 0)
        },

        getURLFilters: () => {
            setTimeout(() => {
                get().fetchProducts()
            }, 100)
        },
    })
)

// --- ENCODE: state → URL search params ---
function encodeFiltersToUrl(state: {
    filters: Record<string, string[]>
    priceRange: Record<string, [number, number]>
    page: number
    itemsPerPage: number
    sort: string
}): string {
    const params = new URLSearchParams()

    // filters: f.sizes=38,39&f.colors=red,blue
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
    if (!_.isEmpty(state.sort) && state.sort) params.set("sort", state.sort)

    return params.toString()
}

export function decodeFiltersFromUrl(
    search: string,
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
    const params = new URLSearchParams(search)

    const filters: Record<string, string[]> = { ...(defaults?.filters ?? {}) }
    const priceRange: Record<string, [number, number]> = { ...(defaults?.priceRange ?? {}) }

    for (const [key, value] of params.entries()) {
        if (key.startsWith("f.")) {
            filters[key.slice(2)] = value.split(",")
        } else if (key.startsWith("pr.")) {
            const parts = value.split("-").map(Number)
            if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
                priceRange[key.slice(3)] = [parts[0], parts[1]]
            }
        }
    }

    return {
        filters,
        priceRange,
        page: Number(params.get("page")) || defaults?.page || 1,
        itemsPerPage: Number(params.get("perPage")) || defaults?.itemsPerPage || startItemPerPage,
        sort: params.get("sort") ?? defaults?.sort ?? "",
    }
}

// --- BUILD: state → Typesense search params object ---
export function buildTypesenseSearchParams(state: {
    filters: Record<string, string[]>
    priceRange: Record<string, [number, number]>
    page: number
    itemsPerPage: number
    sort: string
    catId: string
}): Record<string, any>[] {
    const filterParts: string[] = []
    const store = useCategoryZustand.getState()

    if (!state.catId) state.catId = store.categoryId

    // facet filters: sizes:=[`38`, `39`]
    if (!_.isEmpty(state.filters)) {
        for (const [key, values] of Object.entries(state.filters)) {
            if (Array.isArray(values) && values.length > 0) {
                const k = key === "cids" ? "cids_all" : key
                filterParts.push(`${k}:=[${values.map((v) => `\`${v}\``).join(",")}]`)
            }
        }
    }

    // range filters: price:[129..593]
    if (!_.isEmpty(state.priceRange)) {
        for (const [key, range] of Object.entries(state.priceRange)) {
            if (Array.isArray(range) && range.length === 2) {
                filterParts.push(`${key}:[${range[0]}..${range[1]}]`)
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
            sort_by: "sort_cat_" + state.catId + ":asc",
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

// Helper function do parsowania warunków filtrowania (legacy)
function parseFilterConditions(filterBy: string | null): ParsedFilterCondition {
    const fields: FilterFields = {}
    let priceRange: [number, number] | null = null

    if (!filterBy) {
        return { fields, priceRange }
    }

    const conditions = filterBy.split(" && ").map((c) => c.trim())

    conditions.forEach((condition) => {
        if (condition.startsWith("price:>=")) {
            const minPrice = parseFloat(condition.replace("price:>=", ""))
            if (!priceRange) priceRange = [minPrice, Infinity]
            else priceRange[0] = minPrice
        } else if (condition.startsWith("price:<=")) {
            const maxPrice = parseFloat(condition.replace("price:<=", ""))
            if (!priceRange) priceRange = [0, maxPrice]
            else priceRange[1] = maxPrice
        } else if (condition.includes(":[")) {
            const match = condition.match(/^(.+?):\[(.+)\]$/)
            if (match) {
                const [, field, valuesStr] = match
                const values = valuesStr
                    .split(",")
                    .map((v) => v.trim().replace(/`/g, ""))
                fields[field] = values
            }
        }
    })

    if (priceRange) {
        if (priceRange[0] === 0 && priceRange[1] === Infinity) {
            priceRange = null
        } else if (priceRange[1] === Infinity) {
            priceRange = null
        }
    }

    return { fields, priceRange }
}