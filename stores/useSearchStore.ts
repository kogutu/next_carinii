// stores/useSearchStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// ============ TYPES ============
export interface Suggestion {
    id: string;
    term: string;
    highlighted: string;
    type: 'query' | 'category' | 'brand' | 'product';
    popularity: number;
    searchCount: number;
    resultCount: number;
    category?: string;
    image?: string;
    url?: string;
    trending: boolean;
}

export interface Product {
    id: string;
    name: string;
    highlighted: string;
    sku: string;
    price: number;
    specialPrice?: number;
    hasSpecialPrice: boolean;
    image: string;
    url: string;
    brand?: string;
    categories: string[];
}

export interface CategoryFacet {
    id: string;
    term: string;
    highlighted: string;
    image?: string;
    url?: string;
    resultCount: number;
}

export interface SearchMeta {
    query: string;
    suggestionsCount: number;
    productsCount: number;
    searchTimeMs: number;
}

interface SearchState {
    // UI State
    isOpen: boolean;
    query: string;
    selectedIndex: number;
    activeTab: 'all' | 'products' | 'categories' | 'brands';

    // Results
    suggestions: Suggestion[];
    products: Product[];
    categories: CategoryFacet[];
    brands: CategoryFacet[];
    meta: SearchMeta | null;

    // Loading & Error
    isLoading: boolean;
    error: string | null;

    // Recent searches
    recentSearches: string[];
}

interface SearchActions {
    // Actions
    setIsOpen: (isOpen: boolean) => void;
    setQuery: (query: string) => void;
    setSelectedIndex: (index: number) => void;
    setActiveTab: (tab: 'all' | 'products' | 'categories' | 'brands') => void;

    search: (query: string) => Promise<void>;
    clearResults: () => void;
    reset: () => void;

    // Recent searches
    loadRecentSearches: () => void;
    addToRecentSearches: (term: string) => void;
    clearRecentSearches: () => void;

    // Tracking
    trackSearch: (term: string, resultCount: number, selectedProductId?: string) => Promise<void>;

    // Navigation helpers
    getTotalNavigableItems: () => number;
    navigateUp: () => void;
    navigateDown: () => void;
    selectCurrentItem: () => { type: string; item: any } | null;
}

type SearchStore = SearchState & SearchActions;

// ============ TYPESENSE API HELPERS ============
const TYPESENSE_PROXY = 'https://www.hert.pl/typesense';

const typesenseMultiSearch = async (searches: any[]) => {
    const response = await fetch(`${TYPESENSE_PROXY}/multi_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searches }),
    });

    if (!response.ok) {
        throw new Error(`Typesense error: ${response.status}`);
    }

    return response.json();
};

const typesenseUpsert = async (collection: string, document: any) => {
    const response = await fetch(
        `${TYPESENSE_PROXY}/collections/${collection}/documents?action=upsert`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(document),
        }
    );

    if (!response.ok) {
        throw new Error(`Typesense upsert error: ${response.status}`);
    }

    return response.json();
};

const typesenseUpdate = async (collection: string, id: string, document: any) => {
    const response = await fetch(
        `${TYPESENSE_PROXY}/collections/${collection}/documents/${id}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(document),
        }
    );

    return response;
};

const typesenseGet = async (collection: string, id: string) => {
    const response = await fetch(
        `${TYPESENSE_PROXY}/collections/${collection}/documents/${id}`
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Typesense get error: ${response.status}`);
    }

    return response.json();
};

// ============ HELPER FUNCTIONS ============
const createTermId = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
};

const generateNgrams = (text: string, minSize = 2): string => {
    const ngrams: string[] = [];
    const words = text.toLowerCase().split(' ');

    words.forEach(word => {
        for (let i = minSize; i <= word.length; i++) {
            ngrams.push(word.substring(0, i));
        }
    });

    return ngrams.join(' ');
};

// ============ INITIAL STATE ============
const initialState: SearchState = {
    isOpen: false,
    query: '',
    selectedIndex: -1,
    activeTab: 'all',
    suggestions: [],
    products: [],
    categories: [],
    brands: [],
    meta: null,
    isLoading: false,
    error: null,
    recentSearches: [],
};

// ============ STORE ============
export const useSearchStore = create<SearchStore>()(
    devtools(
        (set, get) => ({
            ...initialState,

            // ============ UI ACTIONS ============
            setIsOpen: (isOpen) => {
                set({ isOpen }, false, 'setIsOpen');
                if (isOpen) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            },

            setQuery: (query) => {
                set({ query, selectedIndex: -1 }, false, 'setQuery');
            },

            setSelectedIndex: (selectedIndex) => {
                set({ selectedIndex }, false, 'setSelectedIndex');
            },

            setActiveTab: (activeTab) => {
                set({ activeTab, selectedIndex: -1 }, false, 'setActiveTab');
            },

            // ============ SEARCH ============
            search: async (query) => {
                const trimmedQuery = query.trim();

                if (trimmedQuery.length < 1) {
                    set({
                        suggestions: [],
                        products: [],
                        categories: [],
                        brands: [],
                        meta: null,
                        error: null,
                        selectedIndex: -1,
                        isLoading: false,
                    }, false, 'clearResults');
                    return;
                }

                set({ isLoading: true, error: null }, false, 'searchStart');

                try {
                    const startTime = performance.now();

                    const searchParams = {
                        searches: [
                            // 1. Sugestie tekstowe
                            {
                                collection: 'search_suggestions',
                                q: trimmedQuery,
                                query_by: 'term,term_ngram',
                                prefix: 'true',
                                num_typos: '2',
                                typo_tokens_threshold: '1',
                                sort_by: 'popularity:desc,search_count:desc',
                                per_page: '8',
                                highlight_full_fields: 'term',
                                highlight_start_tag: '<mark>',
                                highlight_end_tag: '</mark>',
                            },
                            // 2. Produkty
                            {
                                collection: 'products',
                                q: trimmedQuery,
                                query_by: 'name,name_pl,sku,brand',
                                prefix: 'true',
                                num_typos: '1',
                                sort_by: '_text_match:desc,popularity:desc',
                                per_page: '8',
                                highlight_full_fields: 'name',
                                highlight_start_tag: '<mark>',
                                highlight_end_tag: '</mark>',
                            },
                            // 3. Kategorie
                            {
                                collection: 'search_suggestions',
                                q: trimmedQuery,
                                query_by: 'term',
                                prefix: 'true',
                                num_typos: '1',
                                filter_by: 'type:=category',
                                sort_by: 'popularity:desc',
                                per_page: '5',
                                highlight_full_fields: 'term',
                                highlight_start_tag: '<mark>',
                                highlight_end_tag: '</mark>',
                            },
                            // 4. Marki
                            {
                                collection: 'search_suggestions',
                                q: trimmedQuery,
                                query_by: 'term',
                                prefix: 'true',
                                num_typos: '1',
                                filter_by: 'type:=brand',
                                sort_by: 'popularity:desc',
                                per_page: '5',
                                highlight_full_fields: 'term',
                                highlight_start_tag: '<mark>',
                                highlight_end_tag: '</mark>',
                            },
                        ],
                    };

                    const results = await typesenseMultiSearch(searchParams.searches);
                    const endTime = performance.now();

                    const [suggestionsResult, productsResult, categoriesResult, brandsResult] =
                        results.results || [];

                    // Parse suggestions
                    const suggestions: Suggestion[] = (suggestionsResult?.hits || []).map((hit: any) => ({
                        id: hit.document.id,
                        term: hit.document.term,
                        highlighted: hit.highlight?.term?.snippet || hit.document.term,
                        type: hit.document.type || 'query',
                        popularity: hit.document.popularity || 0,
                        searchCount: hit.document.search_count || 0,
                        resultCount: hit.document.result_count || 0,
                        category: hit.document.category,
                        image: hit.document.image,
                        url: hit.document.url,
                        trending: hit.document.trending || false,
                    }));

                    // Parse products
                    const products: Product[] = (productsResult?.hits || []).map((hit: any) => ({
                        id: hit.document.id,
                        name: hit.document.name,
                        highlighted: hit.highlight?.name?.snippet || hit.document.name,
                        sku: hit.document.sku,
                        price: hit.document.price || hit.document.pl_price || 0,
                        specialPrice: hit.document.special_price || hit.document.pl_sp,
                        hasSpecialPrice: hit.document.has_special_price || false,
                        image: hit.document.image || hit.document.bimg,
                        url: hit.document.url || hit.document.url_key,
                        brand: hit.document.brand,
                        categories: hit.document.categories || hit.document.cats || [],
                    }));

                    // Parse categories
                    const categories: CategoryFacet[] = (categoriesResult?.hits || []).map((hit: any) => ({
                        id: hit.document.id,
                        term: hit.document.term,
                        highlighted: hit.highlight?.term?.snippet || hit.document.term,
                        image: hit.document.image,
                        url: hit.document.url,
                        resultCount: hit.document.result_count || 0,
                    }));

                    // Parse brands
                    const brands: CategoryFacet[] = (brandsResult?.hits || []).map((hit: any) => ({
                        id: hit.document.id,
                        term: hit.document.term,
                        highlighted: hit.highlight?.term?.snippet || hit.document.term,
                        image: hit.document.image,
                        url: hit.document.url,
                        resultCount: hit.document.result_count || 0,
                    }));

                    set({
                        suggestions,
                        products,
                        categories,
                        brands,
                        meta: {
                            query: trimmedQuery,
                            suggestionsCount: suggestionsResult?.found || 0,
                            productsCount: productsResult?.found || 0,
                            searchTimeMs: Math.round(endTime - startTime),
                        },
                        isLoading: false,
                        selectedIndex: -1,
                    }, false, 'searchSuccess');

                } catch (error: any) {
                    console.error('Search error:', error);
                    set({
                        error: error.message || 'Błąd wyszukiwania',
                        isLoading: false,
                        suggestions: [],
                        products: [],
                        categories: [],
                        brands: [],
                    }, false, 'searchError');
                }
            },

            clearResults: () => {
                set({
                    suggestions: [],
                    products: [],
                    categories: [],
                    brands: [],
                    meta: null,
                    error: null,
                    selectedIndex: -1,
                }, false, 'clearResults');
            },

            reset: () => {
                const { recentSearches } = get();
                set({ ...initialState, recentSearches }, false, 'reset');
                document.body.style.overflow = '';
            },

            // ============ RECENT SEARCHES ============
            loadRecentSearches: () => {
                try {
                    const saved = localStorage.getItem('hert_recent_searches');
                    if (saved) {
                        set({ recentSearches: JSON.parse(saved) }, false, 'loadRecentSearches');
                    }
                } catch (e) {
                    console.error('Error loading recent searches:', e);
                }
            },

            addToRecentSearches: (term) => {
                const { recentSearches } = get();
                const normalized = term.trim().toLowerCase();

                if (!normalized) return;

                const updated = [
                    term.trim(),
                    ...recentSearches.filter(s => s.toLowerCase() !== normalized)
                ].slice(0, 8);

                set({ recentSearches: updated }, false, 'addToRecentSearches');
                localStorage.setItem('hert_recent_searches', JSON.stringify(updated));
            },

            clearRecentSearches: () => {
                set({ recentSearches: [] }, false, 'clearRecentSearches');
                localStorage.removeItem('hert_recent_searches');
            },

            // ============ TRACKING ============
            trackSearch: async (term, resultCount, selectedProductId) => {
                const normalizedTerm = term.toLowerCase().trim();
                if (!normalizedTerm || normalizedTerm.length < 2) return;

                try {
                    const termId = createTermId(normalizedTerm);

                    const existing = await typesenseGet('search_suggestions', termId);

                    if (existing) {
                        const newSearchCount = (existing.search_count || 0) + 1;
                        await typesenseUpdate('search_suggestions', termId, {
                            search_count: newSearchCount,
                            popularity: Math.min(
                                (existing.popularity || 0) + 10 + Math.min(resultCount, 50),
                                10000
                            ),
                            result_count: resultCount,
                            last_searched: Date.now(),
                            trending: newSearchCount > 20,
                        });
                    } else {
                        await typesenseUpsert('search_suggestions', {
                            id: termId,
                            term: normalizedTerm,
                            term_ngram: generateNgrams(normalizedTerm),
                            popularity: 10 + Math.min(resultCount, 50),
                            search_count: 1,
                            result_count: resultCount,
                            type: 'query',
                            trending: false,
                            last_searched: Date.now(),
                        });
                    }

                    if (selectedProductId) {
                        const product = await typesenseGet('products', selectedProductId);
                        if (product) {
                            await typesenseUpdate('products', selectedProductId, {
                                popularity: (product.popularity || 0) + 5,
                            });
                        }
                    }
                } catch (error) {
                    console.error('Track search error:', error);
                }
            },

            // ============ NAVIGATION ============
            getTotalNavigableItems: () => {
                const { suggestions, categories, brands, activeTab } = get();

                if (activeTab === 'products') return 0;
                if (activeTab === 'categories') return categories.length;
                if (activeTab === 'brands') return brands.length;

                return suggestions.length + categories.length + brands.length;
            },

            navigateUp: () => {
                const { selectedIndex } = get();
                const total = get().getTotalNavigableItems();

                if (total === 0) return;

                set({
                    selectedIndex: selectedIndex <= 0 ? total - 1 : selectedIndex - 1
                }, false, 'navigateUp');
            },

            navigateDown: () => {
                const { selectedIndex } = get();
                const total = get().getTotalNavigableItems();

                if (total === 0) return;

                set({
                    selectedIndex: selectedIndex >= total - 1 ? 0 : selectedIndex + 1
                }, false, 'navigateDown');
            },

            selectCurrentItem: () => {
                const { selectedIndex, suggestions, categories, brands } = get();

                if (selectedIndex < 0) return null;

                const suggestionsCount = suggestions.length;
                const categoriesCount = categories.length;

                if (selectedIndex < suggestionsCount) {
                    return { type: 'suggestion', item: suggestions[selectedIndex] };
                }

                if (selectedIndex < suggestionsCount + categoriesCount) {
                    return { type: 'category', item: categories[selectedIndex - suggestionsCount] };
                }

                const brandIndex = selectedIndex - suggestionsCount - categoriesCount;
                if (brandIndex < brands.length) {
                    return { type: 'brand', item: brands[brandIndex] };
                }

                return null;
            },
        }),
        { name: 'search-store' }
    )
);

// ============ SELECTORS ============
// Stabilne selektory dla lepszej wydajności

export const useSearchQuery = () => useSearchStore((state) => state.query);
export const useSearchIsOpen = () => useSearchStore((state) => state.isOpen);
export const useSearchIsLoading = () => useSearchStore((state) => state.isLoading);
export const useSearchError = () => useSearchStore((state) => state.error);
export const useSearchSelectedIndex = () => useSearchStore((state) => state.selectedIndex);

export const useSearchResults = () => useSearchStore((state) => ({
    suggestions: state.suggestions,
    products: state.products,
    categories: state.categories,
    brands: state.brands,
    meta: state.meta,
}));

export const useRecentSearches = () => useSearchStore((state) => state.recentSearches);

// Akcje - te nie powodują re-renderów
export const useSearchActions = () => {
    const store = useSearchStore;
    return {
        setIsOpen: store.getState().setIsOpen,
        setQuery: store.getState().setQuery,
        setSelectedIndex: store.getState().setSelectedIndex,
        search: store.getState().search,
        clearResults: store.getState().clearResults,
        reset: store.getState().reset,
        loadRecentSearches: store.getState().loadRecentSearches,
        addToRecentSearches: store.getState().addToRecentSearches,
        clearRecentSearches: store.getState().clearRecentSearches,
        trackSearch: store.getState().trackSearch,
        navigateUp: store.getState().navigateUp,
        navigateDown: store.getState().navigateDown,
        selectCurrentItem: store.getState().selectCurrentItem,
        getTotalNavigableItems: store.getState().getTotalNavigableItems,
    };
};