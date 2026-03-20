"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchProducts, type Product } from '@/lib/api';
import { ProductControls } from '@/components/category/product-controls';
import { ProductPagination } from '@/components/category/product-pagination';
import { MobileCategoryMenu } from '@/components/category/mobile-category-menu';
import { Spinner } from '@/components/ui/spinner';
import { ProductTemplate } from '@/components/category/product-template'; // Import ProductTemplate
import { ProductGrid } from '@/components/category/product-grid';
import { useCategoryZustand } from '@/stores/categoryZustand';
import CategorySidebar from '../../components/category/category-sidebar';

interface CategoryTemplateProps {
    products: any,
    facets: any;
    categoryId: string;
    parentCategory: string;
    itemPerPage: number;
    categories: any;
    categoryImage?: string;
    categoryImageAlt?: string;
    page: any;
    totalPage: number;
    category: any;
    categoryTree: any;
}ProductGrid
export default function CategoryTemplate({
    products: initialProducts,
    facets,
    page,
    totalPage,
    categoryId,
    parentCategory,
    categoryTree,
    itemPerPage,
    categories,
    category,
    categoryImage = 'https://www.hert.pl/media/iopt/Content/piekarnictwo.jpg',
    categoryImageAlt = 'Kategoria',
}: CategoryTemplateProps) {
    const initializeStore = useCategoryZustand((state: any) => state.initializeStore)
    const productZustand = useCategoryZustand((state: any) => state.products)
    const setPageZustand = useCategoryZustand((state: any) => state.setPage)
    const setSortZustand = useCategoryZustand((state: any) => state.setSort)
    const setPerPageZustand = useCategoryZustand((state: any) => state.setPerPage)
    const isLoading = useCategoryZustand((state: any) => state.isLoading)
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [totalProducts, setTotalProducts] = useState(totalPage);
    const [currentPage, setCurrentPage] = useState(page);
    const [perPage, setPerPage] = useState(itemPerPage);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('createdat:desc');

    const [error, setError] = useState<string | null>(null);



    useEffect(() => {
        console.log("[v0] Initializing store for category:", categoryId);
        initializeStore({
            categoryId: categoryId,
            initialProducts: products,
            initialFacets: facets,
            initialTotalItems: totalPage,
            itemsPerPage: itemPerPage
        }, false)
    }, [])



    useEffect(() => {
        setProducts(initialProducts);
    }, []); // synchronizuj gdy zmieni się props

    useEffect(() => {
        setProducts(productZustand);
    }, [initialProducts, categoryId, productZustand, currentPage, perPage, sortBy]); // synchronizuj gdy zmieni się props



    const totalPages = Math.ceil(totalProducts / perPage);
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
                        <source
                            media="(max-width: 768px)"
                            srcSet={category.imgs.m}
                        />
                        <source
                            media="(min-width: 769px)"
                            srcSet={category.imgs.d}
                        />
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
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Mobile Menu */}
                    <div className="md:hidden mb-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">{currentCategory?.name || 'Kategoria'}</h1>
                    </div>

                    {/* Sidebar */}

                    <CategorySidebar categories={categories} activeId={categoryId} categoryTree={categoryTree} parentCategory={parentCategory} />

                    {/* Products Section */}
                    <ProductTemplate
                        categoryName={currentCategory?.name}
                        products={products}
                        totalProducts={totalProducts}
                        currentPage={currentPage}
                        perPage={perPage}
                        viewMode={viewMode}
                        loading={isLoading}
                        error={error}
                        totalPages={totalPages}
                        onViewModeChange={setViewMode}
                        onSortChange={setSortZustand}
                        onPerPageChange={(newPerPage) => {
                            setPerPageZustand(newPerPage);
                            setPerPage(newPerPage);
                            setPageZustand(1);
                        }}
                        onPageChange={setPageZustand}
                    />

                </div>
            </div>
        </div>
    );
}
