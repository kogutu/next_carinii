// Dane produktu potrzebne w zdarzeniach analitycznych zamówienia (ID produktu głównego, adres, zdjęcie, kategorie).
// Plik bez zależności serwerowych — używany i po stronie serwera (pobranie z Typesense), i w przeglądarce.

export type TrackingProduct = {
    // ID produktu głównego w katalogu (np. "86071") — te same ID wysyłał dotychczasowy sklep Magento
    id: string
    sku: string
    name: string
    slug: string
    image: string
    categoryIds: string[]
    categoryNames: string[]
}

/** sku pozycji zamówienia/koszyka ma doklejony rozmiar („…MO1roz_38”) — sku modelu jest bez niego. */
export const modelSku = (sku: string): string => sku.replace(/roz_?\d+(?:\.\d+)?$/i, '')
