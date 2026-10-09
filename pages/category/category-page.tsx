"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import type { Product } from "@/lib/api";
import { ProductControls } from "@/components/category/product-controls";
import { ProductPagination } from "@/components/category/product-pagination";
import { ProductGrid } from "@/components/category/product-grid";
import { useCategoryZustand } from "@/stores/categoryZustand";
import { ProductFilters } from "@/components/category/ProductFilters";

interface CategoryTemplateProps {
  products: any;
  facets: any;
  categoryId: string;
  parentCategoryId: string;
  itemPerPage?: number;
  categories: any;
  categoryImage?: string;
  categoryImageAlt?: string;
  page: any;
  totalPage: number;
  category: any;
  categoryTree: any;
}
export default function CategoryTemplate({
  products: initialProducts,
  facets: initialFacets,
  page,
  totalPage,
  categoryId,
  parentCategoryId,
  categoryTree,
  categories,
  category,
  categoryImage = "https://www.hert.pl/media/iopt/Content/piekarnictwo.jpg",
  categoryImageAlt = "Kategoria",
}: CategoryTemplateProps) {
  const initializeStore = useCategoryZustand(
    (state: any) => state.initializeStore,
  );
  // Jedyne źródło prawdy — store. SSR-owe propsy to stan startowy, pokazywany
  // dopóki store nie zainicjalizuje się dla TEJ kategorii. Pusty wynik
  // wyszukiwania ([]) po zakończeniu fetcha jest poprawny i nie cofa się do SSR.
  const storeProducts = useCategoryZustand(
    (state: any) => state.products,
  ) as Product[];
  const storeCategoryId = useCategoryZustand((state: any) => state.categoryId);
  const isInitialized = useCategoryZustand((state: any) => state.isInitialized);
  const liveFacets = useCategoryZustand((state: any) => state.facets);
  const storeTotal = useCategoryZustand((state: any) => state.totalItems);
  const isCurrentCategory = isInitialized && storeCategoryId === categoryId;
  const products = isCurrentCategory ? storeProducts : initialProducts;
  const facets =
    isCurrentCategory && liveFacets?.length > 0 ? liveFacets : initialFacets;
  const totalProducts = isCurrentCategory ? storeTotal : totalPage || 0;
  const currentPage = useCategoryZustand((state: any) => state.page);
  const zustandPerPage = useCategoryZustand((state: any) => state.itemsPerPage);
  const setPageZustand = useCategoryZustand((state: any) => state.setPage);
  const setSortZustand = useCategoryZustand((state: any) => state.setSort);
  const setPerPageZustand = useCategoryZustand(
    (state: any) => state.setPerPage,
  );
  const isLoading = useCategoryZustand((state: any) => state.isLoading);

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [error, setError] = useState<string | null>(null);

  // Init raz na kategorię. initializeStore sam dociąga dane z API,
  // gdy URL zawiera ?f.* / ?page / ?sort (inaczej zostaje szybki SSR).
  useEffect(() => {
    initializeStore(
      {
        categoryId: categoryId,
        initialProducts: initialProducts,
        initialFacets: initialFacets,
        initialTotalItems: totalPage,
      },
      false,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);
  console.log(facets);
  const perPage = zustandPerPage || 100;
  const totalPages = Math.max(1, Math.ceil((totalProducts || 0) / perPage));
  const currentCategory = category;
  if (!category && !products) {
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero */}

      {category.imgs && (
        <div className="relative w-full h-64 md:h-80  aspect-13/8  md:aspect-62/27 bg-gray-200 overflow-hidden">
          <picture>
            <source media="(max-width: 768px)" srcSet={category.imgs.m} />
            <source media="(min-width: 769px)" srcSet={category.imgs.d} />
            <Image
              src={category.imgs.d} // Fallback
              alt={categoryImageAlt}
              fill
              className="object-cover"
              priority
            />
          </picture>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-1 md:gap-6">
          {/* Mobile Menu */}
          <div className="md:hidden mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {category?.seo?.h1 || currentCategory?.name || "Kategoria"}
            </h1>
          </div>

          {/* Sidebar */}

          {/* <CategorySidebar categories={categories} activeId={categoryId} categoryTree={categoryTree} parentCategory={parentCategoryId} /> */}

          <aside className="w-full md:w-64 flex-shrink-0">
            <ProductFilters filters_facets={facets}></ProductFilters>
          </aside>

          {/* Products Section */}
          <main className="flex-1 w-full md:w-auto">
            <div className="mb-6 hidden md:block">
              <h1 className="text-3xl font-bold text-gray-900 line-clamp-2 ">
                {currentCategory?.name || "Kategoria"}
              </h1>

              <p
                className="text-gray-500 font-light  text-sm mt-2 mb-6 htmlInsert"
                dangerouslySetInnerHTML={{ __html: category?.seo?.top }}
              />

              <p className="text-gray-600 mt-2">
                Znaleźliśmy {totalProducts} produktów
              </p>
            </div>

            {/* Controls */}
            <ProductControls
              totalProducts={totalProducts}
              currentPage={currentPage}
              facets={facets}
              perPage={perPage}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSortChange={setSortZustand}
              onPerPageChange={(newPerPage) => {
                setPerPageZustand(newPerPage);
                setPageZustand(1);
              }}
            />

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
                {error}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={products}
              viewMode={viewMode}
              loading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
              />
            )}

            <p
              className="htmlInsert text-gray-500 font-light  text-sm mt-12 mb-6"
              dangerouslySetInnerHTML={{ __html: category?.seo?.bottom }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
