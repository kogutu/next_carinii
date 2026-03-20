// ─── Typesense Facet Types ───────────────────────────────────────────
export interface FacetCount {
    count: number;
    color: string;
    highlighted: string;
    value: string;
}

export interface FacetStats {
    avg?: number;
    max?: number;
    min?: number;
    sum?: number;
    total_values: number;
}

export interface Facet {
    counts: FacetCount[];
    label: string;
    suffix: string | null;
    prefix: string | null;
    field_name: string;
    sampled: boolean;
    stats: FacetStats;
}

export interface ProcessedFacet extends Facet {
    typ: string;
    open: boolean
    color: string
}

export interface SortOption {
    value: string;
    label: string;
}
