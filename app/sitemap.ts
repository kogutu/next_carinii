import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Mapa strony z listy adresów sklepu (ta sama, z której korzysta routing): kategorie, produkty i strony informacyjne.
const SLUGS_URL = 'https://sklep.carinii.com.pl/directseo/nextjs/slugs.php?t=3'

// Odświeżana co godzinę — nowe produkty pojawiają się w mapie bez ręcznego budowania
export const revalidate = 3600

type SlugEntry = { path: string; type: string }

// Strony techniczne z Magento (no-route, formularze) nie mają trafiać do indeksu
const EXCLUDED_CMS = /^(no-route|enable-cookies|privacy-policy-cookie|contact$|sprzedaj-maszyne|przedstawiciele)/i

const PRIORITY: Record<string, number> = { home: 1, category: 0.8, product: 0.7, cms_page: 0.3 }
const FREQUENCY: Record<string, MetadataRoute.Sitemap[number]['changeFrequency']> = {
    home: 'daily',
    category: 'daily',
    product: 'weekly',
    cms_page: 'monthly',
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const home: MetadataRoute.Sitemap[number] = {
        url: `${SITE_URL}/`,
        changeFrequency: FREQUENCY.home,
        priority: PRIORITY.home,
    }

    try {
        const response = await fetch(SLUGS_URL, { next: { revalidate: 3600 } })
        if (!response.ok) return [home]

        const entries: SlugEntry[] = await response.json()
        const pages = entries
            .filter((entry) => entry.path && ['category', 'product', 'cms_page'].includes(entry.type))
            .filter((entry) => entry.type !== 'cms_page' || !EXCLUDED_CMS.test(entry.path))
            .map((entry) => ({
                url: `${SITE_URL}/${entry.path.replace(/^\/+/, '')}`,
                changeFrequency: FREQUENCY[entry.type],
                priority: PRIORITY[entry.type],
            }))

        return [home, ...pages]
    } catch (error) {
        console.error('[sitemap]', error)
        return [home]
    }
}
