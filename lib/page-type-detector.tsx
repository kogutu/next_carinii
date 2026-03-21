import _ from 'lodash';
// System wykrywania typu strony na podstawie slug
export type PageType = "cms_page" | "category" | "product" | "shop" | "brand"

export interface PageMetadata {
    type: PageType
    identifier: string // slug dla kategorii, pid dla produktu, itp.
    data?: unknown
    page: any

}

interface SlugApiResponse {
    path: string
    type: PageType
    identifier?: string
}

export async function detectPageType(slug: string[]): Promise<PageMetadata | null> {
    try {
        // Pobierz informacje o slug z API
        const res = await fetch("https://sklep.carinii.com.pl/directseo/nextjs/slugs.php?t=3", {
            cache: 'force-cache',
            next: { revalidate: 3600 }, // Cache na 1 godzinę
        })

        if (!res.ok) {
            console.error("API error:", res.status)
            return null
        }

        const pages: SlugApiResponse[] = await res.json()
        const currentPath = slug.join("/")


        let matchedPage: any = '';

        const sulr = slug.join("/");
        var fs = pages.forEach(e => {

            if (e.path == sulr) matchedPage = e;
        })



        if (!matchedPage) {
            return null
        }

        // Zwróć metadata strony
        return {
            type: matchedPage.type || "cms_page",
            identifier: matchedPage.identifier || sulr,
            page: matchedPage
        }
    } catch (error) {
        console.error("Error detecting page type:", error)
        return null
    }
}

// Pomocnicze funkcje do wykrywania typu na podstawie wzorców slug
export function isShopPage(slug: string[]): boolean {
    const shopPages = ["koszyk", "cart", "checkout", "zamowienie", "order"]
    return slug.some((segment) => shopPages.includes(segment.toLowerCase()))
}

export function isProductPage(slug: string[]): boolean {
    // Produkty zazwyczaj mają pid w ostatnim segmencie lub specjalny prefix
    const lastSegment = slug[slug.length - 1]
    return lastSegment?.startsWith("p-") || /^[0-9]+$/.test(lastSegment)
}


function checkURL(slug: any, pages: any) {

    if (!_.isArray(slug)) slug = [slug];



    // Znajdź indeks elementu 'f' w tablicy slug
    const index_filter = slug.findIndex((item: any) => item === 'f');


    // Poprawiona logika przetwarzania slug
    if (index_filter !== -1) {
        // Jeśli znaleziono 'f', weź część tablicy przed tym elementem
        slug = slug.slice(0, index_filter).join('/');;
    } else {
        // Jeśli nie znaleziono 'f', połącz całą tablicę w string
        slug = slug.join('/');
    }



    let matchedPage = null;

    pages.forEach((page: any) => {
        const apiPath = page.path.split('/').filter(Boolean).join('/');
        if (slug === apiPath) {
            matchedPage = {
                type: page.type || "cms_page",
                identifier: slug,
            };
        }
    });


    return matchedPage;
}
