import { SKU_PATTERN, normalizeSku, normalizeSkuTiers, type SkuTier } from '@/lib/promoConfig'

// Przetwarzanie kodu ze starego sklepu, np.
//   var p40 = ["B10743-O17-000-000-MO1", ...];  var p30 = [...];  var p = 20;
// Nazwa listy to rabat (p40 = -40%), a „var p = 20” to rabat podstawowy dla reszty produktów. Reszta kodu jest pomijana.

export type ParsedSkuList = {
    name: string
    percent: number
    // wpisy na liście (z powtórzeniami) i unikalne SKU
    entries: number
    unique: number
    invalid: number
}

export type ParsedSkuLists = {
    tiers: SkuTier[]
    lists: ParsedSkuList[]
    defaultPercent: number | null
    skuCount: number
    // SKU, które były na kilku listach z różnym rabatem — obowiązuje niższy
    conflicts: string[]
}

const stripComments = (code: string): string => code.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/(^|[^:])\/\/[^\n]*/g, '$1')

const LIST_PATTERN = /(?:^|[^\w$.])(?:var|let|const)?\s*p(\d{1,2})\s*=\s*\[([\s\S]*?)\]/g
const DEFAULT_PERCENT_PATTERN = /(?:^|[^\w$.])(?:var|let)\s+p\s*=\s*(\d{1,2})\s*;/
const STRING_PATTERN = /["'`]([^"'`]*)["'`]/g

export const parseSkuLists = (input: string): ParsedSkuLists => {
    const code = stripComments(input)

    const lists: ParsedSkuList[] = []
    const rawTiers: SkuTier[] = []
    const percentBySku = new Map<string, number>()
    const conflicts = new Set<string>()

    for (const match of code.matchAll(LIST_PATTERN)) {
        const percent = Number(match[1])
        if (percent < 1 || percent > 99) continue

        const seen = new Set<string>()
        let entries = 0
        let invalid = 0
        for (const item of match[2].matchAll(STRING_PATTERN)) {
            entries++
            const sku = normalizeSku(item[1])
            if (!SKU_PATTERN.test(sku)) {
                invalid++
                continue
            }
            seen.add(sku)
            const known = percentBySku.get(sku)
            if (known !== undefined && known !== percent) conflicts.add(sku)
            percentBySku.set(sku, known === undefined ? percent : Math.min(known, percent))
        }

        lists.push({ name: `p${match[1]}`, percent, entries, unique: seen.size, invalid })
        rawTiers.push({ percent, skus: [...seen] })
    }

    const defaultMatch = DEFAULT_PERCENT_PATTERN.exec(code)
    const defaultPercent = defaultMatch && Number(defaultMatch[1]) >= 1 && Number(defaultMatch[1]) <= 99 ? Number(defaultMatch[1]) : null

    // ta sama normalizacja co przy zapisie: bez powtórzeń, niższy rabat wygrywa, ograniczenie liczby SKU
    const tiers = normalizeSkuTiers(rawTiers)
    return { tiers, lists, defaultPercent, skuCount: tiers.reduce((sum, tier) => sum + tier.skus.length, 0), conflicts: [...conflicts] }
}

/** Listy z powrotem jako kod (do podglądu i kopiowania), np. `var p40 = [...]`. */
export const formatSkuLists = (tiers: SkuTier[]): string =>
    tiers.map((tier) => `var p${tier.percent} = [\n${tier.skus.map((sku) => `    "${sku}"`).join(',\n')}\n];`).join('\n\n')
