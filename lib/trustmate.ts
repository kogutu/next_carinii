// Trustmate: opinie klientów o produktach. Dwa widżety, te same co na sklepie Magento:
//  - hornet: gwiazdki z oceną pod nazwą produktu,
//  - hydra: pełna lista opinii pod opisem.
// Identyfikator produktu w Trustmate to ID produktu głównego z katalogu (np. 86071), jak w Magento.

export const TRUSTMATE_HORNET_TOKEN = process.env.NEXT_PUBLIC_TRUSTMATE_HORNET ?? '63c02570-abc7-4704-ae3f-1f72ed2f5f97'
export const TRUSTMATE_HYDRA_TOKEN = process.env.NEXT_PUBLIC_TRUSTMATE_HYDRA ?? '64c1a036-3f3f-4f4c-8c91-aa254390414f'

export const trustmateScriptUrl = (token: string, productId: string): string =>
    `https://trustmate.io/api/widget/${token}/script?product=${encodeURIComponent(productId)}`

export type TrustmateRating = {
    ratingValue: number
    reviewCount: number
}

/**
 * Prawdziwa ocena produktu z Trustmate (do danych strukturalnych AggregateRating), pobrana po stronie serwera
 * z tego samego endpointu, z którego korzysta widżet. Produkt bez opinii lub błąd = null — wtedy nie
 * wysyłamy żadnej oceny (lepiej nic niż wymyślone dane). Wynik jest cache'owany na godzinę.
 */
export const getTrustmateRating = async (productId: string): Promise<TrustmateRating | null> => {
    try {
        const response = await fetch(
            `https://trustmate.io/widget/api/${TRUSTMATE_HORNET_TOKEN}/html?product=${encodeURIComponent(productId)}`,
            { next: { revalidate: 3600 } },
        )
        if (!response.ok) return null

        const html = await response.text()
        const reviewCount = Number(html.match(/data-reviews="(\d+)"/)?.[1])
        const ratingValue = Number((html.match(/tm-grade-label__text[^>]*>\s*([\d.,]+)/)?.[1] ?? '').replace(',', '.'))

        if (!Number.isFinite(reviewCount) || reviewCount < 1) return null
        if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) return null
        return { ratingValue, reviewCount }
    } catch {
        return null
    }
}
