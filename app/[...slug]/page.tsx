import { detectPageType } from "@/lib/page-type-detector"
import {
  getCategoryBySlug,
  getProduct,
  transformDataProduct,
  searchProductsNew,
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

// ─── Helpers ─────────────────────────────────────────────────────────

const CATS_TREE_URL =
  "https://sklep.carinii.com.pl/directseo/nextjs/typesense/categories/cats_tree.json?t=2"
const CMS_URL = "http://sklep.carinii.com.pl/directseo/nextjs//cms.php"
const SLUGS_URL = "https://sklep.carinii.com.pl/directseo/nextjs/slugs.php?t=2"

async function getSeeMoreProducts(product: any) {
  try {
    const url =
      "https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/carinii_prs/documents/search?q=*&page=1&per_page=10&filter_by=categories:[`" +
      encodeURI(product.cat_main[0]) +
      "`]"

    const res = await fetch(url, { next: { revalidate: 3600 } })

    if (!res.ok) {
      throw new Error("Failed to fetch products")
    }

    const data = await res.json()

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

  const pageMetadata = await detectPageType(slug)

  if (!pageMetadata) {
    notFound()
  }

  switch (pageMetadata.type) {
    // ── Category ───────────────────────────────────────────────────
    case "category": {
      const category = await getCategoryBySlug(pageMetadata.identifier)

      if (!category) {
        notFound()
      }

      // const productsResponse = await searchProductsNew(tsQuery)
      const rawSearchParams: any = await searchParams

      const decoded: any = decodeFiltersFromUrl(rawSearchParams)
      decoded.filters = decoded.filters ?? {}
      decoded.filters.cids = [category.cid]
      decoded.catId = category.cid

      const tsQuery: any = buildTypesenseSearchParams(decoded)
      tsQuery[0]['include_fields'] = [
        'sku',
        'name',
        'slug',
        'image_small',
        'image_main',
        'image_thumbnail',
        'price',
        'special_price',
        'has_special_price',
        'new',
        'categories',
        'size_qty',
        'promo_code',
        'save_percent'
      ].join(',')
      console.log(tsQuery);

      // Lepiej (parallel):
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
        <CategoryTemplate
          categoryId={category.cid}
          parentCategoryId={mockCategories[0]?.id}
          products={products}
          facets={facets}
          page={page}
          totalPage={productsResponse.found}
          category={category}
          categories={mockCategories}
          categoryTree={categoryPath}
          categoryImage="https://www.hert.pl/media/iopt/Content/piekarnictwo.jpg"
          categoryImageAlt={mockCategories[0]?.name}
        />
      )
    }

    // ── Product ────────────────────────────────────────────────────
    case "product": {
      const product = await getProduct(slug[0])

      if (!product) {
        notFound()
      }

      const seeMoreProducts = await getSeeMoreProducts(product)

      return <ProductPage product={product} seemore={seeMoreProducts} />
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

      const cmsRes = await fetch(CMS_URL, { cache: "force-cache" })
      const cmsData = await cmsRes.json()
      const slugKey = slug.join("/")

      return (
        <div className={slugKey}>
          <CmsPageTemplate slug={slug} content={cmsData[slugKey]} />
        </div>
      )
    }
  }
}

// ─── Static Params ───────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const res = await fetch(SLUGS_URL, {
      next: { revalidate: 3600 },
    })

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