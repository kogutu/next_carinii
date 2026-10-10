// Filtry liczbowe z jednostką (grubość podeszwy, wysokość obcasa...) mają w danych różne zapisy tej samej liczby:
// „7 cm”, „7cm”, „7”, „7 cm ” (spacja na końcu), „5,5 cm” i „5.5 cm”. Typesense liczy każdy zapis osobno,
// więc w filtrze powstawały zdublowane chipy. Tu scalamy je po wartości liczbowej.

type FacetCountLike = {
    value: string
    count: number
}

export type GroupedFacetCount<T extends FacetCountLike> = T & {
    // wszystkie oryginalne zapisy z danych — filtr po chipie obejmuje każdy z nich
    values: string[]
}

/** „5,5 cm” → 5.5, „7cm” → 7, „abc” → null. Przecinek i kropka są separatorem dziesiętnym. */
export const parseFacetNumber = (raw: string): number | null => {
    const match = raw.replace(',', '.').match(/-?\d+(?:\.\d+)?/)
    return match ? parseFloat(match[0]) : null
}

/** 7 → „7”, 5.5 → „5,5” (polski zapis dziesiętny). */
export const formatFacetNumber = (value: number): string =>
    Number.isInteger(value) ? String(value) : String(Math.round(value * 10) / 10).replace('.', ',')

/** Scala wartości o tej samej liczbie (sumuje liczności) i sortuje rosnąco; wartości bez liczby zostają osobno. */
export const groupNumericFacetCounts = <T extends FacetCountLike>(counts: T[]): GroupedFacetCount<T>[] => {
    const groups = new Map<string, { number: number | null; entry: GroupedFacetCount<T> }>()

    for (const item of counts) {
        const number = parseFacetNumber(item.value)
        const key = number === null ? `text:${item.value.trim()}` : `num:${number}`
        const existing = groups.get(key)

        if (existing) {
            existing.entry.count += item.count
            existing.entry.values.push(item.value)
        } else {
            groups.set(key, { number, entry: { ...item, values: [item.value] } })
        }
    }

    return [...groups.values()]
        .sort((a, b) => (a.number ?? Infinity) - (b.number ?? Infinity))
        .map(({ entry }) => entry)
}
