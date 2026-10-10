import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Zablokowane są strony bez wartości dla wyszukiwarki (koszyk, kasa, konto, wyniki wyszukiwania, potwierdzenia, API)
// oraz adresy z parametrami filtrów i sortowania — te same produkty są dostępne pod czystymi adresami kategorii.
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/checkout', '/koszyk', '/klient/', '/search', '/success/', '/ulubione', '/*?*sort=', '/*?*f.'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    }
}
