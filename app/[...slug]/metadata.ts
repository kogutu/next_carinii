// app/[slug]/metadata.ts
import { Metadata } from 'next'
import { cache } from 'react'
import {
    getCategoryBySlug,
    getProduct,
} from "@/lib/typesense"
import { detectPageType } from "@/lib/page-type-detector"

// ─── Types ───────────────────────────────────────────────────────────

interface PageProps {
    params: {
        slug: string[]
    }
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

const CMS_URL = `${process.env.BACKEND_URL}/nextjs/cms.php`
console.log(CMS_URL);
// ─── Cache'owane funkcje ───────────────────────────────────────────

/**
 * Cache'owane pobieranie kategorii - to samo wywołanie zwróci ten sam wynik
 */
export const getCachedCategory = cache(async (identifier: string) => {
    console.log("---++++" + identifier);
    return await getCategoryBySlug(identifier)
})

/**
 * Cache'owane pobieranie produktu
 */
export const getCachedProduct = cache(async (slug: string) => {
    return await getProduct(slug)
})

/**
 * Cache'owane pobieranie CMS danych
 */
export const getCachedCMSData = cache(async () => {
    const res = await fetch(CMS_URL, { cache: "force-cache" })
    return await res.json()
})

/**
 * Cache'owane wykrywanie typu strony
 */
export const getCachedPageType = cache(async (slug: string[]) => {
    return await detectPageType(slug)
})

// ─── Metadata Generators ────────────────────────────────────────────

/**
 * Generuje metadane dla strony kategorii
 */
async function generateCategoryMetadata(identifier: string, slug: string[]): Promise<Metadata> {
    const category = await getCachedCategory(identifier)

    if (!category) {
        return {
            title: 'Kategoria nie istnieje | Sobianek',
            robots: {
                index: false,
            },
        }
    }
    // console.log(category);
    const categoryTitle = category?.meta_title ?? `${category.name} | Sobianek - Obuwie Damskie i Torebki`
    const categoryDescription = category?.meta_description ?? `Odkryj kolekcję ${category.name} w sklepie Sobianek. Znajdziesz tu eleganckie buty damskie, torebki i dodatki najwyższej jakości. Sprawdź naszą ofertę!`

    return {
        title: categoryTitle,
        description: categoryDescription,
        keywords: `${category.name}, buty damskie ${category.name.toLowerCase()}, torebki ${category.name.toLowerCase()}, Sobianek ${category.name}`,
        openGraph: {
            title: categoryTitle,
            description: categoryDescription,
            url: `/${category.slug}`,
            images: category.image
                ? [
                    {
                        url: category.image,
                        width: 1200,
                        height: 630,
                        alt: category.name,
                    },
                ]
                : [
                    {
                        url: "/fav/og-icon.jpg",
                        width: 1200,
                        height: 630,
                        alt: category.name,
                    },
                ],
        },
        twitter: {
            title: categoryTitle,
            description: categoryDescription,
            images: category.image ? [category.image] : "/fav/og-icon.jpg",
        },
        alternates: {
            canonical: `/${category.slug}`,
        },
        robots: {
            index: true,
            follow: true,
        },
    }
}

/**
 * Generuje metadane dla strony produktu
 */
async function generateProductMetadata(slug: string): Promise<Metadata> {
    const product = await getCachedProduct(slug)

    if (!product) {
        return {
            title: 'Produkt nie istnieje | Sobianek',
            robots: {
                index: false,
            },
        }
    }

    const productTitle = `${product.name} | Sobianek`
    const productDescription = product.description ||
        `Sprawdź ${product.name} w sklepie Sobianek. ${product.cat_main?.join(', ')} - wysokiej jakości obuwie damskie i dodatki. Zamów online!`

    return {
        title: product.name,
        description: productDescription,
        keywords: `${product.name}, ${product.cat_main?.join(', ')}, buty damskie, torebki, Sobianek`,
        openGraph: {
            title: productTitle,
            description: productDescription,
            url: `/produkt/${product.slug}`,
            images: product.image_main
                ? [
                    {
                        url: product.image_main,
                        width: 800,
                        height: 800,
                        alt: product.name,
                    },
                ]
                : undefined,
            ...(product.has_special_price && {
                price: {
                    amount: product.special_price,
                    currency: 'PLN',
                },
            }),
            availability: product.size_qty && Object.keys(product.size_qty).length > 0
                ? 'in stock'
                : 'out of stock',
        },
        twitter: {
            title: productTitle,
            description: productDescription,
            images: product.image_main ? [product.image_main] : undefined,
        },
        alternates: {
            canonical: `/produkt/${product.slug}`,
        },
        robots: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
        },
    }
}

/**
 * Generuje metadane dla stron sklepu (koszyk, finalizacja, itp.)
 */
function generateShopMetadata(slug: string[]): Metadata {
    const shopType = slug.some((s) => ['koszyk', 'cart'].includes(s.toLowerCase()))
        ? 'koszyk'
        : slug.some((s) => ['checkout', 'finalizacja'].includes(s.toLowerCase()))
            ? 'finalizacja'
            : slug.some((s) => ['zamowienie', 'order'].includes(s.toLowerCase()))
                ? 'zamowienie'
                : 'sklep'

    const shopMetadata = {
        koszyk: {
            title: 'Koszyk zakupów | Sobianek',
            description: 'Zobacz zawartość swojego koszyka w sklepie Sobianek. ',
            robots: { index: false, follow: true } as const,
        },
        finalizacja: {
            title: 'Finalizacja zamówienia | Sobianek',
            description: 'Dokończ zakupy w sklepie Sobianek. Wprowadź dane dostawy i wybierz metodę płatności.',
            robots: { index: false, follow: true } as const,
        },
        zamowienie: {
            title: 'Potwierdzenie zamówienia | Sobianek',
            description: 'Dziękujemy za zakupy w Sobianek! Sprawdź szczegóły swojego zamówienia.',
            robots: { index: false, follow: true } as const,
        },
        sklep: {
            title: 'Sklep | Sobianek',
            description: 'Przeglądaj pełną ofertę sklepu Sobianek. ',
            robots: { index: true, follow: true } as const,
        },
    }

    const meta = shopMetadata[shopType as keyof typeof shopMetadata] || shopMetadata.sklep

    return {
        title: meta.title,
        description: meta.description,
        robots: meta.robots,
        alternates: {
            canonical: `/${slug.join('/')}`,
        },
    }
}

/**
 * Generuje metadane dla strony CMS
 */
async function generateCmsMetadata(slug: string[]): Promise<Metadata> {
    const slugKey = slug.join('/')

    // Strona kontaktowa
    if (slug.includes('contact')) {
        return {
            title: 'Kontakt | Sobianek',
            description: 'Skontaktuj się z nami! Sobianek - buty damskie i torebki. Zapraszamy do kontaktu telefonicznego, mailowego lub poprzez formularz.',
            robots: { index: true, follow: true },
            alternates: {
                canonical: '/contact',
            },
        }
    }


    // Dla pozostałych stron CMS - użyj cache'owanych danych
    try {
        const cmsData = await getCachedCMSData()
        const pageContent = cmsData[slugKey]

        if (pageContent) {
            return {
                title: `${pageContent.title || slugKey} | Sobianek`,
                description: pageContent.meta_description || pageContent.excerpt || `Zapoznaj się z treścią na stronie ${slugKey} w serwisie Sobianek.`,
                robots: {
                    index: pageContent.index !== false,
                    follow: true,
                },
                alternates: {
                    canonical: `/${slugKey}`,
                },
            }
        }
    } catch (error) {
        console.error('Error fetching CMS metadata:', error)
    }

    // Domyślne metadane dla stron CMS
    return {
        title: `${slug.join(' - ')} | Sobianek`,
        description: `Strona ${slug.join(' - ')} w serwisie Sobianek.`,
        robots: {
            index: true,
            follow: true,
        },
        alternates: {
            canonical: `/${slug.join('/')}`,
        },
    }
}

/**
 * Główna funkcja generująca metadane dla dynamicznej strony
 */
export async function generatePageMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params

    // Użyj cache'owanego wykrywania typu strony
    const pageMetadata = await getCachedPageType(slug)

    if (!pageMetadata) {
        return {
            title: 'Strona nie została znaleziona | Sobianek',
            robots: {
                index: false,
                follow: false,
            },
        }
    }

    // Wywołaj odpowiednią funkcję w zależności od typu strony
    switch (pageMetadata.type) {
        case 'category':
            return await generateCategoryMetadata(pageMetadata.identifier, slug)

        case 'product':
            return await generateProductMetadata(slug[0])

        case 'shop':
            return generateShopMetadata(slug)

        case 'cms_page':
        default:
            return await generateCmsMetadata(slug)
    }
}