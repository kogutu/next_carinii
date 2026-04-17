const SITE_URL = 'https://sobianek.pl'
const SITE_NAME = 'Sobianek'
const ORG_NAME = 'Sobianek Sp. z o.o.'

export function buildOrganizationJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}/#organization`,
        name: ORG_NAME,
        url: SITE_URL,
        logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
            width: 200,
            height: 60,
        },
        address: {
            "@type": "PostalAddress",
            streetAddress: "ul. Główna 1",
            addressLocality: "Parczew",
            postalCode: "21-200",
            addressCountry: "PL",
        },
        sameAs: [
            "https://www.facebook.com/sobianek",
        ],
    }
}

export function buildWebSiteJsonLd() {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        publisher: { "@id": `${SITE_URL}/#organization` },
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${SITE_URL}/szukaj?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    }
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
        })),
    }
}

export function buildProductJsonLd(product: any) {
    const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]

    const images: string[] = [
        product.image_large,
        product.image_main,
        product.image_medium,
        ...(Array.isArray(product.images) ? product.images : []),
    ].filter(Boolean)

    const price = product.final_price || product.price || 0

    const data: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${SITE_URL}/${product.url}#product`,
        name: product.name,
        description: stripHtml(product.short_description || product.meta_description || product.name, 500),
        sku: product.sku,
        ...(images.length > 0 && { image: images }),
        brand: {
            "@type": "Brand",
            name: product.manufacturer || SITE_NAME,
        },
        offers: {
            "@type": "Offer",
            url: `${SITE_URL}/${product.url}`,
            priceCurrency: "PLN",
            price,
            priceValidUntil,
            itemCondition: "https://schema.org/NewCondition",
            availability: product.in_stock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: ORG_NAME,
                "@id": `${SITE_URL}/#organization`,
            },
        },
    }

    if (product.has_special_price && product.special_price) {
        data.offers.priceSpecification = {
            "@type": "UnitPriceSpecification",
            price: product.special_price,
            priceCurrency: "PLN",
        }
    }

    if (product.average_rating > 0 && product.review_count > 0) {
        data.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: product.average_rating,
            reviewCount: product.review_count,
            bestRating: 5,
            worstRating: 1,
        }
    }

    const breadcrumbs: { name: string; url: string }[] = [
        { name: 'Strona główna', url: '/' },
    ]
    if (product.category_names?.length > 0 && product.category_slugs?.length > 0) {
        breadcrumbs.push({
            name: product.category_names[0],
            url: `/${product.category_slugs[0]}`,
        })
    }
    breadcrumbs.push({ name: product.name, url: `/${product.url}` })

    return [data, buildBreadcrumbJsonLd(breadcrumbs)]
}

export function buildCategoryJsonLd(category: any, products: any[], slug: string[]) {
    const categoryUrl = `/${slug.join('/')}`

    const breadcrumbs: { name: string; url: string }[] = [
        { name: 'Strona główna', url: '/' },
    ]

    if (Array.isArray(category.parent_path)) {
        for (const ancestor of category.parent_path) {
            breadcrumbs.push({ name: ancestor.name, url: `/${ancestor.slug}` })
        }
    }

    breadcrumbs.push({ name: category.name, url: categoryUrl })

    const itemList = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: category.name,
        ...(category.description || category.meta_description
            ? { description: stripHtml(category.description || category.meta_description, 300) }
            : {}),
        url: `${SITE_URL}${categoryUrl}`,
        numberOfItems: products.length,
        itemListElement: products.slice(0, 30).map((p: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
                "@type": "Product",
                name: p.name,
                url: `${SITE_URL}/${p.url || p.slug}`,
                ...(p.image_main || p.image_medium
                    ? { image: p.image_main || p.image_medium }
                    : {}),
                offers: {
                    "@type": "Offer",
                    priceCurrency: "PLN",
                    price: p.final_price || p.price || 0,
                    availability: p.in_stock
                        ? "https://schema.org/InStock"
                        : "https://schema.org/OutOfStock",
                },
                ...(p.average_rating > 0 && p.review_count > 0
                    ? {
                        aggregateRating: {
                            "@type": "AggregateRating",
                            ratingValue: p.average_rating,
                            reviewCount: p.review_count,
                        },
                    }
                    : {}),
            },
        })),
    }

    return [itemList, buildBreadcrumbJsonLd(breadcrumbs)]
}

export function buildCmsPageJsonLd(content: any, slug: string[]) {
    const pageUrl = `/${slug.join('/')}`
    const title = content?.h1 || content?.title || slug[slug.length - 1]
    const description = content?.meta_description || content?.excerpt

    if (content?.post_type === 'post') {
        return buildBlogPostJsonLd(content, slug)
    }

    return [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            "@id": `${SITE_URL}${pageUrl}#webpage`,
            url: `${SITE_URL}${pageUrl}`,
            name: title,
            ...(description ? { description: stripHtml(description, 300) } : {}),
            publisher: { "@id": `${SITE_URL}/#organization` },
        },
        buildBreadcrumbJsonLd([
            { name: 'Strona główna', url: '/' },
            { name: title, url: pageUrl },
        ]),
    ]
}

export function buildBlogPostJsonLd(post: any, slug?: string[]) {
    const postUrl = post.url || post.slug || slug?.join('/')
    const breadcrumbs = [
        { name: 'Strona główna', url: '/' },
        { name: 'Blog', url: '/blog' },
        { name: post.title || post.h1, url: `/${postUrl}` },
    ]

    return [
        {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "@id": `${SITE_URL}/${postUrl}#article`,
            headline: post.title || post.h1 || post.meta_title,
            ...(post.excerpt || post.meta_description
                ? { description: stripHtml(post.excerpt || post.meta_description, 300) }
                : {}),
            ...(post.image_large || post.image_main
                ? { image: post.image_large || post.image_main }
                : {}),
            url: `${SITE_URL}/${postUrl}`,
            author: {
                "@type": "Person",
                name: post.author_name || ORG_NAME,
            },
            publisher: { "@id": `${SITE_URL}/#organization` },
            ...(post.created_at ? { datePublished: formatDate(post.created_at) } : {}),
            ...(post.updated_at || post.created_at
                ? { dateModified: formatDate(post.updated_at || post.created_at) }
                : {}),
        },
        buildBreadcrumbJsonLd(breadcrumbs),
    ]
}

export function buildBlogListJsonLd(posts: any[]) {
    return {
        "@context": "https://schema.org",
        "@type": "Blog",
        "@id": `${SITE_URL}/blog#blog`,
        url: `${SITE_URL}/blog`,
        name: `Blog | ${SITE_NAME}`,
        publisher: { "@id": `${SITE_URL}/#organization` },
        blogPost: posts.slice(0, 10).map((p: any) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${SITE_URL}/${p.url || p.slug}`,
            ...(p.image_main ? { image: p.image_main } : {}),
            ...(p.created_at ? { datePublished: formatDate(p.created_at) } : {}),
            author: {
                "@type": "Person",
                name: p.author_name || ORG_NAME,
            },
        })),
    }
}

function stripHtml(html: string, maxLength = 300): string {
    if (!html) return ''
    const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return text.length > maxLength ? text.slice(0, maxLength - 1) + '…' : text
}

function formatDate(value: string | number): string {
    try {
        const d = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
        return d.toISOString().split('T')[0]
    } catch {
        return String(value)
    }
}
