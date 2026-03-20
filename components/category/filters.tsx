'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import _ from 'lodash';

// ─── Typesense Facet Types ───────────────────────────────────────────
interface FacetCount {
    count: number;
    highlighted: string;
    value: string;
}

interface FacetStats {
    avg?: number;
    max?: number;
    min?: number;
    sum?: number;
    total_values: number;
}

interface Facet {
    counts: FacetCount[];
    label: string;
    suffix: string;
    prefix: string;
    field_name: string;
    sampled: boolean;
    stats: FacetStats;
}

// ─── Config: Które facety to numeryczne (range slider) ───────────────
const NUMERIC_FACETS = ['price'];
//order is important
const facets_order_label: any = {
    "price": { label: 'Cena', typ: 'range', suffix: null, prefix: null },
    "sizes": { label: 'Rozmiary', typ: 'size', suffix: null, prefix: null },
    "kolor": { label: 'Kolor', typ: 'string', suffix: null, prefix: null },
    "materiał": { label: 'Materiał', typ: 'string', suffix: null, prefix: null },
    "podeszwa materiał": { label: 'Materiał podeszwy', typ: 'string', suffix: null, prefix: null },
    "rodzaj podeszwy": { label: 'Rodzaj podeszwy', typ: 'string', suffix: null, prefix: null },
    "grubość podeszwy": { label: 'Grubość podeszwy', typ: 'string', suffix: null, prefix: null },
    "wysokość obcasa": { label: 'Wysokość obcasa', typ: 'string', suffix: null, prefix: null },
    "materiał obcasa": { label: 'Materiał obcasa', typ: 'string', suffix: null, prefix: null },
    "cholewka": { label: 'Materiał cholewki', typ: 'string', suffix: null, prefix: null },
    "wkładka": { label: 'Wkładka', typ: 'string', suffix: null, prefix: null },
    "wnętrze": { label: 'Materiał wewnętrzny', typ: 'string', suffix: null, prefix: null },
    "ocieplenie": { label: 'Ocieplenie', typ: 'string', suffix: null, prefix: null },
    "tęgość": { label: 'Tęgość', typ: 'string', suffix: null, prefix: null },
    "wysokość całkowita buta": { label: 'Wysokość buta', typ: 'string', suffix: null, prefix: null },
    "ukryty klin": { label: 'Ukryty klin', typ: 'boolean', suffix: " cm", prefix: null },
    "typ": { label: 'Typ buta', typ: 'string', suffix: null, prefix: null },
    "cat_main": { label: 'Kategoria', typ: 'string', suffix: null, prefix: null },
    "new": { label: 'Nowość', typ: 'boolean', suffix: null, prefix: null },
    "has_special_price": { label: 'Promocja', typ: 'boolean', suffix: null, prefix: null }
}

// ─── Config: Czytelne nazwy pól ──────────────────────────────────────
const FACET_LABELS: Record<string, string> = {
    categories: 'Kategorie',
    price: 'Cena',
    special_price: 'Cena promocyjna',
    'podeszwa materiał': 'Materiał podeszwy',
    has_special_price: 'Promocja',
    cat_main: 'Kolekcja',
    color: 'Kolor',
    size: 'Rozmiar',
};

// ─── Config: Ile pokazywać domyślnie przed "Pokaż więcej" ───────────
const DEFAULT_VISIBLE_COUNT = 5;

// ─── Props ───────────────────────────────────────────────────────────
interface ProductFiltersProps {
    filters_facets: Facet[];
    className?: string;
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================
export function ProductFilters({ filters_facets, className }: ProductFiltersProps) {
    // ── TODO: Zustand ──────────────────────────────────────────────────
    // Podłącz swój zustand store tutaj, np.:
    //
    // const selectedFilters = useCategoryZustand((s) => s.selectedFilters);
    // const setSelectedFilters = useCategoryZustand((s) => s.setSelectedFilters);
    // const priceRange = useCategoryZustand((s) => s.priceRange);
    // const setPriceRange = useCategoryZustand((s) => s.setPriceRange);
    // const clearAllFilters = useCategoryZustand((s) => s.clearAllFilters);
    //
    // Poniżej tymczasowy local state jako placeholder:
    // ──────────────────────────────────────────────────────────────────


    const [facets, setFacets] = useState<Facet[]>([]); // Poprawiona inicjalizacja

    useEffect(() => {
        // console.log('Received facets:', filters_facets);

        var facets_after_sort: any = [];
        for (let key in facets_order_label) {
            filters_facets.forEach(e => {
                if (e.field_name == key) facets_after_sort.push({ ...e, ...facets_order_label[key] })
            })
        }



        // // Filtruj i dodaj etykiety
        // const processedFacets = filters_facets
        //     .filter(facet => facets_order_label[facet.field_name]) // Tylko te z etykietami
        //     .map(facet => ({
        //         ...facet,
        //         ...facets_order_label[facet.field_name] // Dodaj etykietę
        //     }));

        // console.log('Processed facets:', facets_after_sort);
        setFacets(facets_after_sort);
    }, [filters_facets]); // Dodaj _facets jako zależność
    const [selectedFilters, setSelectedFilters] = useState<
        Record<string, string[]>
    >({});
    const [priceRange, setPriceRange] = useState<Record<string, [number, number]>>(
        {}
    );

    // ── Helpers ────────────────────────────────────────────────────────

    const toggleFilter = (fieldName: string, value: string) => {
        setSelectedFilters((prev) => {
            const current = prev[fieldName] || [];
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [fieldName]: next };
        });
    };

    const clearFieldFilter = (fieldName: string) => {
        setSelectedFilters((prev) => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
        setPriceRange((prev) => {
            const next = { ...prev };
            delete next[fieldName];
            return next;
        });
    };

    const clearAllFiltersLocal = () => {
        setSelectedFilters({});
        setPriceRange({});
    };

    const activeCount = useMemo(() => {
        const checkboxCount = Object.values(selectedFilters).reduce(
            (sum, arr) => sum + arr.length,
            0
        );
        const rangeCount = Object.keys(priceRange).length;
        return checkboxCount + rangeCount;
    }, [selectedFilters, priceRange]);

    // ── Mobile toggle ──────────────────────────────────────────────────
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <aside className={cn('w-full', className)}>
            {/* ── Mobile trigger ──────────────────────────────────────────── */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 lg:hidden"
            >
                <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtry
                    {activeCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-semibold text-white">
                            {activeCount}
                        </span>
                    )}
                </span>
                {mobileOpen ? (
                    <ChevronUp className="h-4 w-4" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </button>

            {/* ── Filter panel ────────────────────────────────────────────── */}
            <div
                className={cn(
                    'mt-2 flex-col gap-1 lg:mt-0 lg:flex',
                    mobileOpen ? 'flex' : 'hidden lg:flex'
                )}
            >
                {/* ── Clear all ───────────────────────────────────────────── */}
                {activeCount > 0 && (
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                            Aktywne filtry: {activeCount}
                        </span>
                        <button
                            onClick={clearAllFiltersLocal}
                            className="text-xs font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-black"
                        >
                            Wyczyść wszystko
                        </button>
                    </div>
                )}

                {/* ── Facet sections ──────────────────────────────────────── */}
                {facets.map((facet: any) => {
                    //price

                    if (facet.typ == "range")
                        return <NumericFacetSection
                            key={facet.field_name}
                            facet={facet}
                            range={priceRange[facet.field_name]}
                            onRangeChange={(range) =>
                                setPriceRange((prev) => ({
                                    ...prev,
                                    [facet.field_name]: range,
                                }))
                            }
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    if (facet.typ == "size") return <SizesFacetSection
                        key={facet.field_name}
                        facet={facet}
                        selected={selectedFilters[facet.field_name] || []}
                        onToggle={(value) => toggleFilter(facet.field_name, value)}
                        onClear={() => clearFieldFilter(facet.field_name)} />

                    if (facet.typ == "boolean")
                        return <BooleanFacetSection
                            key={facet.field_name}
                            facet={facet}
                            selected={selectedFilters[facet.field_name] || []}
                            onToggle={(value) => toggleFilter(facet.field_name, value)}
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    return <CheckboxFacetSection
                        key={facet.field_name}
                        facet={facet}
                        selected={selectedFilters[facet.field_name] || []}
                        onToggle={(value) => toggleFilter(facet.field_name, value)}
                        onClear={() => clearFieldFilter(facet.field_name)}
                    />

                })}
            </div>
        </aside>
    );
}


function SizesFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: CheckboxFacetSectionProps) {
    const [open, setOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const label = facet.label;

    facet.counts = _.sortBy(facet.counts, 'value');
    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;
    const replaceSizes = function (val: any) {
        if (val == 1 || val === "true") return "TAK";
        if (val == 0 || val === "false") return "NIE";
        return val;
    }
    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
                    {label}
                    {selected.length > 0 && (
                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                            {selected.length}
                        </span>
                    )}
                </span>
                {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
            </button>


            {/* Content */}
            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    {/* Chip buttons grid */}
                    <div className="flex flex-wrap gap-1.5">
                        {visibleCounts.map(({ value, count }) => {
                            const isSelected = selected.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => onToggle(value)}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                                        isSelected
                                            ? 'bg-black text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    )}
                                >
                                    <span>{replaceSizes(value)} {facet.suffix}</span>
                                    {/* <span className={cn(
                                        'tabular-nums',
                                        isSelected ? 'text-gray-300' : 'text-gray-500'
                                    )}>
                                        {count}
                                    </span> */}
                                    {isSelected && (
                                        <X className="h-3 w-3 ml-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Show more / less */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="self-start px-1 text-xs font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            {showAll
                                ? 'Pokaż mniej'
                                : `Pokaż wszystkie (${facet.counts.length})`}
                        </button>
                    )}

                    {/* Clear this facet */}
                    {selected.length > 0 && (
                        <button
                            onClick={onClear}
                            className="self-start flex items-center gap-1 px-1 text-xs text-gray-500 transition-colors hover:text-black"
                        >
                            <X className="h-3 w-3" />
                            Wyczyść
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
interface CheckboxFacetSectionProps {
    facet: Facet;
    selected: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
}
// =====================================================================
// Booleqan FACET (categories, color, etc.)
// =====================================================================
function BooleanFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: CheckboxFacetSectionProps) {
    const [open, setOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const label = facet.label;

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;
    const replaceBoolean = function (val: any) {
        if (val == 1 || val === "true") return "TAK";
        if (val == 0 || val === "false") return "NIE";
        return val;
    }
    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
                    {label}
                    {selected.length > 0 && (
                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                            {selected.length}
                        </span>
                    )}
                </span>
                {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
            </button>


            {/* Content */}
            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    {/* Chip buttons grid */}
                    <div className="flex flex-wrap gap-1.5">
                        {visibleCounts.map(({ value, count }) => {
                            const isSelected = selected.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => onToggle(value)}
                                    className={cn(
                                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                                        isSelected
                                            ? 'bg-black text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    )}
                                >
                                    <span>{replaceBoolean(value)} {facet.suffix}</span>
                                    {/* <span className={cn(
                                        'tabular-nums',
                                        isSelected ? 'text-gray-300' : 'text-gray-500'
                                    )}>
                                        {count}
                                    </span> */}
                                    {isSelected && (
                                        <X className="h-3 w-3 ml-0.5" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Show more / less */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="self-start px-1 text-xs font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            {showAll
                                ? 'Pokaż mniej'
                                : `Pokaż wszystkie (${facet.counts.length})`}
                        </button>
                    )}

                    {/* Clear this facet */}
                    {selected.length > 0 && (
                        <button
                            onClick={onClear}
                            className="self-start flex items-center gap-1 px-1 text-xs text-gray-500 transition-colors hover:text-black"
                        >
                            <X className="h-3 w-3" />
                            Wyczyść
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
// =====================================================================
// CHECKBOX FACET (categories, color, etc.)
// =====================================================================


function CheckboxFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: CheckboxFacetSectionProps) {
    const [open, setOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const label = facet.label;

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;


    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
                    {label}
                    {selected.length > 0 && (
                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                            {selected.length}
                        </span>
                    )}
                </span>
                {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {open && (
                <div className="mt-2 flex flex-col gap-0.5">
                    {visibleCounts.map(({ value, count }) => {
                        const isSelected = selected.includes(value);
                        return (
                            <label
                                key={value}
                                className={cn(
                                    'group flex cursor-pointer items-center gap-2.5 rounded-md px-1.5 py-1.5 text-sm transition-colors hover:bg-gray-50',
                                    isSelected && 'bg-gray-50'
                                )}
                            >
                                {/* Custom checkbox */}
                                <span
                                    className={cn(
                                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                                        isSelected
                                            ? 'border-black bg-black'
                                            : 'border-gray-300 bg-white group-hover:border-gray-400'
                                    )}
                                >
                                    {isSelected && (
                                        <svg
                                            className="h-2.5 w-2.5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    )}
                                </span>

                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={isSelected}
                                    onChange={() => onToggle(value)}
                                />

                                <span className="flex-1 truncate text-gray-700">{value}</span>
                                <span className="text-xs tabular-nums text-gray-400">
                                    {count}
                                </span>
                            </label>
                        );
                    })}

                    {/* Show more / less */}
                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="mt-1 px-1.5 text-left text-xs font-medium text-gray-500 transition-colors hover:text-black"
                        >
                            {showAll
                                ? 'Pokaż mniej'
                                : `Pokaż wszystkie (${facet.counts.length})`}
                        </button>
                    )}

                    {/* Clear this facet */}
                    {selected.length > 0 && (
                        <button
                            onClick={onClear}
                            className="mt-1 flex items-center gap-1 px-1.5 text-xs text-gray-500 transition-colors hover:text-black"
                        >
                            <X className="h-3 w-3" />
                            Wyczyść
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// =====================================================================
// NUMERIC / RANGE FACET (price)
// =====================================================================
interface NumericFacetSectionProps {
    facet: Facet;
    range?: [number, number];
    onRangeChange: (range: [number, number]) => void;
    onClear: () => void;
}

function NumericFacetSection({
    facet,
    range,
    onRangeChange,
    onClear,
}: NumericFacetSectionProps) {
    const [open, setOpen] = useState(true);
    const label = FACET_LABELS[facet.field_name] || facet.field_name;

    const min = facet.stats.min ?? 0;
    const max = facet.stats.max ?? 1000;

    const currentMin = range?.[0] ?? min;
    const currentMax = range?.[1] ?? max;
    const isActive = range !== undefined;

    const handleMinChange = (val: number) => {
        onRangeChange([Math.min(val, currentMax), currentMax]);
    };

    const handleMaxChange = (val: number) => {
        onRangeChange([currentMin, Math.max(val, currentMin)]);
    };

    // Percentage positions for visual track fill
    const minPercent = ((currentMin - min) / (max - min)) * 100;
    const maxPercent = ((currentMax - min) / (max - min)) * 100;

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            {/* Header */}
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between text-left"
            >
                <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
                    {label}
                    {isActive && (
                        <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                            ✓
                        </span>
                    )}
                </span>
                {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                )}
            </button>

            {/* Content */}
            {open && (
                <div className="mt-3 px-1.5">
                    {/* Dual range slider */}
                    <div className="relative h-6">
                        {/* Track background */}
                        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />
                        {/* Active track */}
                        <div
                            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-black"
                            style={{
                                left: `${minPercent}%`,
                                width: `${maxPercent - minPercent}%`,
                            }}
                        />

                        {/* Min thumb */}
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={1}
                            value={currentMin}
                            onChange={(e) => handleMinChange(Number(e.target.value))}
                            className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
                        />

                        {/* Max thumb */}
                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={1}
                            value={currentMax}
                            onChange={(e) => handleMaxChange(Number(e.target.value))}
                            className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
                        />
                    </div>

                    {/* Min / Max inputs */}
                    <div className="mt-2 flex items-center gap-2">
                        <div className="flex-1">
                            <input
                                type="number"
                                min={min}
                                max={max}
                                value={currentMin}
                                onChange={(e) => handleMinChange(Number(e.target.value))}
                                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-center text-sm tabular-nums text-gray-700 outline-none transition-colors focus:border-black"
                            />
                        </div>
                        <span className="text-xs text-gray-400">—</span>
                        <div className="flex-1">
                            <input
                                type="number"
                                min={min}
                                max={max}
                                value={currentMax}
                                onChange={(e) => handleMaxChange(Number(e.target.value))}
                                className="w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-center text-sm tabular-nums text-gray-700 outline-none transition-colors focus:border-black"
                            />
                        </div>
                        <span className="text-xs text-gray-500">zł</span>
                    </div>

                    {/* Price distribution bars (optional visual) */}
                    {facet.counts.length > 1 && (
                        <div className="mt-3 flex items-end gap-px" style={{ height: 32 }}>
                            {facet.counts.map(({ value, count }) => {
                                const maxCount = Math.max(
                                    ...facet.counts.map((c) => c.count)
                                );
                                const heightPercent = (count / maxCount) * 100;
                                const numVal = parseFloat(value);
                                const inRange = numVal >= currentMin && numVal <= currentMax;
                                return (
                                    <div
                                        key={value}
                                        className={cn(
                                            'flex-1 rounded-sm transition-colors',
                                            inRange ? 'bg-black/70' : 'bg-gray-200'
                                        )}
                                        style={{ height: `${Math.max(heightPercent, 8)}%` }}
                                        title={`${value} zł (${count})`}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {/* Clear */}
                    {isActive && (
                        <button
                            onClick={onClear}
                            className="mt-2 flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-black"
                        >
                            <X className="h-3 w-3" />
                            Wyczyść
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}