// Część wspólna strefy Maison, bezpieczna dla przeglądarki (bez klienta Typesense).
// Strefa Maison Carinii: kategoria 344 w Typesense (cids_all), podkategorie Botki 345 i Kozaki 346.
// Część produktów (np. M008, M010, M002) jest w 344, ale w Magento nie ma przypisanej podkategorii 346,
// dlatego Kozaki = wszystko z 344, co nie jest w Botkach.
export const MAISON_CATEGORY_ID = 344
export const MAISON_BOTKI_ID = 345

import retouched from "@/data/maison-retouched.json"

// Pliki B<numer>-M-<numer>.jpg to packshoty na białym tle; reszta to zdjęcia z sesji.
export const isPackshot = (img: string) => /\/B\d+-M-[^/]*\.jpe?g$/i.test(img)

const retouchedPhotos: Record<string, Record<string, string>> = retouched

// Zdjęcia po retuszu (scripts/maison-retouch.mjs --publish) podmieniają oryginały z Typesense: klucz to SKU i pozycja w galerii.
// Packshot rozpoznajemy po oryginalnej nazwie pliku, bo wynik retuszu ma już inną.
export const withRetouched = (sku: string, imgs: string[]): { src: string; packshot: boolean }[] =>
    imgs.map((src, index) => ({ src: retouchedPhotos[sku]?.[index] ?? src, packshot: isPackshot(src) }))

export type MaisonScope = "all" | "kozaki" | "botki"
export type MaisonCategory = "kozaki" | "botki"

export type MaisonSize = { size: string; qty: number }

// Tylko to, co potrzebuje karta — dokument z Typesense ma kilkadziesiąt pól, nie wysyłamy ich całych do przeglądarki.
export type MaisonProduct = {
    sku: string
    slug: string
    name: string
    tagline: string
    image: string
    // zdjęcie główne to packshot na białym tle (liczy się przy kolejności na liście)
    imageIsPackshot: boolean
    imageHover: string
    price: number
    specialPrice: number | null
    isNew: boolean
    category: MaisonCategory
    sizes: MaisonSize[]
    model: string
}

export const MAISON_PATHS = {
    home: "/maison",
    kozaki: "/maison/kozaki",
    botki: "/maison/botki",
    collection: "/maison/kolekcja",
} as const

export const MAISON_TITLES: Record<MaisonScope, string> = {
    all: "Odkryj kolekcję",
    kozaki: "Kozaki",
    botki: "Botki",
}

export const isMaisonProduct = (product: object) => {
    const ids = (product as { cids_all?: unknown }).cids_all
    return Array.isArray(ids) && ids.map(String).includes(String(MAISON_CATEGORY_ID))
}

export const formatMaisonPrice = (value: number) =>
    `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} PLN`
