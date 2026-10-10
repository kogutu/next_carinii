import { pool } from '@/lib/db-mysql'
import { auth } from '@/lib/auth'

// Lista ulubionych zalogowanego klienta w MySQL (osobna tabela wishlist_items).
// Konto jest skojarzone z adresem e-mail z sesji (zawsze po stronie serwera — nigdy z treści żądania).

export type WishlistEntry = {
    // sku produktu (model + kolor) — klucz listy; karty na listingach nie mają id produktu, ale zawsze mają sku
    sku: string
    slug: string
    // czas dodania, ms od 1970 (UTC)
    addedAt: number
}

export const MAX_WISHLIST_ITEMS = 300

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SKU_PATTERN = /^[A-Za-z0-9._-]{1,100}$/

let tableReady: Promise<void> | null = null

// Tabela tworzy się przy pierwszym użyciu (CREATE TABLE IF NOT EXISTS) — bez osobnej migracji
const ensureTable = (): Promise<void> => {
    if (!tableReady) {
        tableReady = pool
            .query(
                `CREATE TABLE IF NOT EXISTS wishlist_items (
                    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NOT NULL,
                    sku VARCHAR(100) NOT NULL,
                    slug VARCHAR(255) NOT NULL DEFAULT '',
                    added_at BIGINT UNSIGNED NOT NULL,
                    UNIQUE KEY uq_email_sku (email, sku),
                    KEY idx_email (email)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
            )
            .then(() => undefined)
            .catch((error) => {
                tableReady = null
                throw error
            })
    }
    return tableReady
}

export const getSessionEmail = async (): Promise<string | null> => {
    const session = await auth()
    const email = session?.user?.email?.trim().toLowerCase()
    return email && EMAIL_PATTERN.test(email) ? email : null
}

/** Wpis z żądania -> poprawny wpis albo null (sku tylko ze znaków kodu produktu; slug jest obcinany). */
export const sanitizeEntry = (raw: unknown): WishlistEntry | null => {
    if (!raw || typeof raw !== 'object') return null
    const { sku, slug, addedAt } = raw as Record<string, unknown>

    const code = String(sku ?? '')
    if (!SKU_PATTERN.test(code)) return null

    const added = Number(addedAt)
    return {
        sku: code,
        slug: String(slug ?? '').slice(0, 255),
        addedAt: Number.isFinite(added) && added > 0 && added <= Date.now() + 60_000 ? Math.floor(added) : Date.now(),
    }
}

export const listWishlist = async (email: string): Promise<WishlistEntry[]> => {
    await ensureTable()
    const [rows] = await pool.execute(
        `SELECT sku, slug, added_at FROM wishlist_items WHERE email = ? ORDER BY added_at DESC, id DESC LIMIT ${MAX_WISHLIST_ITEMS}`,
        [email],
    )
    return (rows as any[]).map((row) => ({
        sku: String(row.sku),
        slug: String(row.slug),
        addedAt: Number(row.added_at),
    }))
}

/** Dodaje wpisy (powtórzenia ignorowane). Zwraca false, gdy lista przekroczyłaby limit. */
export const addToWishlist = async (email: string, entries: WishlistEntry[]): Promise<boolean> => {
    if (entries.length === 0) return true
    await ensureTable()

    const [[{ total }]] = (await pool.execute('SELECT COUNT(*) AS total FROM wishlist_items WHERE email = ?', [email])) as any
    if (Number(total) + entries.length > MAX_WISHLIST_ITEMS) {
        // sync może przysłać produkty, które już są — limit liczymy po uwzględnieniu duplikatów
        const existing = await listWishlist(email)
        const known = new Set(existing.map((entry) => entry.sku))
        if (existing.length + entries.filter((entry) => !known.has(entry.sku)).length > MAX_WISHLIST_ITEMS) return false
    }

    const rows = entries.map((entry) => [email, entry.sku, entry.slug, entry.addedAt])
    await pool.query('INSERT IGNORE INTO wishlist_items (email, sku, slug, added_at) VALUES ?', [rows])
    return true
}

export const removeFromWishlist = async (email: string, sku: string): Promise<void> => {
    await ensureTable()
    await pool.execute('DELETE FROM wishlist_items WHERE email = ? AND sku = ?', [email, sku])
}

export const isValidSku = (value: string): boolean => SKU_PATTERN.test(value)
