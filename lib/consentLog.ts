import { pool } from '@/lib/db-mysql'
import { CONSENT_SOURCES, CONSENT_VERSION, type ConsentRecord } from '@/lib/consents'

// Rejestr zgód (MySQL, tabela consent_log): dowód, kiedy, w jakim formularzu i na jaką wersję treści klient się zgodził.
// Tylko dopisywanie — wycofanie zgody marketingowej to kolejny wpis z marketing = 0 (obowiązuje najnowszy).

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_CONTEXT_LENGTH = 1000

let tableReady: Promise<void> | null = null

const ensureTable = (): Promise<void> => {
    if (!tableReady) {
        tableReady = pool
            .query(
                `CREATE TABLE IF NOT EXISTS consent_log (
                    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) NULL,
                    phone VARCHAR(32) NULL,
                    source VARCHAR(40) NOT NULL,
                    terms_accepted TINYINT(1) NOT NULL DEFAULT 0,
                    marketing_accepted TINYINT(1) NOT NULL DEFAULT 0,
                    consent_version VARCHAR(20) NOT NULL,
                    context VARCHAR(${MAX_CONTEXT_LENGTH}) NULL,
                    user_agent VARCHAR(255) NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    KEY idx_email (email, created_at),
                    KEY idx_phone (phone),
                    KEY idx_source (source, created_at)
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

const cleanEmail = (raw: unknown): string | null => {
    if (typeof raw !== 'string') return null
    const email = raw.trim().toLowerCase()
    return email.length <= 255 && EMAIL_PATTERN.test(email) ? email : null
}

// Telefon: same cyfry (z opcjonalnym kierunkowym), 9–15 znaków
const cleanPhone = (raw: unknown): string | null => {
    if (typeof raw !== 'string') return null
    const digits = raw.replace(/\D/g, '')
    return digits.length >= 9 && digits.length <= 15 ? digits : null
}

const cleanContext = (raw: unknown): string | null => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
    const entries = Object.entries(raw as Record<string, unknown>)
        .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
        .slice(0, 10)
        .map(([key, value]) => [key.slice(0, 40), typeof value === 'string' ? value.slice(0, 120) : value])
    if (entries.length === 0) return null
    return JSON.stringify(Object.fromEntries(entries)).slice(0, MAX_CONTEXT_LENGTH)
}

export type ParsedConsent = Required<Pick<ConsentRecord, 'source' | 'terms' | 'marketing'>> & {
    email: string | null
    phone: string | null
    context: string | null
}

/** Ciało żądania -> poprawny wpis albo null (nieznane źródło, brak e-maila i telefonu). */
export const parseConsent = (body: unknown): ParsedConsent | null => {
    if (!body || typeof body !== 'object') return null
    const input = body as Record<string, unknown>

    const source = CONSENT_SOURCES.find((candidate) => candidate === input.source)
    const email = cleanEmail(input.email)
    const phone = cleanPhone(input.phone)
    if (!source || (!email && !phone)) return null

    return {
        source,
        email,
        phone,
        terms: input.terms === true,
        marketing: input.marketing === true,
        context: cleanContext(input.context),
    }
}

export const saveConsent = async (consent: ParsedConsent, userAgent: string | null): Promise<void> => {
    await ensureTable()
    await pool.query(
        `INSERT INTO consent_log (email, phone, source, terms_accepted, marketing_accepted, consent_version, context, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            consent.email,
            consent.phone,
            consent.source,
            consent.terms ? 1 : 0,
            consent.marketing ? 1 : 0,
            CONSENT_VERSION,
            consent.context,
            userAgent ? userAgent.slice(0, 255) : null,
        ],
    )
}
