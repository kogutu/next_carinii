import { COMPANY, SITE_NAME, SITE_URL, absoluteUrl, plainText } from '@/lib/seo'
import { normalizeMediaUrl } from '@/lib/mediaUrl'

// Dane strukturalne schema.org (JSON-LD) — wyświetlane w Google jako ceny, dostępność i okruszki w wynikach.

const ORGANIZATION_ID = `${SITE_URL}/#organization`

export const organizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    legalName: COMPANY.legalName,
    url: SITE_URL,
    logo: absoluteUrl('/fav/znaczek.png'),
    email: COMPANY.email,
    address: {
        '@type': 'PostalAddress',
        streetAddress: COMPANY.street,
        postalCode: COMPANY.postalCode,
        addressLocality: COMPANY.city,
        addressCountry: COMPANY.country,
    },
    sameAs: ['https://www.facebook.com/Carinii-266421236855019/', 'https://www.instagram.com/cariniifabrykaobuwia'],
})

export const websiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    inLanguage: 'pl-PL',
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
    },
})

export type Crumb = { name: string; path: string }

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Strona główna', path: '/' }, ...crumbs].map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
    })),
})

type CategoryNode = { name: string; url: string; children?: CategoryNode[] }

/** Ścieżka od korzenia drzewa kategorii do węzła, który spełnia warunek (pusta, gdy nie ma takiego). */
export const categoryCrumbs = (tree: unknown, matches: (node: CategoryNode) => boolean): Crumb[] => {
    const walk = (nodes: CategoryNode[], trail: Crumb[]): Crumb[] | null => {
        for (const node of nodes) {
            const next = [...trail, { name: node.name.trim(), path: node.url }]
            if (matches(node)) return next
            const found = node.children?.length ? walk(node.children, next) : null
            if (found) return found
        }
        return null
    }
    return Array.isArray(tree) ? walk(tree as CategoryNode[], []) ?? [] : []
}

type ProductDoc = {
    name: string
    slug: string
    sku?: string
    model?: string
    kolor?: string
    description?: string
    shortdesc?: string
    imgs?: string[]
    image_main?: string
    final_price?: number
    price?: number
    qty_all?: number
    size_qty?: Record<string, number>
}

const inStock = (product: ProductDoc): boolean => {
    if (typeof product.qty_all === 'number') return product.qty_all > 0
    return Object.values(product.size_qty ?? {}).some((qty) => qty > 0)
}

export const productSchema = (product: ProductDoc) => {
    const images = (product.imgs?.length ? product.imgs : product.image_main ? [product.image_main] : [])
        .slice(0, 8)
        .map((src) => absoluteUrl(normalizeMediaUrl(src)))
    const price = product.final_price ?? product.price

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        ...(product.model ? { mpn: product.model } : {}),
        ...(product.kolor ? { color: product.kolor } : {}),
        description: plainText(product.description || product.shortdesc || product.name, 5000),
        image: images,
        brand: { '@type': 'Brand', name: SITE_NAME },
        ...(typeof price === 'number' && price > 0
            ? {
                offers: {
                    '@type': 'Offer',
                    url: absoluteUrl(product.slug),
                    priceCurrency: 'PLN',
                    price: price.toFixed(2),
                    itemCondition: 'https://schema.org/NewCondition',
                    availability: inStock(product) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                    seller: { '@id': ORGANIZATION_ID },
                },
            }
            : {}),
    }
}
