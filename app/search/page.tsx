'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { fetchProducts, searchProducts, type Product } from '@/lib/api'
import { useCategoryZustand } from '@/stores/categoryZustand'
import SearchTemplate from '@/pages/search/search-template'

export default function SearchPage() {
    const searchParams: any = useSearchParams()
    const searchQuery = searchParams.get('q') || ''
    const pageParam = searchParams.get('page') || '1'
    const sortParam = searchParams.get('sort') || 'createdat:desc'
    const limitParam = searchParams.get('limit') || '30'

    const page = parseInt(pageParam)
    const sort = sortParam
    const itemsPerPage = parseInt(limitParam)

    const initializeStore = useCategoryZustand((state: any) => state.initializeStore)
    const setPageZustand = useCategoryZustand((state: any) => state.setPage)
    const setSortZustand = useCategoryZustand((state: any) => state.setSort)
    const setPerPageZustand = useCategoryZustand((state: any) => state.setPerPage)
    const isLoading = useCategoryZustand((state: any) => state.isLoading)

    const [currentProducts, setCurrentProducts] = useState<Product[]>([])
    const [totalProducts, setTotalProducts] = useState(0)
    const [currentPage, setCurrentPage] = useState(page)
    const [perPage, setPerPage] = useState(itemsPerPage)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [sortBy, setSortBy] = useState(sort)
    const [error, setError] = useState<string | null>(null)

    // Initialize store with empty data
    useEffect(() => {
        if (searchQuery) {
            initializeStore({
                categoryId: `search_${searchQuery}`,
                initialProducts: [],
                initialFacets: {},
                initialTotalItems: 0,
                itemsPerPage: itemsPerPage
            }, false)
        }
    }, [searchQuery, initializeStore, itemsPerPage])

    // Fetch search results
    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery) {
                setCurrentProducts([])
                setTotalProducts(0)
                return
            }

            try {
                setError(null)
                // Build search query - adjust based on your API
                const offset = (page - 1) * itemsPerPage
                console.log(searchQuery);
                console.log({
                    term: searchQuery,
                    sort: sortBy,
                    offset,
                    limit: itemsPerPage
                });

                const response = await searchProducts(searchQuery, page, itemsPerPage, sortBy)
                console.log(response);

                if (response) {
                    setCurrentProducts(response.hits.map(hit => hit.document))
                    setTotalProducts(response.found)
                }
            } catch (err) {
                console.error('[v0] Search error:', err)
                setError('Błąd podczas wyszukiwania. Spróbuj ponownie.')
                setCurrentProducts([])
                setTotalProducts(0)
            }
        }

        fetchSearchResults()
    }, [searchQuery, page, sortBy, itemsPerPage])

    const totalPages = Math.ceil(totalProducts / perPage)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with search query */}


            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <SearchTemplate
                    searchQuery={searchQuery}
                    products={currentProducts}
                    totalProducts={totalProducts}
                    currentPage={currentPage}
                    perPage={perPage}
                    viewMode={viewMode}
                    loading={isLoading}
                    error={error}
                    totalPages={totalPages}
                    onViewModeChange={setViewMode}
                    onSortChange={(newSort) => {
                        setSortZustand(newSort)
                        setSortBy(newSort)
                        setPageZustand(1)
                        setCurrentPage(1)
                    }}
                    onPerPageChange={(newPerPage) => {
                        setPerPageZustand(newPerPage)
                        setPerPage(newPerPage)
                        setPageZustand(1)
                        setCurrentPage(1)
                    }}
                    onPageChange={(newPage) => {
                        setPageZustand(newPage)
                        setCurrentPage(newPage)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                />
            </div>
        </div>
    )
}
