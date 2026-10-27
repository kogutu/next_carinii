// Rękawiczki (SKU zaczyna się od „R”) mają w Magento rozmiary 36/37/38, a klientce pokazujemy S/M/L.
// Zmieniamy tylko etykietę: wartość 36/37/38 zostaje wszędzie, gdzie służy do wyboru wariantu, koszyka i zamówienia.
const GLOVE_SIZE_LABELS: Record<string, string> = { "36": "S", "37": "M", "38": "L" }

export const isGloveSku = (sku?: string | null): boolean => /^R/i.test((sku ?? "").trim())

export const sizeLabel = (sku: string | null | undefined, size: string | number): string => {
    const value = String(size)
    return isGloveSku(sku) ? (GLOVE_SIZE_LABELS[value] ?? value) : value
}

// Rękawiczki mają tylko S/M/L — pozostałe rozmiary z katalogu (35, 39–41, zawsze po 0 szt.) nie mają dla nich sensu
export const isSizeShown = (sku: string | null | undefined, size: string | number): boolean =>
    !isGloveSku(sku) || String(size) in GLOVE_SIZE_LABELS
