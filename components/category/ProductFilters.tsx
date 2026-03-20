import { Facet } from './types';
import { ProductFiltersClient } from './ProductFiltersClient';
import _ from 'lodash';

// ─── Config: Kolejność i etykiety facetów ────────────────────────────
const facets_order_label: Record<string, { label: string; typ: string; suffix: string | null; prefix: string | null; open: boolean }> = {
    "price": { label: 'Cena', typ: 'price', suffix: null, prefix: null, open: true },
    "sizes": { label: 'Rozmiary', typ: 'size', suffix: null, prefix: null, open: true },
    "typ": { label: 'Typ buta', typ: 'numeric', suffix: null, prefix: null, open: true },
    "kolor": { label: 'Kolor', typ: 'color', suffix: null, prefix: null, open: true },

    "materiał": { label: 'Materiał', typ: 'string', suffix: null, prefix: null, open: false },
    "podeszwa materiał": { label: 'Materiał podeszwy', typ: 'string', suffix: null, prefix: null, open: false },
    "rodzaj podeszwy": { label: 'Rodzaj podeszwy', typ: 'string', suffix: null, prefix: null, open: false },
    "grubość podeszwy": { label: 'Grubość podeszwy', typ: 'numeric', suffix: ' cm', prefix: null, open: false },
    "wysokość obcasa": { label: 'Wysokość obcasa', typ: 'numeric', suffix: ' cm', prefix: null, open: false },
    "materiał obcasa": { label: 'Materiał obcasa', typ: 'string', suffix: null, prefix: null, open: false },
    "cholewka": { label: 'Materiał cholewki', typ: 'string', suffix: null, prefix: null, open: false },
    "wkładka": { label: 'Wkładka', typ: 'string', suffix: null, prefix: null, open: false },
    "wnętrze": { label: 'Materiał wewnętrzny', typ: 'string', suffix: null, prefix: null, open: false },
    "ocieplenie": { label: 'Ocieplenie', typ: 'string', suffix: null, prefix: null, open: false },
    "tęgość": { label: 'Tęgość', typ: 'string', suffix: null, prefix: null, open: false },
    "wysokość całkowita buta": { label: 'Wysokość buta', typ: 'numeric', suffix: ' cm', prefix: null, open: false },
    "ukryty klin": { label: 'Ukryty klin', typ: 'boolean', suffix: ' cm', prefix: null, open: false },
    "cat_main": { label: 'Kategoria', typ: 'string', suffix: null, prefix: null, open: false },
    "new": { label: 'Nowość', typ: 'boolean', suffix: null, prefix: null, open: false },
    "has_special_price": { label: 'Promocja', typ: 'boolean', suffix: null, prefix: null, open: false }
};

const colors = {
    "czarny": "linear-gradient(135deg, #2C2C2C, #000000)",
    "brązowy": "linear-gradient(135deg, #A0522D, #8B4513, #5D3A1A)",
    "beżowy": "linear-gradient(135deg, #FFF8E7, #F5F5DC, #E8D8C0)",
    "biały": "linear-gradient(135deg, #FFFFFF, #F0F0F0, #E0E0E0)",
    "bordowy": "linear-gradient(135deg, #9B2C2C, #800000, #660000)",
    "zielony": "linear-gradient(135deg, #32CD32, #008000, #006400)",
    "czerwony": "linear-gradient(135deg, #FF6346, #FF0000, #B22222)",
    "złoty": "linear-gradient(135deg, #FFD700, #FFC800, #DAA520)",
    "różowy": "linear-gradient(135deg, #FFB6C1, #FF69B4, #FF1493)",
    "niebieski": "linear-gradient(135deg, #4169E1, #0000FF, #00008B)",
    "rudy": "linear-gradient(135deg, #FF7F4D, #FF5733, #E64D2E)",
    "srebrny": "linear-gradient(135deg, #F0F0F0, #C0C0C0, #A0A0A0)",
    "żółty": "linear-gradient(135deg, #FFFF99, #FFFF00, #FFD700)",
    "granatowy": "linear-gradient(135deg, #4169E1, #191970, #000080)",
    "fioletowy": "linear-gradient(135deg, #9370DB, #800080, #4B0082)",
    "cappuccino": "linear-gradient(135deg, #D2691E, #8B4513, #6B4423)",
    "pomarańczowy": "linear-gradient(135deg, #FFA500, #FF8C00, #FF7F00)",
    "szary": "linear-gradient(135deg, #B0B0B0, #808080, #505050)",
    "kolorowy": "linear-gradient(135deg, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #8F00FF)",
    "musztardowy": "linear-gradient(135deg, #FFDB58, #E6B800, #CC9C00)"
}
// ─── Sort options ────────────────────────────────────────────────────
export const SORT_OPTIONS = [
    { value: 'relevance', label: 'Wg nowości' },
    { value: 'price_asc', label: 'Cena: od najniższej' },
    { value: 'price_desc', label: 'Cena: od najwyższej' },
    { value: 'newest', label: 'Najnowsze' },
    { value: 'bestsellers', label: 'Bestsellery' },
] as const;


// =====================================================================
// SERVER COMPONENT — przetwarza facety na serwerze
// =====================================================================
interface ProductFiltersProps {
    filters_facets: Facet[];
    className?: string;
}

export function ProductFilters({ filters_facets, className }: ProductFiltersProps) {
    // Przetwarzanie facetów po stronie serwera — zero JS, zero czekania
    const processedFacets = [];
    for (const key in facets_order_label) {
        for (const facet of filters_facets) {
            if (facet.field_name === key) {
                if (key == "kolor") {
                    facet.counts.forEach((e: any, i: number) => {

                        facet.counts[i]['color'] = colors[e.value];
                    })
                }
                processedFacets.push({
                    ...facet,
                    ...facets_order_label[key],
                });
            }
        }
    }

    // Sortowanie rozmiarów po stronie serwera
    const sortedFacets = processedFacets.map((facet) => {
        if (facet.typ === 'size') {
            return {
                ...facet,
                counts: _.sortBy(facet.counts, (c) => parseFloat(c.value) || c.value),
            };
        }
        if (facet.typ === 'numeric') {
            return {
                ...facet,
                counts: _.sortBy(facet.counts, (c) => parseFloat(c.value)),
            };
        }
        return facet;
    });

    return (
        <ProductFiltersClient
            facets={sortedFacets}
            sortOptions={SORT_OPTIONS}
            className={className}
        />
    );
}
