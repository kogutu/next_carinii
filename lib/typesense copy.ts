// Główny plik z funkcjami Typesense - łączy kategorie i produkty
const TYPESENSE_API_URL = "https://sklep.carinii.com.pl/directseo/nextjs/api"

const COLLECTION_MEBLE = "carinii_prs"
const COLLECTION_CATEGORIES = "carinii_cats"

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

// ===== INTERFACES =====

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

// ===== TRANSFORM FUNCTIONS =====

export function transformDataProduct(data: any): TypesenseProduct[] {
    console.log(data);

    return data.hits.map((hit: any) => hit.document);;
}

// ===== PRODUCTS FUNCTIONS =====

export async function searchProducts(
    query = "*",
    cids: any[],
    page: any = 1,
    perPage = 120,
    filters?: any,
    sort_by: string = "createdat:desc"
): Promise<TypesenseSearchResponse> {

    try {
        const params = new URLSearchParams({
            q: query || "*",
            query_by: query_by,
            page: page.toString(),
            per_page: perPage.toString(),
            sort_by: sort_by,
            exclude_fields: exclude_fields.join(","),
            facet_by: "categories,price",
            max_candidates: '4',
            max_facet_values: '10'
        })






        // Add filter conditions
        const filterConditions: string[] = [`status:true`]
        if (cids?.length > 0) {
            filterConditions.push(`cids:[${cids.map((c: any) => `\`${c}\``).join(",")}]`)
        }
        if (filters?.categories?.length > 0) {
            filterConditions.push(`cids:[${filters.categories.map((c: any) => `\`${c}\``).join(",")}]`)
        }


        if (filters?.colors?.length > 0) {
            filterConditions.push(`color.facet:[${filters.colors.map((c: any) => `\`${c}\``).join(",")}]`)
        }

        if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
            const min = filters.priceMin ?? 0
            const max = filters.priceMax ?? 999999
            filterConditions.push(`price:[${min}..${max}]`)
        }

        if (filters?.pid) {
            filterConditions.push(`pid:=${filters.pid}`)
        }


        if (filters) {

            for (let f in filters.fields) {
                var fs = filters.fields[f]
                if (hasOnlyNumericItems(fs)) {
                    filterConditions.push(`${f}:${fs}`)

                }
                else {
                    filterConditions.push(`${f}:=${fs}`)
                }


            }
        }

        console.log("filterConditions", filterConditions);

        if (filterConditions.length > 0) {
            params.append("filter_by", filterConditions.join(" && "))
        }

        console.log(setUrlCollection(params, true));

        const response = await fetch(setUrlCollection(params.toString(), true), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        })

        if (!response.ok) {
            throw new Error(`Typesense API error: ${response.status}`)
        }

        const data = await response.json()

        return (data)

    } catch (error) {
        console.error("[v0] Typesense search error:", error)
        throw error
    }
}
function setUrlCollectionSearch(params: any, proxy = false) {
    if (proxy) {
        return `${TYPESENSE_API_URL}?path=collections/${COLLECTION_MEBLE}/documents/search?${params.toString()}`;
    } else {
        return `${TYPESENSE_API_URL}/collections/${COLLECTION_MEBLE}/documents/search?${params.toString()}`;
    }
}
function hasOnlyNumericItems(array: any) {
    return Array.isArray(array) &&
        array.length > 0 &&
        array.every(item => {
            // Sprawdź czy to number
            if (typeof item === 'number') {
                return !isNaN(item);
            }
            // Sprawdź czy to string który można przekonwertować na number
            if (typeof item === 'string') {
                return !isNaN(Number(item)) && item.trim() !== '';
            }
            // Odrzuć inne typy
            return false;
        });
}
export async function getProduct(slug: string): Promise<any> {
    try {
        const params = new URLSearchParams({
            q: "*", // Możesz zmienić na konkretną wartość jeśli chcesz
            query_by: "slug", // Wyszukuj po polu slug
            filter_by: `slug:=${slug}`, // Dokładne dopasowanie slug i status aktywny
            per_page: "1", // Tylko jeden produkt
        })

        console.log(setUrlCollectionSearch(params.toString(), true));
        // throw new Error(`Typesense API error`)


        const response = await fetch(setUrlCollectionSearch(params.toString(), true), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "X-TYPESENSE-API-KEY": process.env.TYPESENSE_API_KEY || "", // Pamiętaj o kluczu API
            },
            cache: "no-store",
        })

        console.log(slug);
        if (!response.ok) {
            throw new Error(`Typesense API error: ${response.status}`)
        }
        const data = await response.json()

        // Zwróć pierwszy znaleziony produkt lub null jeśli nie znaleziono
        return data.hits.length > 0 ? data.hits[0].document : null
    } catch (error) {
        console.error("[v0] Typesense search error:", error)
        throw error
    }
}
export async function getFeaturedProducts(type: "new" | "bestseller"): Promise<TypesenseProduct[]> {
    try {
        const filterField = type === "new" ? "isnew:true&&enabled:true" : "cids:354&&enabled:true"
        const params = new URLSearchParams({
            q: "*",
            exclude_fields: exclude_fields.join(","),
            page: "1",
            // t: new Date().getTime().toString(),
            per_page: "8",
            filter_by: filterField,
        })

        const response = await fetch(setUrlCollectionSearch(params.toString(), true), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            cache: "no-store",
        })

        if (!response.ok) {
            return []
        }

        const data = await response.json()
        return (data)
    } catch (error) {
        console.error(`[v0] Error fetching ${type} products:`, error)
        return []
    }
}

// ===== CATEGORIES FUNCTIONS =====

export async function searchCategories(
    query = "*",
    page = 1,
    perPage = 120,
    filters?: {
        slug?: string
        cid?: string
    },
): Promise<TypesenseSearchResponse> {
    try {
        const params = new URLSearchParams({
            q: query || "*",
            page: page.toString(),
            per_page: perPage.toString(),
            query_by: "name,slug",
        })







        // Add filter conditions
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
        console.log(setUrlCollectionSearch(params.toString(), true));


        const response = await fetch(
            setUrlCollectionSearch(params.toString(), true),
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            },
        )

        if (!response.ok) {
            throw new Error(`Typesense API error: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error) {
        console.error("[v0] Typesense categories search error:", error)
        throw error
    }
}

export async function getCategoryBySlug(slug: string): Promise<TypesenseCategory | null> {
    try {
        console.log("[v0] Fetching category by slug:", slug)
        const response = await searchCategories("*", 1, 1, { slug })
        console.log(response);
        if (response.found > 0 && response.hits.length > 0) {
            console.log("✅CatData:", response.hits[0].document)

            return response.hits[0].document as TypesenseCategory
        }

        return null
    } catch (error) {
        console.error("[v0] Error fetching category by slug:", error)
        return null
    }
}
