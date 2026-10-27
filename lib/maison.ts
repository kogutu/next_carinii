import { typesenseClient } from "@/lib/typesense"
import { normalizeMediaUrl } from "@/lib/mediaUrl"

import {
    MAISON_BOTKI_ID,
    MAISON_CATEGORY_ID,
    type MaisonCategory,
    type MaisonProduct,
    type MaisonScope,
    withRetouched,
} from "@/lib/maisonShared"

const INCLUDE_FIELDS = [
    "sku", "name", "slug", "image_small", "image_thumbnail", "image_main", "price", "special_price",
    "has_special_price", "new", "size_qty", "shortdesc", "typ", "cids_all", "model", "imgs",
].join(",")

const FILTERS: Record<MaisonScope, string> = {
    all: `cids_all:=[${MAISON_CATEGORY_ID}]`,
    botki: `cids_all:=[${MAISON_BOTKI_ID}]`,
    kozaki: `cids_all:=[${MAISON_CATEGORY_ID}] && cids_all:!=[${MAISON_BOTKI_ID}]`,
}

const modelNumber = (sku: string) => Number(sku.slice(1, 4)) || 0

const toProduct = (doc: any): MaisonProduct => {
    const sizeQty: Record<string, number> = doc.size_qty ?? {}
    const sizes = Object.keys(sizeQty)
        .map((key) => ({ size: key.replace("roz", ""), qty: Number(sizeQty[key]) || 0 }))
        .sort((a, b) => Number(a.size) - Number(b.size))
    const special = Number(doc.special_price)
    // zdjęcia z galerii są oryginałami; image_small to miniatura 500 px, która na ekranie Retina wygląda miękko
    // sesja idzie przed packshotem; po retuszu adresy zdjęć są podmienione, ale packshot rozpoznajemy po oryginale
    const gallery = withRetouched(doc.sku, (doc.imgs ?? []).map((src: string) => normalizeMediaUrl(src)).filter(Boolean))
    const session = gallery.filter((photo) => !photo.packshot).map((photo) => photo.src)
    const lead = gallery.find((photo) => !photo.packshot) ?? gallery[0]
    const image = session[0] ?? gallery[0]?.src ?? normalizeMediaUrl(doc.image_small || doc.image_main || "")
    const imageHover = session[1] ?? normalizeMediaUrl(doc.image_thumbnail || "") ?? ""

    const name = String(doc.name ?? "").split("CARINII")[0].trim()
    const shortdesc = String(doc.shortdesc ?? "").trim()

    return {
        sku: doc.sku,
        slug: doc.slug,
        name,
        // krótki opis bywa powtórzeniem nazwy — wtedy nie pokazujemy go drugi raz
        tagline: shortdesc.toLowerCase() === name.toLowerCase() ? "" : shortdesc,
        image,
        imageIsPackshot: lead?.packshot ?? false,
        imageHover: imageHover || image,
        price: Number(doc.price) || 0,
        specialPrice: doc.has_special_price && special > 0 ? special : null,
        isNew: doc.new === "1" || doc.new === 1,
        category: (doc.cids_all ?? []).includes(String(MAISON_BOTKI_ID)) ? "botki" : "kozaki",
        sizes,
        model: String(doc.model ?? ""),
    }
}

const rank = (product: MaisonProduct) => [
    product.imageIsPackshot ? 1 : 0,
    product.category === "kozaki" ? 0 : 1,
    modelNumber(product.sku),
] as const

const compareProducts = (a: MaisonProduct, b: MaisonProduct) => {
    const ra = rank(a)
    const rb = rank(b)
    for (let i = 0; i < ra.length; i++) {
        if (ra[i] !== rb[i]) return ra[i] - rb[i]
    }
    return a.sku.localeCompare(b.sku)
}

// Produkty strefy Maison prosto z Typesense. Błąd zwraca pustą listę — strona pokaże komunikat zamiast 500.
export async function getMaisonProducts(scope: MaisonScope = "all", excludeSku?: string): Promise<MaisonProduct[]> {
    try {
        const response = await typesenseClient
            .collections("carinii_prs")
            .documents()
            .search({
                q: "*",
                query_by: "name",
                filter_by: `${FILTERS[scope]} && status:=true`,
                include_fields: INCLUDE_FIELDS,
                per_page: 100,
            } as any)

        return (response.hits ?? [])
            .map((hit: any) => toProduct(hit.document))
            .filter((product) => product.sku !== excludeSku)
            .sort(compareProducts)
    } catch (error) {
        console.error("[maison] getMaisonProducts error:", error)
        return []
    }
}
