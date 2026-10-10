// Prosty limiter zapytań w pamięci procesu (okno przesuwne). Na Vercelu każda instancja ma własną pamięć,
// więc to ochrona „best effort” przed zalewaniem endpointów, a nie twardy limit.

const hits = new Map<string, number[]>()
const MAX_TRACKED_KEYS = 5000

/** true = żądanie dozwolone; false = limit przekroczony. */
export const allowRequest = (key: string, limit: number, windowMs: number): boolean => {
    const now = Date.now()
    const recent = (hits.get(key) ?? []).filter((time) => now - time < windowMs)

    if (recent.length >= limit) {
        hits.set(key, recent)
        return false
    }

    recent.push(now)
    hits.set(key, recent)

    // pamięć pod kontrolą: przy nadmiarze kluczy usuwamy najstarsze
    if (hits.size > MAX_TRACKED_KEYS) {
        const oldest = hits.keys().next().value
        if (oldest !== undefined) hits.delete(oldest)
    }
    return true
}

export const clientIpFrom = (headers: Headers): string =>
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'unknown'
