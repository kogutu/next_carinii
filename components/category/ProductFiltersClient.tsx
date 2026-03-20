'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
    ChevronDown,
    ChevronUp,
    X,
    SlidersHorizontal,
    ArrowUpDown,
    Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import type { ProcessedFacet, SortOption } from './types';
import { decodeFiltersFromUrl, useCategoryZustand } from '@/stores/categoryZustand';
import _ from 'lodash';

// ─── Config ──────────────────────────────────────────────────────────
const DEFAULT_VISIBLE_COUNT = 5;

// ─── Props ───────────────────────────────────────────────────────────
interface ProductFiltersClientProps {
    facets: ProcessedFacet[];
    sortOptions: readonly SortOption[];
    className?: string;
}
const hideCounters = false;
// =====================================================================
// MAIN CLIENT COMPONENT
// =====================================================================
export function ProductFiltersClient({
    facets,
    sortOptions,
    className,
}: ProductFiltersClientProps) {
    // ── Zustand selectors ──────────────────────────────────────────────
    const setFilterZustand = useCategoryZustand(state => state.setFilters);
    const setRangePriceZustand = useCategoryZustand(state => state.setPriceRange);
    const setSortZustand = useCategoryZustand(state => state.setSort);
    const selectedFiltersZustand = useCategoryZustand(state => state.selectedFiltersURL);

    // ── Local state ────────────────────────────────────────────────────
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(selectedFiltersZustand?.filters ?? {});
    const [priceRange, setPriceRange] = useState<Record<string, [number, number]>>({});
    const [currentSort, setCurrentSort] = useState<string>(sortOptions[0].value);

    // ── Drawer open state ──────────────────────────────────────────────
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

    // ── Guard against sync loops ───────────────────────────────────────
    const isSyncingFromUrl = useRef(false);


    // ── Helpers ────────────────────────────────────────────────────────
    const toggleFilter = useCallback((fieldName: string, value: string) => {
        setSelectedFilters((prev) => {
            const current = prev[fieldName] || [];
            const next = current.includes(value)
                ? current.filter((v) => v !== value)
                : [...current, value];
            return { ...prev, [fieldName]: next };
        });
    }, []);

    const clearFieldFilter = useCallback((fieldName: string) => {
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
    }, []);

    // ── Sync FROM URL → local state ────────────────────────────────────
    useEffect(() => {
        const restored = decodeFiltersFromUrl(window?.location?.search);

        isSyncingFromUrl.current = true;
        setSelectedFilters(restored.filters ?? {});
        setPriceRange(restored.priceRange ?? {});
        // Reset guard after React processes the state updates
        requestAnimationFrame(() => {
            isSyncingFromUrl.current = false;
        });
    }, [selectedFiltersZustand]);

    // ── Sync local state → Zustand ─────────────────────────────────────
    useEffect(() => {
        if (isSyncingFromUrl.current) return;
        setFilterZustand(selectedFilters);
    }, [selectedFilters, setFilterZustand]);

    useEffect(() => {
        if (isSyncingFromUrl.current) return;
        if (_.isEmpty(priceRange)) return;
        setRangePriceZustand(priceRange);
    }, [priceRange, setRangePriceZustand]);

    useEffect(() => {
        if (_.isEmpty(currentSort) || currentSort === 'relevance') return;
        setSortZustand(currentSort);
    }, [currentSort, setSortZustand]);

    const clearAllFilters = useCallback(() => {
        setSelectedFilters({});
        setFilterZustand({});
        setPriceRange({});
        setRangePriceZustand({});
    }, [setFilterZustand, setRangePriceZustand]);

    const activeCount = useMemo(() => {
        const checkboxCount = Object.values(selectedFilters).reduce(
            (sum, arr) => sum + arr.length,
            0
        );
        const rangeCount = Object.keys(priceRange).length;
        return checkboxCount + rangeCount;
    }, [selectedFilters, priceRange]);

    const currentSortLabel = useMemo(
        () => sortOptions.find((s) => s.value === currentSort)?.label ?? sortOptions[0].label,
        [currentSort, sortOptions]
    );

    // ── Shared facet list renderer ─────────────────────────────────────
    const renderFacetList = () => (
        <>
            <div className="mb-2 flex items-center justify-between px-1 min-h-[16px]">
                {activeCount > 0 && (
                    <>
                        <span className="text-xs text-gray-500">
                            Aktywne filtry: {activeCount}
                        </span>
                        <button
                            onClick={clearAllFilters}
                            className="text-xs font-medium text-gray-600 underline underline-offset-2 transition-colors hover:text-black"
                        >
                            Wyczyść wszystko
                        </button>
                    </>
                )}
            </div>

            {facets.map((facet) => {
                if (facet.typ === 'price')
                    return (
                        <PriceRangeFacetSection
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
                    );

                if (facet.typ === 'numeric')
                    return (
                        <NumericChipFacetSection
                            key={facet.field_name}
                            facet={facet}
                            selected={selectedFilters[facet.field_name] || []}
                            onToggle={(value) => toggleFilter(facet.field_name, value)}
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    );

                if (facet.typ === 'color') {
                    return (
                        <ColorsFacetSection
                            key={facet.field_name}
                            facet={facet}
                            selected={selectedFilters[facet.field_name] || []}
                            onToggle={(value) => toggleFilter(facet.field_name, value)}
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    );
                }

                if (facet.typ === 'size')
                    return (
                        <SizesFacetSection
                            key={facet.field_name}
                            facet={facet}
                            selected={selectedFilters[facet.field_name] || []}
                            onToggle={(value) => toggleFilter(facet.field_name, value)}
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    );

                if (facet.typ === 'boolean')
                    return (
                        <BooleanFacetSection
                            key={facet.field_name}
                            facet={facet}
                            selected={selectedFilters[facet.field_name] || []}
                            onToggle={(value) => toggleFilter(facet.field_name, value)}
                            onClear={() => clearFieldFilter(facet.field_name)}
                        />
                    );

                return (
                    <CheckboxFacetSection
                        key={facet.field_name}
                        facet={facet}
                        selected={selectedFilters[facet.field_name] || []}
                        onToggle={(value) => toggleFilter(facet.field_name, value)}
                        onClear={() => clearFieldFilter(facet.field_name)}
                    />
                );
            })}
        </>
    );

    return (
        <>
            {/* ════════════════════════════════════════════════════════════
                DESKTOP SIDEBAR — normalny widok
            ════════════════════════════════════════════════════════════ */}
            <aside className={cn('hidden w-full md:block', className)}>
                <div className="flex flex-col gap-1">{renderFacetList()}</div>
            </aside>

            {/* ════════════════════════════════════════════════════════════
                MOBILE FIXED BOTTOM BAR — Sort | Filtruj
            ════════════════════════════════════════════════════════════ */}
            <div className="fixed inset-x-0 bottom-0 z-40 flex border-t border-gray-200 bg-white lg:hidden">
                {/* Sort button */}
                <button
                    onClick={() => setSortDrawerOpen(true)}
                    className="flex flex-1 items-center justify-center gap-2 border-r border-gray-200 py-3.5 text-sm font-medium text-gray-800 active:bg-gray-50"
                >
                    <ArrowUpDown className="h-4 w-4" />
                    <span className="truncate">{currentSortLabel}</span>
                </button>

                {/* Filter button */}
                <button
                    onClick={() => setDrawerOpen(true)}
                    className="flex flex-1 items-center justify-center gap-2 py-3.5 text-sm font-medium text-gray-800 active:bg-gray-50"
                >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filtruj
                    {activeCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-semibold text-white">
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            {/* ════════════════════════════════════════════════════════════
                SORT DRAWER
            ════════════════════════════════════════════════════════════ */}
            <Drawer open={sortDrawerOpen} onOpenChange={setSortDrawerOpen}>
                <DrawerContent>
                    <DrawerHeader className="text-left">
                        <DrawerTitle>Sortowanie</DrawerTitle>
                        <DrawerDescription className="sr-only">
                            Wybierz sposób sortowania produktów
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="flex flex-col px-1 pb-2">
                        {sortOptions.map((option) => {
                            const isActive = currentSort === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setCurrentSort(option.value);
                                        setSortDrawerOpen(false);
                                    }}
                                    className={cn(
                                        'flex items-center justify-between rounded-lg px-4 py-3.5 text-sm transition-colors',
                                        isActive
                                            ? 'bg-gray-50 font-semibold text-black'
                                            : 'text-gray-700 active:bg-gray-50'
                                    )}
                                >
                                    {option.label}
                                    {isActive && <Check className="h-4 w-4" />}
                                </button>
                            );
                        })}
                    </div>

                    <DrawerFooter className="pt-0">
                        <DrawerClose asChild>
                            <Button variant="outline" className="w-full">
                                Zamknij
                            </Button>
                        </DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {/* ════════════════════════════════════════════════════════════
                FILTER DRAWER
            ════════════════════════════════════════════════════════════ */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="max-h-[92vh]">
                    <DrawerHeader className="border-b border-gray-100 text-left">
                        <DrawerTitle className="flex items-center gap-2">
                            Filtry
                            {activeCount > 0 && (
                                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-[11px] font-bold text-white">
                                    {activeCount}
                                </span>
                            )}
                        </DrawerTitle>
                        <DrawerDescription className="sr-only">
                            Filtruj produkty według wybranych kryteriów
                        </DrawerDescription>
                    </DrawerHeader>

                    {/* Scrollable facet list */}
                    <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
                        {renderFacetList()}
                    </div>

                    {/* Fixed footer — Pokaż wyniki */}
                    <DrawerFooter className="border-t border-gray-100">
                        <DrawerClose asChild>
                            <Button className="w-full" size="lg">
                                Pokaż wyniki
                                {activeCount > 0 && ` (${activeCount})`}
                            </Button>
                        </DrawerClose>
                        {activeCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-gray-500"
                                onClick={clearAllFilters}
                            >
                                Wyczyść wszystkie filtry
                            </Button>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </>
    );
}

// =====================================================================
// FACET SECTION PROPS (shared)
// =====================================================================
interface FacetSectionProps {
    facet: ProcessedFacet;
    selected: string[];
    onToggle: (value: string) => void;
    onClear: () => void;
}

// =====================================================================
// COLLAPSIBLE HEADER (shared)
// =====================================================================
function FacetHeader({
    label,
    badgeCount,
    open,
    onToggle,
}: {
    label: string;
    badgeCount?: number;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="flex w-full items-center justify-between text-left"
        >
            <span className="text-[13px] font-semibold uppercase tracking-wide text-gray-800">
                {label}
                {(badgeCount ?? 0) > 0 && (
                    <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                        {badgeCount}
                    </span>
                )}
            </span>
            {open ? (
                <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
            ) : (
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
            )}
        </button>
    );
}

// =====================================================================
// CLEAR BUTTON (shared)
// =====================================================================
function ClearFacetButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="self-start flex items-center gap-1 px-1 text-xs text-gray-500 transition-colors hover:text-black"
        >
            <X className="h-3 w-3" />
            Wyczyść
        </button>
    );
}

// =====================================================================
// SHOW MORE / LESS (shared)
// =====================================================================
function ShowMoreButton({
    showAll,
    totalCount,
    onToggle,
}: {
    showAll: boolean;
    totalCount: number;
    onToggle: () => void;
}) {
    return (
        <button
            onClick={onToggle}
            className="self-start px-1 text-xs font-medium text-gray-500 transition-colors hover:text-black"
        >
            {showAll ? 'Pokaż mniej' : `Pokaż wszystkie (${totalCount})`}
        </button>
    );
}

// =====================================================================
// NUMERIC CHIP FACET
// =====================================================================
function NumericChipFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: FacetSectionProps) {
    const [open, setOpen] = useState(facet.open);
    const [showAll, setShowAll] = useState(false);

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;

    const formatValue = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num)) return val;
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
    };

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={selected.length}
                open={open}
                onToggle={() => setOpen(!open)}
            />

            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {visibleCounts.map(({ value, count }) => {
                            const isSelected = selected.includes(value);
                            return (
                                <button
                                    key={value}
                                    onClick={() => onToggle(value)}
                                    className={cn(
                                        'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-all',
                                        isSelected
                                            ? 'bg-black text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    )}
                                >
                                    <span>
                                        {formatValue(value)}
                                        {facet.suffix ?? ''}
                                    </span>
                                    {!hideCounters && (
                                        <span
                                            className={cn(
                                                'tabular-nums text-[10px]',
                                                isSelected ? 'text-gray-300' : 'text-gray-400'
                                            )}
                                        >
                                            ({count})
                                        </span>
                                    )}
                                    {isSelected && <X className="ml-0.5 h-3 w-3" />}
                                </button>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <ShowMoreButton
                            showAll={showAll}
                            totalCount={facet.counts.length}
                            onToggle={() => setShowAll(!showAll)}
                        />
                    )}

                    {selected.length > 0 && <ClearFacetButton onClick={onClear} />}
                </div>
            )}
        </div>
    );
}

// =====================================================================
// COLORS FACET (chips)
// =====================================================================
function ColorsFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: FacetSectionProps) {
    const [open, setOpen] = useState(facet.open);
    const [showAll, setShowAll] = useState(false);

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > 20;

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={selected.length}
                open={open}
                onToggle={() => setOpen(!open)}
            />

            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {visibleCounts.map(({ value, color }) => {
                            const isSelected = selected.includes(value);
                            return (
                                <button
                                    title={value}
                                    key={value}
                                    onClick={() => onToggle(value)}
                                    className={cn(
                                        'inline-flex cursor-pointer items-center  rounded-full w-[38px] h-[38px] text-center justify-center text-xs font-medium transition-all',
                                        isSelected ? 'text-white shadow-sm' : 'text-gray-700'
                                    )}
                                    style={{
                                        background: color,
                                    }}
                                >
                                    {isSelected && <X className=" h-4 w-4" />}
                                </button>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <ShowMoreButton
                            showAll={showAll}
                            totalCount={facet.counts.length}
                            onToggle={() => setShowAll(!showAll)}
                        />
                    )}

                    {selected.length > 0 && <ClearFacetButton onClick={onClear} />}
                </div>
            )}
        </div>
    );
}

// =====================================================================
// SIZE FACET (chips)
// =====================================================================
function SizesFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: FacetSectionProps) {
    const [open, setOpen] = useState(facet.open);
    const [showAll, setShowAll] = useState(false);

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={selected.length}
                open={open}
                onToggle={() => setOpen(!open)}
            />

            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {visibleCounts.map(({ value }) => {
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
                                    <span>{value}{facet.suffix ?? ''}</span>
                                    {isSelected && <X className="ml-0.5 h-3 w-3" />}
                                </button>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <ShowMoreButton
                            showAll={showAll}
                            totalCount={facet.counts.length}
                            onToggle={() => setShowAll(!showAll)}
                        />
                    )}

                    {selected.length > 0 && <ClearFacetButton onClick={onClear} />}
                </div>
            )}
        </div>
    );
}

// =====================================================================
// BOOLEAN FACET (TAK/NIE chips)
// =====================================================================
function BooleanFacetSection({
    facet,
    selected,
    onToggle,
    onClear,
}: FacetSectionProps) {
    const [open, setOpen] = useState(facet.open);

    const replaceBoolean = (val: string) => {
        if (val === '1' || val === 'true') return 'TAK';
        if (val === '0' || val === 'false') return 'NIE';
        return val;
    };

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={selected.length}
                open={open}
                onToggle={() => setOpen(!open)}
            />

            {open && (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {facet.counts.map(({ value }) => {
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
                                    <span>{replaceBoolean(value)}{facet.suffix ?? ''}</span>
                                    {isSelected && <X className="ml-0.5 h-3 w-3" />}
                                </button>
                            );
                        })}
                    </div>

                    {selected.length > 0 && <ClearFacetButton onClick={onClear} />}
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
}: FacetSectionProps) {
    const [open, setOpen] = useState(facet.open);
    const [showAll, setShowAll] = useState(false);

    const visibleCounts = showAll
        ? facet.counts
        : facet.counts.slice(0, DEFAULT_VISIBLE_COUNT);
    const hasMore = facet.counts.length > DEFAULT_VISIBLE_COUNT;

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={selected.length}
                open={open}
                onToggle={() => setOpen(!open)}
            />

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
                                {!hideCounters && (<span className="text-xs tabular-nums text-gray-400">
                                    {count}
                                </span>
                                )}
                            </label>
                        );
                    })}

                    {hasMore && (
                        <ShowMoreButton
                            showAll={showAll}
                            totalCount={facet.counts.length}
                            onToggle={() => setShowAll(!showAll)}
                        />
                    )}

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
// PRICE RANGE FACET (dual slider)
// =====================================================================
interface PriceRangeFacetSectionProps {
    facet: ProcessedFacet;
    range?: [number, number];
    onRangeChange: (range: [number, number]) => void;
    onClear: () => void;
}

function PriceRangeFacetSection({
    facet,
    range,
    onRangeChange,
    onClear,
}: PriceRangeFacetSectionProps) {
    const [open, setOpen] = useState(facet.open);

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

    const minPercent = ((currentMin - min) / (max - min)) * 100;
    const maxPercent = ((currentMax - min) / (max - min)) * 100;

    return (
        <div className="border-b border-gray-100 py-3 last:border-b-0">
            <FacetHeader
                label={facet.label}
                badgeCount={isActive ? 1 : 0}
                open={open}
                onToggle={() => setOpen(!open)}
            />

            {open && (
                <div className="mt-3 px-1.5">
                    {/* Dual range slider */}
                    <div className="relative h-6">
                        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-gray-200" />
                        <div
                            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-black"
                            style={{
                                left: `${minPercent}%`,
                                width: `${maxPercent - minPercent}%`,
                            }}
                        />

                        <input
                            type="range"
                            min={min}
                            max={max}
                            step={1}
                            value={currentMin}
                            onChange={(e) => handleMinChange(Number(e.target.value))}
                            className="pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-black [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-black [&::-webkit-slider-thumb]:bg-white"
                        />

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

                    {/* Price distribution bars */}
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

                    {isActive && (
                        <div className="mt-2">
                            <ClearFacetButton onClick={onClear} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}