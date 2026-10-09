const ORDER_PREFIX = 'CAR'

// Bez 0/O i 1/I/L, żeby numer dało się bezbłędnie przeczytać przez telefon
const ORDER_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

const warsawDate = (date: Date): string => {
    const parts = new Intl.DateTimeFormat('pl-PL', {
        timeZone: 'Europe/Warsaw',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(date)
    const pick = (type: string) => parts.find((part) => part.type === type)?.value ?? '00'
    return `${pick('year')}${pick('month')}${pick('day')}`
}

const randomSuffix = (length: number): string => {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => ORDER_ALPHABET[byte % ORDER_ALPHABET.length]).join('')
}

/** Numer zamówienia w formacie CAR-RRMMDD-XXXXXX (np. CAR-261009-7K3QXM). */
export const generateOrderNumber = (now: Date = new Date()): string =>
    `${ORDER_PREFIX}-${warsawDate(now)}-${randomSuffix(6)}`
