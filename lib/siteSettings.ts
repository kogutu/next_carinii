import { randomUUID } from 'node:crypto'
import { unstable_cache } from 'next/cache'
import { pool } from '@/lib/db-mysql'
import { DEFAULT_PROMO_CONFIG, normalizePromoConfig, type PromoConfig } from '@/lib/promoConfig'

// Ustawienia sklepu edytowane w panelu /admin, zapisane w MySQL (tabela site_settings: nazwa -> JSON).
// Vercel nie ma zapisywalnego dysku, więc plik nie wchodzi w grę, a baza już jest używana przez ulubione i zgody.

const PROMO_KEY = 'promo_config'

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

/** Konfiguracja promocji prosto z bazy (bez cache). Brak wpisu albo błąd bazy = domyślna, czyli „nic nie pokazuj”. */
export const loadPromoConfig = async (): Promise<PromoConfig> => {
    try {
        const raw = await readSetting(PROMO_KEY)
        return raw ? normalizePromoConfig(JSON.parse(raw), makeId) : DEFAULT_PROMO_CONFIG
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
    return config
}
