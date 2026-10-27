// Rodzaj strony po samym adresie — dla szkieletu ładowania, który musi pokazać się natychmiast, zanim serwer ustali typ strony.
// Produkty zawsze mają adres w jednym segmencie i kończą się SKU: „…-carinii-r0001-e50-000-000-000.html” albo samym SKU.
// Adres bez rozpoznanego SKU (np. torebka „…-rosalie.html”) dostaje szkielet kategorii — to tylko tymczasowy wygląd.
const SKU_AT_END = /-[a-z]\d{3,6}(-[a-z0-9]{2,4}){4}\.html$/i
const BARE_SKU = /^[a-z]\d{4}(-[a-z0-9]{2,4}){3,4}\.html$/i

export const isProductPath = (pathname: string): boolean => {
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length !== 1) return false
    return SKU_AT_END.test(segments[0]) || BARE_SKU.test(segments[0])
}
