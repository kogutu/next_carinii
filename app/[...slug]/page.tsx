// app/[slug]/page.tsx
import {
  transformDataProduct,
  searchProductsNew,
  getDataTypesense,
} from "@/lib/typesense"
import CmsPageTemplate from "@/components/pages/cms-page-template"
import CategoryTemplate from "@/pages/category/category-page"
import { ShopTemplate } from "@/components/shop/shop-template"
import type { CategoryNode } from "@/components/category/category-sidebar"
import ProductPage from "@/pages/product/product-page"
import ContactPage from "@/pages/cms/contact"
import SellMachinePage from "@/pages/cms/sprzedaz-maszyn"
import { notFound } from "next/navigation"
import {
  buildTypesenseSearchParams,
  decodeFiltersFromUrl,
} from "@/stores/categoryZustand"
import {
  getCachedCategory,
  getCachedProduct,
  getCachedCMSData,
  getCachedPageType,
} from "./metadata"
import { generatePageMetadata } from "./metadata"
import logger from "@/lib/logger"
import { JsonLd } from "@/components/json-ld"
import {
  buildProductJsonLd,
  buildCategoryJsonLd,
  buildCmsPageJsonLd,
} from "@/lib/json-ld"

// ─── Types ───────────────────────────────────────────────────────────

interface PageProps {
  params: {
    slug: string[]
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

interface CategoryTreeResult {
  category: any
  path: string[]
}

// ─── Export metadata ─────────────────────────────────────────────────

export async function generateMetadata({ params, searchParams }: PageProps) {
  return generatePageMetadata({ params, searchParams })
}

// ─── Helpers ─────────────────────────────────────────────────────────

const CATS_TREE_URL =
  "https://sklep.carinii.com.pl/directseo/nextjs/typesense/categories/cats_tree.json?t=2"
const SLUGS_URL = "https://sobianek.pl/nextjs/slugs.php"

async function getSeeMoreProducts(product: any) {




  try {
    const url =
      "https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/sobianek_prs/documents/search?q=*&page=1&per_page=10&filter_by=categories:[`" +
      encodeURI(product.categories[0]) +
      "`]"

    const data = await getDataTypesense({
      searches: [
        {
          collection: 'sobianek_prs',
          q: "*",
          filter_by: `category_ids: [${encodeURI(product.categories[0])}]`,
          max_facet_values: 0,
          page: 1,
          per_page: 10,
          sort_by: "pid:desc",
          exclude_fields: "content_text",
        },
      ],
    });
    // const res = await fetch(url, { next: { revalidate: 3600 } })

    // if (!res.ok) {
    //   throw new Error("Failed to fetch products")
    // }

    // const data = await res.json()
    console.log(data);

    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => hit.document || hit)
    }

    return []
  } catch (error) {
    console.error("Error fetching see-more products:", error)
    return []
  }
}

/**
 * Rekurencyjne szukanie kategorii w drzewie.
 * Zwraca parent (lub samą kategorię jeśli root) + ścieżkę ID.
 */
const findCategoryRecursive = (
  categories: any[],
  searchName: string,
  parent: any = null,
  path: string[] = []
): CategoryTreeResult | null => {
  for (const cat of categories) {
    const currentPath = [...path, cat.id]

    if (cat.name === searchName) {
      return { category: parent || cat, path: currentPath }
    }

    if (cat.children?.length > 0) {
      const found = findCategoryRecursive(cat.children, searchName, parent || cat, currentPath)
      if (found) return found
    }
  }
  return null
}

// ─── Page Component ──────────────────────────────────────────────────

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page } = await searchParams

  // Użyj cache'owanej funkcji do wykrycia typu strony
  const pageMetadata = await getCachedPageType(slug)

  if (!pageMetadata) {
    notFound()
  }

  switch (pageMetadata.type) {
    // ── Category ───────────────────────────────────────────────────
    case "category": {
      // Użyj cache'owanej funkcji do pobrania kategorii
      logger.warn('category--');
      const category = await getCachedCategory(pageMetadata.identifier)
      console.log(category);
      console.log(pageMetadata);

      if (!category) {
        notFound()
      }

      const rawSearchParams: any = await searchParams

      const decoded: any = decodeFiltersFromUrl(rawSearchParams)
      decoded.filters = decoded.filters ?? {}
      decoded.filters.cids = [category.cid]
      decoded.catId = category.cid

      const tsQuery: any = buildTypesenseSearchParams(decoded)
      tsQuery[0]['include_fields'] = [
        'id',
        'pid',
        'sku',
        'name',
        'slug',
        'url',
        'type',
        'status',
        'in_stock',
        'stock_quantity',
        'stock_status',
        'price',
        'sale_price',
        'final_price',
        'on_sale',
        'save_percent',
        'category_ids',
        'category_names',
        'image_main',
        'image_large',
        'image_medium',
        'image_thumbnail',
        'images',
        'featured',
        'total_sales',
        'average_rating',
        'review_count',
        'variation_attributes',
        'created_at',
        'updated_at',
        'menu_order'

      ].join(',')
      console.log(tsQuery);

      const [productsResponse, catsTree] = await Promise.all([
        searchProductsNew(tsQuery),
        fetch(CATS_TREE_URL, { cache: "force-cache" }).then(r => r.json()),
      ])

      const products = transformDataProduct(productsResponse)
      const facets = productsResponse.facet_counts

      const mockCategories: CategoryNode[] = []
      let categoryPath: string[] = []

      const result = findCategoryRecursive(catsTree, category.name)
      if (result) {
        mockCategories.push(result.category)
        categoryPath = result.path
      }

      return (
        <>
          <JsonLd data={buildCategoryJsonLd(category, products, slug)} />
          <CategoryTemplate
            categoryId={category.cid}
            parentCategoryId={mockCategories[0]?.id}
            products={products}
            facets={facets}
            page={page}
            totalPage={productsResponse.found}
            itemPerPage={24}
            category={category}
            categories={mockCategories}
            categoryTree={categoryPath}
            categoryImage="https://www.hert.pl/media/iopt/Content/piekarnictwo.jpg"
            categoryImageAlt={mockCategories[0]?.name}
          />
        </>
      )
    }

    // ── Product ────────────────────────────────────────────────────
    case "product": {
      // Użyj cache'owanej funkcji do pobrania produktu
      const product = await getCachedProduct(slug.join("/"))

      if (!product) {
        notFound()
      }

      const seeMoreProducts = await getSeeMoreProducts(product)

      return (
        <>
          <JsonLd data={buildProductJsonLd(product)} />
          <ProductPage product={product} relatedProducts={seeMoreProducts} />
        </>
      )
    }

    // ── Shop ──────────────────────────────────────────────────────
    case "shop": {
      const shopPageType = slug.some((s) =>
        ["koszyk", "cart"].includes(s.toLowerCase())
      )
        ? "cart"
        : slug.some((s) =>
          ["checkout", "finalizacja"].includes(s.toLowerCase())
        )
          ? "checkout"
          : slug.some((s) =>
            ["zamowienie", "order"].includes(s.toLowerCase())
          )
            ? "order"
            : "other"

      return <ShopTemplate slug={slug} pageType={shopPageType} />
    }

    // ── Brand (WIP — zakomentowane) ───────────────────────────────
    case "brand": {
      // TODO: Odkomentuj gdy brand będzie gotowy
      notFound()
    }

    // ── CMS Page (default) ────────────────────────────────────────
    case "cms_page":
    default: {
      if (slug.includes("contact")) {
        return (
          <div className="contact">
            <ContactPage />
          </div>
        )
      }

      if (slug.includes("sprzedaj-maszyne")) {
        return (
          <div className="sprzedaj-maszyne">
            <SellMachinePage />
          </div>
        )
      }

      // Użyj cache'owanej funkcji do pobrania CMS danych
      const cmsData = await getCachedCMSData()

      const slugKey = slug.join("/")
      console.log("✅" + slugKey);
      console.log(pageMetadata);

      const content = cmsData[slugKey];
      console.log('➖' + content.id);
      console.log(pageMetadata);


      return (
        <div className={pageMetadata.type + ` elementor-` + content.id + ' ' + slugKey}>
          <JsonLd data={buildCmsPageJsonLd(content, slug)} />
          <link rel="spreadsheet" href="https://sobianek.pl/wp-content/uploads/elementor/css/post-21843.css?ver=1721046372"></link>
          <CmsPageTemplate slug={slug} content={content} />
        </div>
      )
    }
  }
}

// ─── Static Params ───────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const res = await fetch(SLUGS_URL, {
      next: { revalidate: 1 },
    })
    console.log(res);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`)
    }

    const pages: { path: string }[] = await res.json()

    return pages
      .map((p) => ({
        slug: p.path.split("/").filter(Boolean),
      }))
      .filter((p) => p.slug.length > 0)
  } catch {
    return []
  }
}