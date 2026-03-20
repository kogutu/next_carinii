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
import { BrandProductsTemplate } from '@/components/category/brand-products-template';

interface CategoryTemplateProps {
    products: any,
    facets: any;
    itemPerPage: number;

    page: any;
    totalPage: number;
    brand: any;
}ProductGrid
export default function BrandTemplate({
    products: initialProducts,
    facets,
    page,
    totalPage,
    itemPerPage,
    brand
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
        console.log("[v0] Initializing store for BRAND:", 0);
        initializeStore({
            categoryId: 0,
            initialProducts: products,
            initialFacets: facets,
            fields: { manufacturer: [brand?.name] },
            initialTotalItems: totalPage,
            itemsPerPage: itemPerPage
        }, false)
    }, [initializeStore])



    useEffect(() => {
        setProducts(initialProducts);
    }, []); // synchronizuj gdy zmieni się props

    useEffect(() => {
        setProducts(productZustand);
    }, [initialProducts, productZustand, currentPage, perPage, sortBy]); // synchronizuj gdy zmieni się props



    const totalPages = Math.ceil(totalProducts / perPage);
    if (!brand) {
        return null; // or a loading/fallback UI
    }
    return (
        <div className="min-h-screen bg-white">
            {/* Category Hero */}

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Mobile Menu */}
                    <div className="md:hidden mb-4 flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">{brand?.name}</h1>
                    </div>



                    {/* Products Section */}
                    <BrandProductsTemplate
                        categoryName={brand.name}
                        categoryDesc={brand.desc}
                        categoryLogo={brand.logo}

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
