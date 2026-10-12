import { randomUUID } from 'node:crypto'
import { unstable_cache } from 'next/cache'
import { pool } from '@/lib/db-mysql'
import { DEFAULT_PROMO_CONFIG, normalizePromoConfig, type PromoConfig } from '@/lib/promoConfig'

// Ustawienia sklepu edytowane w panelu /admin, zapisane w MySQL (tabela site_settings: nazwa -> JSON).
// Vercel nie ma zapisywalnego dysku, więc plik nie wchodzi w grę, a baza już jest używana przez ulubione i zgody.

// Nazwa wpisu w bazie. Lokalny serwer deweloperski używa tej samej bazy co produkcja, więc w .env.local ustawiamy
// PROMO_CONFIG_KEY=promo_config_local — testy w panelu nie pokazują się wtedy na żywym sklepie.
const PROMO_KEY = process.env.PROMO_CONFIG_KEY || 'promo_config'

let tableReady: Promise<void> | null = null

const ensureTable = (): Promise<void> => {
    if (!tableReady) {
        tableReady = pool
            .query(
                `CREATE TABLE IF NOT EXISTS site_settings (
                    name VARCHAR(60) NOT NULL PRIMARY KEY,
                    value MEDIUMTEXT NOT NULL,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

const makeId = (): string => randomUUID().replace(/-/g, '').slice(0, 12)

const readSetting = async (name: string): Promise<string | null> => {
    await ensureTable()
    const [rows] = await pool.query('SELECT value FROM site_settings WHERE name = ?', [name])
    const row = (rows as { value: string }[])[0]
    return row ? row.value : null
}

const writeSetting = async (name: string, value: string): Promise<void> => {
    await ensureTable()
    await pool.query('INSERT INTO site_settings (name, value) VALUES (?, ?) ON DUPLICATE KEY UPDATE value = VALUES(value)', [name, value])
}

// Odczyt bazy nie może spowalniać renderu strony: po tym czasie bierzemy konfigurację domyślną
const READ_TIMEOUT_MS = 4000

const withTimeout = <T,>(promise: Promise<T>): Promise<T> =>
    Promise.race([promise, new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout odczytu ustawień')), READ_TIMEOUT_MS))])

/** Odczyt z bazy, który zgłasza błąd bazy (zamiast podstawiać wartość domyślną) — dla odświeżania w przeglądarce. */
export const readPromoConfigStrict = async (): Promise<PromoConfig> => {
    const raw = await withTimeout(readSetting(PROMO_KEY))
    return raw ? normalizePromoConfig(JSON.parse(raw), makeId) : DEFAULT_PROMO_CONFIG
}

// Krótka pamięć w obrębie instancji serwera: chroni bazę przed zapytaniem przy każdym odświeżeniu w przeglądarce,
// a zapis w panelu czyści ją od razu
const MEMO_MS = 5000
let memo: { at: number; config: PromoConfig } | null = null

/** Najświeższa konfiguracja (maks. kilka sekund starsza niż baza). Błąd bazy = wyjątek. */
export const getFreshPromoConfig = async (): Promise<PromoConfig> => {
    if (memo && Date.now() - memo.at < MEMO_MS) return memo.config
    const config = await readPromoConfigStrict()
    memo = { at: Date.now(), config }
    return config
}

/** Konfiguracja promocji prosto z bazy (bez cache). Brak wpisu, błąd lub timeout bazy = domyślna, czyli „nic nie pokazuj”. */
export const loadPromoConfig = async (): Promise<PromoConfig> => {
    // Podczas budowania strony (Vercel) nie sięgamy do bazy: setki stron statycznych czekałyby na połączenie, a baza
    // może nie przyjmować połączeń z maszyny budującej. Konfiguracja z panelu pojawia się po pierwszym odświeżeniu (ISR).
    if (process.env.NEXT_PHASE === 'phase-production-build') return DEFAULT_PROMO_CONFIG

    try {
        return await readPromoConfigStrict()
    } catch (error) {
        console.error('[site_settings] odczyt promocji nie powiódł się:', error)
        return DEFAULT_PROMO_CONFIG
    }
}

// Strona nie odpytuje bazy przy każdym wejściu: konfiguracja jest cache'owana na minutę, a zapis w panelu
// odświeża strony od razu (revalidatePath w trasie zapisu)
export const getPromoConfig = unstable_cache(loadPromoConfig, ['promo-config'], { revalidate: 60, tags: ['promo'] })

/** Zapis z panelu: najpierw walidacja i czyszczenie, potem baza. Zwraca to, co faktycznie zapisano. */
export const savePromoConfig = async (input: unknown): Promise<PromoConfig> => {
    const config = normalizePromoConfig(input, makeId)
    await writeSetting(PROMO_KEY, JSON.stringify(config))
    memo = { at: Date.now(), config }
    return config
}
