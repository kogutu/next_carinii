'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
    id: string;
    pl_price: string;
    pl_sp: string;
    name: string;
    name1: string;
    sku: string;
    url_key: string;
    bimg: string;
    has_special_price: number;
    cats: string[];
}

interface Facet {
    name: string;
    count: number;
    selected: boolean;
}

interface FacetGroup {
    [key: string]: Facet[];
}

export default function MegaSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
    const [showFilters, setShowFilters] = useState(true);

    // Extract facets from results
    const facets = useMemo(() => {
        const facetGroups: FacetGroup = {};

        results.forEach((result) => {
            if (result.cats && Array.isArray(result.cats)) {
                if (!facetGroups['categories']) {
                    facetGroups['categories'] = [];
                }
                result.cats.forEach((cat) => {
                    const existing = facetGroups['categories'].find((f) => f.name === cat);
                    if (existing) {
                        existing.count += 1;
                    } else {
                        facetGroups['categories'].push({
                            name: cat,
                            count: 1,
                            selected: selectedFacets['categories']?.includes(cat) || false,
                        });
                    }
                });
            }
        });

        // Add price facets
        if (!facetGroups['price']) {
            facetGroups['price'] = [
                { name: '0-100 zł', count: 0, selected: selectedFacets['price']?.includes('0-100') || false },
                { name: '100-500 zł', count: 0, selected: selectedFacets['price']?.includes('100-500') || false },
                { name: '500+ zł', count: 0, selected: selectedFacets['price']?.includes('500+') || false },
            ];

            results.forEach((result) => {
                const price = parseInt(result.pl_price.replace(/[^\d]/g, '')) || 0;
                if (price <= 100) facetGroups['price'][0].count += 1;
                else if (price <= 500) facetGroups['price'][1].count += 1;
                else facetGroups['price'][2].count += 1;
            });
        }

        return facetGroups;
    }, [results, selectedFacets]);

    const searchProducts = useCallback(
        async (term: string) => {
            if (term.length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://www.hert.pl/search/autoc/index.php?term=${encodeURIComponent(term)}`
                );
                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const handleSearch = (value: string) => {
        setQuery(value);
        searchProducts(value);
    };

    const toggleFacet = (group: string, facet: string) => {
        setSelectedFacets((prev) => {
            const current = prev[group] || [];
            if (current.includes(facet)) {
                return {
                    ...prev,
                    [group]: current.filter((f) => f !== facet),
                };
            } else {
                return {
                    ...prev,
                    [group]: [...current, facet],
                };
            }
        });
    };

    const filteredResults = useMemo(() => {
        return results.filter((result) => {
            // Filter by categories
            if (selectedFacets['categories']?.length > 0) {
                const hasCategory = result.cats?.some((cat) =>
                    selectedFacets['categories'].includes(cat)
                );
                if (!hasCategory) return false;
            }

            // Filter by price
            if (selectedFacets['price']?.length > 0) {
                const price = parseInt(result.pl_price.replace(/[^\d]/g, '')) || 0;
                const matchesPrice = selectedFacets['price'].some((priceRange) => {
                    if (priceRange === '0-100') return price <= 100;
                    if (priceRange === '100-500') return price > 100 && price <= 500;
                    if (priceRange === '500+') return price > 500;
                    return false;
                });
                if (!matchesPrice) return false;
            }

            return true;
        });
    }, [results, selectedFacets]);

    const handleResultClick = (result: SearchResult) => {
        window.location.href = result.url_key;
    };

    const clearFilters = () => {
        setSelectedFacets({});
    };

    const activeFiltersCount = Object.values(selectedFacets).flat().length;

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2 text-gray-600 hover:border-gray-400 transition"
            >
                <Search size={18} />
                <span className="text-sm">Czego szukasz?</span>
            </button>

            {/* Mega Search Modal */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-[90vw] h-[90vh] p-0 gap-0 flex flex-col">
                    {/* Header */}
                    <div className="border-b bg-white p-6 flex items-center gap-4">
                        <div className="flex-grow flex items-center gap-3 bg-gray-50 px-4 py-3 rounded-lg">
                            <Search size={20} className="text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Szukaj produktów..."
                                value={query}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => query && setIsOpen(true)}
                                className="border-0 bg-transparent focus:outline-none focus:ring-0 text-lg"
                            />
                            {query && (
                                <button
                                    onClick={() => {
                                        setQuery('');
                                        setResults([]);
                                        clearFilters();
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            className="gap-2"
                        >
                            <Filter size={18} />
                            <span className="hidden sm:inline">Filtry</span>
                            {activeFiltersCount > 0 && (
                                <Badge variant="destructive" className="ml-1">
                                    {activeFiltersCount}
                                </Badge>
                            )}
                        </Button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-grow flex overflow-hidden">
                        {/* Sidebar Filters */}
                        {showFilters && (
                            <div className="w-64 border-r bg-gray-50 p-6 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-sm">Filtry</h3>
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Wyczyść
                                        </button>
                                    )}
                                </div>

                                {/* Filter Groups */}
                                <div className="space-y-6">
                                    {Object.entries(facets).map(([groupName, groupFacets]) => (
                                        <div key={groupName}>
                                            <h4 className="font-medium text-sm mb-3 capitalize">
                                                {groupName === 'categories' ? 'Kategorie' : 'Cena'}
                                            </h4>
                                            <div className="space-y-2">
                                                {groupFacets.map((facet) => (
                                                    <label
                                                        key={facet.name}
                                                        className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                                                    >
                                                        <Checkbox
                                                            checked={
                                                                selectedFacets[groupName]?.includes(facet.name) || false
                                                            }
                                                            onCheckedChange={() => toggleFacet(groupName, facet.name)}
                                                        />
                                                        <span className="text-sm flex-grow">{facet.name}</span>
                                                        <span className="text-xs text-gray-500">{facet.count}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Results Grid */}
                        <div className="flex-grow overflow-y-auto p-6">
                            {isLoading && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <p className="mt-2 text-gray-600 text-sm">Szukam produktów...</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && query.length < 2 && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-500">
                                        <Search size={48} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Wpisz co najmniej 2 znaki aby szukać</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && query.length >= 2 && filteredResults.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-gray-500">
                                        <Search size={48} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">Brak wyników dla "{query}"</p>
                                    </div>
                                </div>
                            )}

                            {!isLoading && filteredResults.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredResults.map((result) => (
                                        <button
                                            key={result.id}
                                            onClick={() => handleResultClick(result)}
                                            className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-300 hover:shadow-lg transition"
                                        >
                                            {/* Product Image */}
                                            <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                                                <Image
                                                    src={result.bimg || '/placeholder.svg'}
                                                    alt={result.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.src = '/placeholder-product.png';
                                                    }}
                                                />
                                                {result.has_special_price === 1 && (
                                                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                        Promocja
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Info */}
                                            <div className="p-4">
                                                <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition">
                                                    {result.name}
                                                </h3>
                                                <p className="text-xs text-gray-500 mb-3">SKU: {result.sku}</p>

                                                {/* Price */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-lg font-bold text-blue-600">
                                                        {result.pl_price}
                                                    </span>
                                                    {result.pl_sp && result.pl_sp !== result.pl_price && (
                                                        <span className="text-xs text-gray-400 line-through">
                                                            {result.pl_sp}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Results Count */}
                            {!isLoading && filteredResults.length > 0 && (
                                <div className="mt-6 text-center text-sm text-gray-500">
                                    Wyświetlono {filteredResults.length} z {results.length} produktów
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
