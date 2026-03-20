'use client';

import React from "react"

import { Search, X } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';

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

export default function SearchBar({ type }: { type: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchProducts = useCallback(
        async (term: string) => {
            if (term.length < 2) {
                setResults([]);
                setShowResults(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(
                    `https://www.hert.pl/search/autoc/index.php?term=${encodeURIComponent(term)}`
                );
                const data = await response.json();
                setResults(Array.isArray(data) ? data : []);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        },
        []
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        searchProducts(value);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setShowResults(false);
    };

    const handleResultClick = (result: SearchResult) => {
        window.location.href = result.url_key;
    };

    const isMobile = type === 'mobile';
    const containerClass = isMobile
        ? 'flex mt-4 md:hidden flex-grow mx-2 relative'
        : 'hidden  md:flex max-w-[400px] flex-grow mx-2 relative';

    return (
        <div className={containerClass}>
            <div className="w-full relative">
                <input
                    type="text"
                    placeholder="Czego szukasz?"
                    value={query}
                    onChange={handleChange}
                    onFocus={() => query && setShowResults(true)}
                    className="w-full border border-gray-300 rounded-full py-2.5 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm"
                />

                {query && (
                    <button
                        onClick={handleClear}
                        className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={16} />
                    </button>
                )}

                <button className="absolute right-[2px] top-[3px] bg-hert text-white p-2 rounded-full w-9 h-9 flex items-center justify-center hover:opacity-90 transition">
                    <Search size={16} />
                </button>

                {/* Search Results Dropdown */}
                {showResults && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                        {isLoading && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Szukam...
                            </div>
                        )}

                        {!isLoading && results.length === 0 && query.length >= 2 && (
                            <div className="p-4 text-center text-gray-500 text-sm">
                                Brak wyników
                            </div>
                        )}

                        {!isLoading && results.length > 0 && (
                            <div className="divide-y">
                                {results.map((result) => (
                                    <button
                                        key={result.id}
                                        onClick={() => handleResultClick(result)}
                                        className="w-full px-4 py-3 hover:bg-purple-50 transition flex gap-3 items-start text-left"
                                    >
                                        {/* Product Image */}
                                        <div className="flex-shrink-0">
                                            <div className="relative w-12 h-12 bg-gray-100 rounded">
                                                <Image
                                                    src={result.bimg || "/placeholder.svg"}
                                                    alt={result.name}
                                                    fill
                                                    className="object-cover rounded"
                                                    onError={(e) => {
                                                        const img = e.target as HTMLImageElement;
                                                        img.src = '/placeholder-product.png';
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-grow min-w-0">
                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                {result.name}
                                            </div>
                                            <div className="text-xs text-gray-500 truncate">
                                                SKU: {result.sku}
                                            </div>
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-sm font-bold text-hert">
                                                    {result.pl_price}
                                                </span>
                                                {result.has_special_price === 1 && (
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                                                        Promocja
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
