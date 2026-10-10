'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
    Search, X, Clock, TrendingUp, ChevronRight, Tag,
    Folder, Sparkles, ArrowRight, Layers, Star,
    Zap, Package, Filter, ChevronDown, ChevronUp,
    Palette, Footprints, Shield, Ruler, Thermometer
} from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import ProductItem from "@/pages/product-item";


// ============ TYPES ============
interface TypesenseDocument {
    id: string;
    pid: number;
    name: string;
    sku: string;
    slug: string;
    url_key: string;
    url: string;
    description: string;
    price: number;
    brutto_pln: number;
    netto_pln: number;
    brutto_specialprice_pln: number;
    netto_specialprice_pln: number;
    has_special_price: boolean;
    categories: string[];
    cids: string[];
    image: string;
    image_medium: string;
    image_small: string;
    manufacturer: string;
    is_new: boolean;
    new_product: boolean;
    promo_badge: boolean;
    status: boolean;
    is_salable: string;
}

interface TypesenseHit {
    document: TypesenseDocument;
    highlight: {
        name?: {
            matched_tokens: string[];
            snippet: string;
        };
    };
    highlights: Array<{
        field: string;
        matched_tokens: string[];
        snippet: string;
    }>;
    text_match: string;
    text_match_info: {
        best_field_score: string;
        best_field_weight: number;
        fields_matched: number;
        tokens_matched: number;
    };
}

interface FacetCount {
    count: number;
    highlighted: string;
    value: string;
}

interface TypesenseFacet {
    counts: FacetCount[];
    field_name: string;
    sampled: boolean;
    stats: {
        total_values: number;
    };
}

interface TypesenseResponse {
    facet_counts: TypesenseFacet[];
    found: number;
    hits: TypesenseHit[];
    out_of: number;
    page: number;
    request_params: {
        collection_name: string;
        per_page: number;
        q: string;
    };
    search_cutoff: boolean;
    search_time_ms: number;
}

// ============ FACET CONFIG ============

// Konfiguracja facetów — kolejność, label, ikona, typ
interface FacetConfig {
    field: string;
    label: string;
    icon: React.ReactNode;
    type: 'multi' | 'boolean' | 'single';
    // Dla boolean: jaki value traktować jako "zaznaczony"
    booleanTrueValue?: string;
    // Dla boolean: jaki label pokazać w quick filters
    booleanLabel?: string;
    // Kolor akcentu
    activeColor?: string;
    activeBg?: string;
    // Czy pokazać w quick filters (górny pasek)
    quickFilter?: boolean;
    // Domyślnie rozwinięty w sidebarze
    defaultExpanded?: boolean;
    // Max elementów przed "Pokaż więcej"
    maxVisible?: number;
}

const FACET_CONFIG: FacetConfig[] = [
    {
        field: 'has_special_price',
        label: 'Promocja',
        icon: <Tag size={14} />,
        type: 'boolean',
        booleanTrueValue: 'true',
        booleanLabel: 'Promocja',
        activeColor: 'text-orange-700',
        activeBg: 'bg-orange-500',
        quickFilter: true,
        defaultExpanded: false,
    },

    {
        field: 'categories',
        label: 'Kategorie',
        icon: <Folder size={14} />,
        type: 'multi',
        activeColor: 'text-foreground',
        activeBg: 'bg-muted',
        defaultExpanded: true,
        maxVisible: 8,
    },

    {
        field: 'typ',
        label: 'typ',
        icon: <Footprints size={14} />,
        type: 'multi',
        activeColor: 'text-indigo-700',
        activeBg: 'bg-indigo-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'kolor',
        label: 'kolor',
        icon: <Palette size={14} />,
        type: 'multi',
        activeColor: 'text-pink-700',
        activeBg: 'bg-pink-100',
        defaultExpanded: false,
        maxVisible: 8,
    },
    {
        field: 'materiał',
        label: 'materiał',
        icon: <Shield size={14} />,
        type: 'multi',
        activeColor: 'text-amber-700',
        activeBg: 'bg-amber-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'cholewka',
        label: 'cholewka',
        icon: <Shield size={14} />,
        type: 'multi',
        activeColor: 'text-amber-700',
        activeBg: 'bg-amber-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'zapięcie',
        label: 'zapięcie',
        icon: <Shield size={14} />,
        type: 'multi',
        activeColor: 'text-slate-700',
        activeBg: 'bg-slate-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'wysokość obcasa',
        label: 'wysokość obcasa',
        icon: <Ruler size={14} />,
        type: 'multi',
        activeColor: 'text-rose-700',
        activeBg: 'bg-rose-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'materiał obcasa',
        label: 'materiał obcasa',
        icon: <Shield size={14} />,
        type: 'multi',
        activeColor: 'text-amber-700',
        activeBg: 'bg-amber-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'rodzaj podeszwy',
        label: 'rodzaj podeszwy',
        icon: <Footprints size={14} />,
        type: 'multi',
        activeColor: 'text-stone-700',
        activeBg: 'bg-stone-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'podeszwa materiał',
        label: 'podeszwa materiał',
        icon: <Footprints size={14} />,
        type: 'multi',
        activeColor: 'text-stone-700',
        activeBg: 'bg-stone-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'grubość podeszwy',
        label: 'grubość podeszwy',
        icon: <Ruler size={14} />,
        type: 'multi',
        activeColor: 'text-stone-700',
        activeBg: 'bg-stone-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'wnętrze',
        label: 'wnętrze',
        icon: <Shield size={14} />,
        type: 'multi',
        activeColor: 'text-teal-700',
        activeBg: 'bg-teal-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'wkładka',
        label: 'wkładka',
        icon: <Footprints size={14} />,
        type: 'multi',
        activeColor: 'text-teal-700',
        activeBg: 'bg-teal-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'wysokość całkowita buta',
        label: 'wysokość całkowita buta',
        icon: <Ruler size={14} />,
        type: 'multi',
        activeColor: 'text-violet-700',
        activeBg: 'bg-violet-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'tęgość',
        label: 'tęgość',
        icon: <Ruler size={14} />,
        type: 'multi',
        activeColor: 'text-violet-700',
        activeBg: 'bg-violet-100',
        defaultExpanded: false,
        maxVisible: 6,
    },
    {
        field: 'ocieplenie',
        label: 'ocieplenie',
        icon: <Thermometer size={14} />,
        type: 'multi',
        activeColor: 'text-destructive',
        activeBg: 'bg-destructive/10',
        defaultExpanded: false,
        maxVisible: 6,
    },
];

// Generuj FACET_FIELDS z konfiguracji (unikalne)
const FACET_FIELDS = [...new Set(FACET_CONFIG.map(f => f.field))].join(',');

// ============ CONSTANTS ============
const popularSearches = [
    { term: "Najnowsze", icon: "❤️" },
    { term: "skórzane", icon: "❤️" },
    { term: "sandały na obcasie", icon: "❤️" },
    { term: "sneakersy", icon: "❤️" },
    { term: "torebka", icon: "❤️" },
];

// Top-level fetch nie może wywalić prerendera/builda (np. gdy
// NEXT_PUBLIC_API_URL wskazuje lokalny host) — twardy fallback na [].
const promoProducts: any[] = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/products_category?cid=190&t=1`, {
    cache: 'force-cache',
    next: {
        revalidate: 60 * 60 * 24,
    },
}).then(res => res.json()).then(data => data.hits.map((hit: any) => hit.document)).catch(() => [])

// ============ DEBOUNCE HOOK ============
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// ============ HELPER FUNCTIONS ============
const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pl-PL', {
        style: 'currency',
        currency: 'PLN',
    }).format(price);
};

// ============ TYPESENSE → PRODUCT MAPPER ============
const mapTypesenseToProduct = (doc: TypesenseDocument): any => {
    return doc;
};

// ============ ACTIVE FILTERS TYPE ============
// Generyczny typ: klucz = nazwa pola facetu, wartość = Set wybranych wartości
type ActiveFiltersMap = Record<string, Set<string>>;

// ============ FACET SECTION COMPONENT ============
interface FacetSectionProps {
    config: FacetConfig;
    counts: FacetCount[];
    activeValues: Set<string>;
    onToggleValue: (field: string, value: string) => void;
}

function FacetSection({ config, counts, activeValues, onToggleValue }: FacetSectionProps) {
    const [isExpanded, setIsExpanded] = useState(config.defaultExpanded ?? false);
    const [showAll, setShowAll] = useState(false);

    const maxVisible = config.maxVisible ?? 6;
    const filteredCounts = counts.filter(c => c.value && c.count > 0);

    if (filteredCounts.length === 0) return null;

    const visibleCounts = showAll ? filteredCounts : filteredCounts.slice(0, maxVisible);
    const hasMore = filteredCounts.length > maxVisible;
    const activeCount = activeValues.size;

    // Jedna neutralna paleta (czerń/szarości sklepu); kolory per facet z konfiguracji nie są już używane
    const colors = { activeBg: 'bg-muted', activeText: 'text-foreground', pillBg: 'bg-primary', pillText: 'text-primary-foreground', dotBg: 'bg-primary' };

    return (
        <div className="border-b border-border last:border-b-0">
            {/* Header — kliknięcie rozwija/zwija */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-4 md:p-5 flex items-center justify-between hover:bg-muted/60 transition-colors"
            >
                <h3 className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-[0.14em]">
                    {config.icon}
                    {config.label}
                    {activeCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${colors.pillBg} ${colors.pillText} font-bold`}>
                            {activeCount}
                        </span>
                    )}
                </h3>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="px-4 md:px-5 pb-4 md:pb-5">
                    <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
                        {visibleCounts.map((facet, index) => {
                            const isActive = activeValues.has(facet.value);
                            return (
                                <button
                                    key={index}
                                    onClick={() => onToggleValue(config.field, facet.value)}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition flex items-center justify-between group ${isActive
                                        ? `${colors.activeBg} ${colors.activeText} font-medium`
                                        : 'hover:bg-white text-foreground'
                                        }`}
                                >
                                    <span className="truncate flex items-center gap-2">
                                        {/* Checkbox-like indicator */}
                                        <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${isActive
                                            ? `${colors.dotBg} border-transparent`
                                            : 'border-border group-hover:border-foreground/50'
                                            }`}>
                                            {isActive && (
                                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </span>
                                        <span
                                            dangerouslySetInnerHTML={{ __html: facet.highlighted || facet.value }}
                                        />
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${isActive
                                        ? `${colors.pillBg} ${colors.pillText}`
                                        : 'bg-muted text-muted-foreground'
                                        }`}>
                                        {facet.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Pokaż więcej / mniej */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-2 text-xs text-foreground hover:text-foreground font-medium flex items-center gap-1 transition"
                        >
                            {showAll ? (
                                <>
                                    <ChevronUp size={12} />
                                    Pokaż mniej
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={12} />
                                    Pokaż więcej ({filteredCounts.length - maxVisible})
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ============ MAIN COMPONENT ============
export default function MegaSearch({ type }: { type: string }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<TypesenseHit[]>([]);
    const [facetData, setFacetData] = useState<TypesenseFacet[]>([]);
    const [totalFound, setTotalFound] = useState(0);
    const [searchTime, setSearchTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showMobileFacets, setShowMobileFacets] = useState(false);

    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Generyczny map filtrów: field -> Set<wartość>
    const [activeFilters, setActiveFilters] = useState<ActiveFiltersMap>({});

    const inputRef = useRef<HTMLInputElement>(null);
    const debouncedQuery = useDebounce(query, 300);

    // ============ COMPUTED ============

    // Facety jako mapa: field_name -> FacetCount[]
    const facetMap = useMemo(() => {
        const map: Record<string, FacetCount[]> = {};
        facetData.forEach(f => {
            map[f.field_name] = f.counts;
        });
        return map;
    }, [facetData]);

    // Ile filtrów jest aktywnych łącznie
    const totalActiveFilters = useMemo(() => {
        let count = 0;
        Object.values(activeFilters).forEach(set => { count += set.size; });
        return count;
    }, [activeFilters]);

    // Lista aktywnych filtrów jako tablica do wyświetlenia w pill-ach
    const activeFilterPills = useMemo(() => {
        const pills: { field: string; value: string; label: string; config: FacetConfig }[] = [];
        Object.entries(activeFilters).forEach(([field, values]) => {
            const cfg = FACET_CONFIG.find(c => c.field === field);
            if (!cfg) return;
            values.forEach(value => {
                const label = cfg.type === 'boolean' ? (cfg.booleanLabel || cfg.label) : value;
                pills.push({ field, value, label, config: cfg });
            });
        });
        return pills;
    }, [activeFilters]);

    // Quick filters (boolean facety oznaczone jako quickFilter)
    const quickFilterConfigs = useMemo(() => {
        return FACET_CONFIG.filter(c => c.quickFilter && c.type === 'boolean');
    }, []);

    // Sidebar facets (non-boolean lub te bez quickFilter)
    const sidebarFacetConfigs = useMemo(() => {
        return FACET_CONFIG.filter(c => c.type !== 'boolean');
    }, []);

    // ============ EFFECTS ============

    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            try { setRecentSearches(JSON.parse(saved)); } catch (e) { console.error('Error parsing recent searches:', e); }
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        if (isOpen) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; }
        return () => { document.removeEventListener('keydown', handleKeyDown); document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    // Wyszukiwarka jest w nagłówku (layout), więc nie odmontowuje się przy przejściu na inną stronę.
    // Bez tego produkt otwierał się pod nią, a okno wyszukiwania dalej go zasłaniało.
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (debouncedQuery) {
            searchProducts(debouncedQuery);
        }
    }, [debouncedQuery, activeFilters]);

    useEffect(() => {
        return () => { if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current); };
    }, []);

    // ============ HANDLERS ============

    const saveToRecent = (term: string) => {
        if (!term.trim()) return;
        const updated = [term, ...recentSearches.filter(s => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Toggle jednej wartości w filtrach
    const toggleFilterValue = useCallback((field: string, value: string) => {
        setActiveFilters(prev => {
            const next = { ...prev };
            const currentSet = new Set(prev[field] || []);

            // Dla boolean facets — toggle (może być tylko 1 wartość)
            const cfg = FACET_CONFIG.find(c => c.field === field);
            if (cfg?.type === 'boolean') {
                if (currentSet.has(value)) {
                    currentSet.delete(value);
                } else {
                    currentSet.clear();
                    currentSet.add(value);
                }
            } else {
                // Multi — toggle wartości
                if (currentSet.has(value)) {
                    currentSet.delete(value);
                } else {
                    currentSet.add(value);
                }
            }

            if (currentSet.size === 0) {
                delete next[field];
            } else {
                next[field] = currentSet;
            }
            return next;
        });
    }, []);

    // Buduj filter_by z aktywnych filtrów
    const buildFilterString = useCallback((): string => {
        const filters: string[] = ['status:true'];

        Object.entries(activeFilters).forEach(([field, values]) => {
            if (values.size === 0) return;
            const cfg = FACET_CONFIG.find(c => c.field === field);

            if (cfg?.type === 'boolean') {
                // Boolean: has_special_price:true
                values.forEach(v => {
                    filters.push(`${field}:${v}`);
                });
            } else {
                // Multi-value: field:=[val1, val2] — Typesense OR
                if (values.size === 1) {
                    const val = [...values][0];
                    filters.push(`${field}:=\`${val}\``);
                } else {
                    const valStr = [...values].map(v => `\`${v}\``).join(',');
                    filters.push(`${field}:=[${valStr}]`);
                }
            }
        });

        return filters.join(' && ');
    }, [activeFilters]);

    const searchProducts = useCallback(async (term: string) => {
        if (term.length < 2) {
            setResults([]);
            setFacetData([]);
            setTotalFound(0);
            return;
        }

        setIsLoading(true);
        try {
            const filterString = buildFilterString();

            const params = new URLSearchParams({
                q: term,
                query_by: 'name,sku,description,kolor',
                prefix: 'true',
                per_page: '20',
                facet_by: FACET_FIELDS,
                max_facet_values: '20',
            });

            if (filterString) {
                params.append('filter_by', filterString);
            }

            params.append('sort_by', '_text_match:desc,price:asc');

            const url = `https://sklep.carinii.com.pl/directseo/nextjs/api/?path=/collections/carinii_prs/documents/search?${params.toString()}`;

            const response = await fetch(url);
            const data: TypesenseResponse = await response.json();

            console.log(data);
            setResults(data.hits || []);
            setTotalFound(data.found || 0);
            setSearchTime(data.search_time_ms || 0);
            setFacetData(data.facet_counts || []);
        } catch (error) {
            console.error('Search error:', error);
            setResults([]);
            setFacetData([]);
            setTotalFound(0);
        } finally {
            setIsLoading(false);
        }
    }, [buildFilterString]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length < 2) {
            setResults([]);
            setFacetData([]);
            setTotalFound(0);
        }

        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        blurTimeoutRef.current = setTimeout(() => {
            if (inputRef.current && window.innerWidth < 768) {
                inputRef.current.blur();
            }
        }, 1500);
    };

    const handleClear = () => {
        setQuery('');
        setResults([]);
        setFacetData([]);
        setTotalFound(0);
        setActiveFilters({});
        inputRef.current?.focus();
    };

    const handleClose = () => {
        setIsOpen(false);
        handleClear();
    };

    const handleResultClick = (result: TypesenseHit) => {
        saveToRecent(query);
        window.location.href = `/${result.document.url_key}.html`;
    };

    const handleSuggestionClick = (term: string) => {
        setQuery(term);
        saveToRecent(term);
    };

    const clearAllFilters = () => {
        setActiveFilters({});
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            saveToRecent(query);
            const filterParams = new URLSearchParams();
            filterParams.append('q', query);
            // Przekaż aktywne filtry do URL
            Object.entries(activeFilters).forEach(([field, values]) => {
                values.forEach(v => {
                    filterParams.append(field, v);
                });
            });
            window.location.href = `/search?${filterParams.toString()}`;
        }
    };

    // ============ RENDER ============

    const isMobile = type === 'mobile';
    const containerClass = isMobile
        ? 'flex mt-4 md:hidden flex-grow mx-2 relative'
        : 'hidden md:flex max-w-[400px] flex-grow mx-2 relative';

    return (
        <>
            {/* Search Trigger Button */}
            <div className={containerClass}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-full border border-border rounded-full py-2.5 px-6 pr-12 text-left text-muted-foreground text-sm bg-white hover:border-border hover:shadow-md transition-all flex items-center gap-2 group"
                >
                    <Search size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>Czego szukasz?</span>
                    <kbd className="hidden lg:inline-flex ml-auto text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        ⌘K
                    </kbd>
                </button>
                <div className="absolute right-[2px] top-[3px] bg-primary text-primary-foreground p-2 rounded-full w-9 h-9 flex items-center justify-center pointer-events-none">
                    <Search size={16} />
                </div>
            </div>

            {/* Mega Search Modal */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[9999]"
                    onClickCapture={(event) => {
                        // kliknięcie w dowolny link w wynikach (produkt, kategoria, „wszystkie wyniki”) zamyka okno
                        // od razu — także gdy adres się nie zmienia (np. ponowne szukanie na stronie /search)
                        if ((event.target as HTMLElement).closest('a[href]')) {
                            saveToRecent(query);
                            setIsOpen(false);
                        }
                    }}
                >
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
                        onClick={handleClose}
                    />

                    {/* Modal Container */}
                    <div className="absolute inset-0 flex items-start justify-center p-4 pt-[5vh] overflow-y-auto">
                        <div
                            className="relative w-full max-w-[95vw] xl:max-w-[1400px] bg-white rounded-2xl shadow-2xl 
                                       animate-in fade-in slide-in-from-top-4 duration-300 my-auto"
                            style={{ minHeight: 'calc(90vh - 40px)', maxHeight: 'calc(90vh - 40px)' }}
                        >
                            {/* ============ SEARCH HEADER ============ */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-border p-4 md:p-6 z-20 rounded-t-2xl">
                                <form onSubmit={handleSubmit} className="flex items-center gap-3 md:gap-4">
                                    <div className="flex-grow relative">
                                        <div className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                            {isLoading ? (
                                                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-border border-t-foreground rounded-full animate-spin motion-reduce:animate-none" />
                                            ) : (
                                                <Search className="text-muted-foreground w-5 h-5 md:w-6 md:h-6" />
                                            )}
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            placeholder="Wpisz nazwę produktu, kategorię lub markę..."
                                            value={query}
                                            onChange={handleChange}
                                            className="w-full border border-hborder/50 rounded-xl py-3 md:py-4 pl-12 md:pl-16 pr-12 
                                                       text-base md:text-lg focus:outline-none focus:border-transparent focus:ring-2 focus:ring-foreground transition-all bg-background"
                                            autoComplete="off"
                                        />
                                        {query && (
                                            <button
                                                type="button"
                                                onClick={handleClear}
                                                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-muted-foreground 
                                                           hover:text-foreground transition p-1 hover:bg-muted rounded-full"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="p-2 md:p-3 text-muted-foreground hover:text-foreground hover:bg-muted 
                                                   rounded-xl transition-all flex-shrink-0"
                                    >
                                        <X size={24} />
                                    </button>
                                </form>

                                {/* Search info & active filters */}
                                <div className="flex flex-wrap items-center justify-between mt-3 px-2 gap-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="text-xs text-muted-foreground">
                                            Naciśnij <kbd className="px-2 py-0.5 bg-muted rounded text-muted-foreground mx-1">ESC</kbd>
                                            aby zamknąć
                                        </p>

                                        {/* Active Filters Pills */}
                                        {activeFilterPills.length > 0 && (
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs text-muted-foreground">|</span>
                                                {activeFilterPills.map((pill, i) => (
                                                    <span
                                                        key={`${pill.field}-${pill.value}-${i}`}
                                                        className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-muted text-foreground`}
                                                    >
                                                        {pill.config.icon}
                                                        {pill.label}
                                                        <button
                                                            onClick={() => toggleFilterValue(pill.field, pill.value)}
                                                            className="hover:opacity-70 ml-0.5"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </span>
                                                ))}
                                                <button
                                                    onClick={clearAllFilters}
                                                    className="text-xs text-destructive hover:text-destructive underline"
                                                >
                                                    Wyczyść wszystkie
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {query && results.length > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            Znaleziono <span className="font-bold text-foreground">{totalFound}</span> produktów
                                            <span className="text-muted-foreground ml-1">({searchTime}ms)</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* ============ SEARCH CONTENT ============ */}
                            <div className="overflow-y-auto" style={{ minHeight: 'calc(90vh - 200px)', maxHeight: 'calc(90vh - 280px)' }}>

                                {/* ===== INITIAL STATE - No Query ===== */}
                                {!query && (
                                    <div className="p-4 md:p-8">
                                        <div className="grid md:grid-cols-1 gap-6 md:gap-8">
                                            {/* Recent Searches */}
                                            {recentSearches.length > 0 && (
                                                <div className="bg-muted/60 rounded-2xl p-5">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-[0.14em]">
                                                            <Clock size={16} className="text-muted-foreground" />
                                                            Ostatnio szukane
                                                        </h3>
                                                        <button
                                                            onClick={clearRecentSearches}
                                                            className="text-xs text-muted-foreground hover:text-destructive transition"
                                                        >
                                                            Wyczyść
                                                        </button>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {recentSearches.map((term, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => handleSuggestionClick(term)}
                                                                className="group flex items-center gap-2 px-4 py-2.5 bg-white 
                                                                           hover:bg-muted/60 text-foreground hover:text-foreground 
                                                                           rounded-xl text-sm transition-all shadow-sm 
                                                                           hover:shadow-md border border-border"
                                                            >
                                                                <Clock size={14} className="text-muted-foreground group-hover:text-foreground" />
                                                                {term}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Popular Searches */}
                                            <div className="bg-muted/60 rounded-2xl p-5 w-full overflow-y-auto mb-4">
                                                <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                                                    <TrendingUp size={16} className="text-muted-foreground" />
                                                    Na skróty
                                                </h3>
                                                <div className="relative w-full">
                                                    <div className="overflow-x-auto no-scrollbar scroll-smooth">
                                                        <div className="flex w-max min-w-full gap-3 px-1">
                                                            {popularSearches.map((item, index) => (
                                                                <button
                                                                    key={index}
                                                                    onClick={() => handleSuggestionClick(item.term)}
                                                                    className="flex-shrink-0 min-w-fit group flex items-center gap-2 
                                                                               px-4 py-2.5 bg-white hover:bg-primary text-foreground 
                                                                               hover:text-white rounded-xl text-sm transition-all shadow-sm 
                                                                               hover:shadow-lg border border-border"
                                                                >
                                                                    <span className="text-base">{item.icon}</span>
                                                                    {item.term}
                                                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition" />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <h3 className="flex items-center gap-2 text-sm font-bold text-foreground mb-4 uppercase tracking-wide">
                                                <Zap size={16} className="text-muted-foreground" />
                                                Nie przegap
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {promoProducts.map((product: any, index: number) => (
                                                    <ProductItem key={product.sku} product={product} viewMode={'grid'} loading={false} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ===== LOADING STATE ===== */}
                                {isLoading && query.length >= 2 && (
                                    <div className="p-8 md:p-16">
                                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                            {[...Array(10)].map((_, i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="aspect-square bg-muted rounded-2xl mb-3" />
                                                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                                    <div className="h-4 bg-muted rounded w-1/2" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ===== NO RESULTS ===== */}
                                {!isLoading && query.length >= 2 && results.length === 0 && (
                                    <div className="p-8 md:p-16 text-center">
                                        <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
                                            <Package size={48} className="text-muted-foreground/60" />
                                        </div>
                                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                                            Brak wyników dla &ldquo;{query}&rdquo;
                                        </h3>
                                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                            Spróbuj zmienić lub uprościć wyszukiwane hasło.
                                            {totalActiveFilters > 0 && " Możesz też wyłączyć niektóre filtry."}
                                        </p>
                                        {totalActiveFilters > 0 && (
                                            <button
                                                onClick={clearAllFilters}
                                                className="mb-4 px-4 py-2 bg-destructive/10 hover:bg-destructive/15 text-destructive rounded-full text-sm transition"
                                            >
                                                Wyczyść wszystkie filtry
                                            </button>
                                        )}
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {popularSearches.slice(0, 4).map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => handleSuggestionClick(item.term)}
                                                    className="px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-full text-sm transition"
                                                >
                                                    {item.icon} {item.term}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ===== RESULTS WITH FACETS ===== */}
                                {!isLoading && query.length >= 2 && results.length > 0 && (
                                    <div className="flex flex-col lg:flex-row min-h-[400px]">

                                        {/* Mobile: Filter toggle button */}
                                        <div className="lg:hidden p-4 border-b border-border flex items-center gap-3">
                                            <button
                                                onClick={() => setShowMobileFacets(!showMobileFacets)}
                                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition ${showMobileFacets
                                                    ? 'bg-primary text-white'
                                                    : 'bg-muted text-foreground hover:bg-muted/70'
                                                    }`}
                                            >
                                                <Filter size={16} />
                                                Filtry
                                                {totalActiveFilters > 0 && (
                                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${showMobileFacets ? 'bg-foreground' : 'bg-muted text-foreground'
                                                        }`}>
                                                        {totalActiveFilters}
                                                    </span>
                                                )}
                                            </button>

                                            {/* Quick filters inline on mobile */}
                                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                                {quickFilterConfigs.map(cfg => {
                                                    const counts = facetMap[cfg.field] || [];
                                                    const trueCount = counts.find(c => c.value === cfg.booleanTrueValue);
                                                    if (!trueCount || trueCount.count === 0) return null;
                                                    const isActive = activeFilters[cfg.field]?.has(cfg.booleanTrueValue || 'true');
                                                    return (
                                                        <button
                                                            key={cfg.field}
                                                            onClick={() => toggleFilterValue(cfg.field, cfg.booleanTrueValue || 'true')}
                                                            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${isActive
                                                                ? `bg-primary text-primary-foreground shadow-sm`
                                                                : 'bg-white hover:bg-muted/60 text-foreground border border-border'
                                                                }`}
                                                        >
                                                            {cfg.icon}
                                                            {cfg.booleanLabel || cfg.label}
                                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
                                                                ? 'bg-white/20'
                                                                : 'bg-muted text-muted-foreground'
                                                                }`}>
                                                                {trueCount.count}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Facets Sidebar */}
                                        <div className={`lg:w-72 xl:w-80 flex-shrink-0 border-b lg:border-b-0 lg:border-r border-border bg-muted/60/50 overflow-y-auto ${showMobileFacets ? 'block' : 'hidden lg:block'
                                            }`}
                                        >
                                            {/* Quick Filters (desktop) */}
                                            <div className="hidden lg:block p-4 md:p-5 border-b border-border">
                                                <h3 className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wide">
                                                    <Filter size={14} />
                                                    Szybkie filtry
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {quickFilterConfigs.map(cfg => {
                                                        const counts = facetMap[cfg.field] || [];
                                                        const trueCount = counts.find(c => c.value === cfg.booleanTrueValue);
                                                        if (!trueCount || trueCount.count === 0) return null;
                                                        const isActive = activeFilters[cfg.field]?.has(cfg.booleanTrueValue || 'true');
                                                        return (
                                                            <button
                                                                key={cfg.field}
                                                                onClick={() => toggleFilterValue(cfg.field, cfg.booleanTrueValue || 'true')}
                                                                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition ${isActive
                                                                    ? `bg-primary text-primary-foreground shadow-sm`
                                                                    : 'bg-white hover:bg-muted/60 text-foreground border border-border'
                                                                    }`}
                                                            >
                                                                {cfg.icon}
                                                                {cfg.booleanLabel || cfg.label}
                                                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
                                                                    ? 'bg-white/20'
                                                                    : 'bg-muted text-muted-foreground'
                                                                    }`}>
                                                                    {trueCount.count}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Dynamic Facet Sections */}
                                            {sidebarFacetConfigs.map(cfg => {
                                                const counts = facetMap[cfg.field];
                                                if (!counts || counts.length === 0) return null;
                                                return (
                                                    <FacetSection
                                                        key={cfg.field}
                                                        config={cfg}
                                                        counts={counts}
                                                        activeValues={activeFilters[cfg.field] || new Set()}
                                                        onToggleValue={toggleFilterValue}
                                                    />
                                                );
                                            })}

                                            {/* Clear all button at bottom of sidebar */}
                                            {totalActiveFilters > 0 && (
                                                <div className="p-4 md:p-5 border-t border-border">
                                                    <button
                                                        onClick={clearAllFilters}
                                                        className="w-full py-2.5 px-4 bg-red-50 hover:bg-destructive/10 text-red-600 
                                                                   rounded-xl text-sm font-medium transition flex items-center justify-center gap-2"
                                                    >
                                                        <X size={14} />
                                                        Wyczyść wszystkie filtry ({totalActiveFilters})
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Products Grid */}
                                        <div className="flex-grow p-4 md:p-6">
                                            {/* Results Header */}
                                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                                <div>
                                                    <h2 className="text-lg md:text-xl font-bold text-foreground">
                                                        Produkty
                                                        {activeFilters['categories']?.size === 1 && (
                                                            <span className="text-foreground"> w {[...activeFilters['categories']][0]}</span>
                                                        )}
                                                    </h2>
                                                    <p className="text-sm text-muted-foreground">
                                                        {totalFound} wyników dla &ldquo;{query}&rdquo;
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Products Grid — using ProductItem component */}
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                                                {results.slice(0, 20).map((hit) => (
                                                    <ProductItem
                                                        key={hit.document.id}
                                                        product={mapTypesenseToProduct(hit.document)}
                                                        viewMode="grid"
                                                        loading={false}
                                                    />
                                                ))}
                                            </div>

                                            {/* Show All Results */}
                                            {totalFound > 20 && (
                                                <div className="mt-8 text-center">
                                                    <a
                                                        href={`/search?q=${encodeURIComponent(query)}`}
                                                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r 
                                                                   from-purple-600 to-hert text-white rounded-2xl font-bold 
                                                                   hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                                                    >
                                                        <span>Zobacz wszystkie {totalFound} produktów</span>
                                                        <ArrowRight size={20} />
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ============ FOOTER ============ */}
                            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-border 
                                            px-6 py-3 rounded-b-3xl flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Layers size={14} />
                                    <span>Powered by DevBack.it</span>
                                    {searchTime > 0 && (
                                        <span className="text-muted-foreground/60">• {searchTime}ms</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="hidden md:inline">
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> wybierz
                                    </span>
                                    <span className="hidden md:inline">
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> nawiguj
                                    </span>
                                    <span>
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded">esc</kbd> zamknij
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}