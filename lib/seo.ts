// Wspólne dla SEO: adres sklepu, adresy bezwzględne, czyszczenie opisów do meta description.

// Adres docelowy sklepu (canonical, mapa strony, dane strukturalne). Do czasu przełączenia domeny wskazuje na
// obecny sklep Magento — wersja testowa na Vercelu nie konkuruje wtedy z nim w wynikach wyszukiwania.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sklep.carinii.com.pl').replace(/\/$/, '')

export const SITE_NAME = 'Carinii'

export const COMPANY = {
    legalName: 'Z.P.O. CARINII',
    street: 'ul. Warszawska 78',
    postalCode: '08-450',
    city: 'Łaskarzew',
    country: 'PL',
    email: 'sklep@carinii.com.pl',
}

/** Ścieżka lub adres z Magento -> adres bezwzględny (naprawia też podwójny ukośnik po domenie). */
export const absoluteUrl = (value: string): string => {
    if (/^https?:\/\//i.test(value)) return value.replace(/^(https?:\/\/[^/]+)\/{2,}/, '$1/')
    return `${SITE_URL}/${value.replace(/^\/+/, '')}`
}

/** HTML/tekst z Magento -> jedna linia zwykłego tekstu do meta description (do ~155 znaków, bez urwanych słów). */
export const plainText = (value: unknown, maxLength = 155): string => {
    if (typeof value !== 'string') return ''
    const text = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/\s+/g, ' ')
        .trim()
    if (text.length <= maxLength) return text

    const cut = text.slice(0, maxLength - 1)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}
