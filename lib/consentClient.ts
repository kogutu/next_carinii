import type { ConsentRecord } from '@/lib/consents'

const OPT_IN_KEY = 'carinii_marketing_optin'

/** Czy klient o tym adresie e-mail zaznaczył zgodę marketingową w ostatnim formularzu (zapamiętane lokalnie). */
export const readMarketingOptIn = (email: string): boolean => {
    try {
        const stored = JSON.parse(window.localStorage.getItem(OPT_IN_KEY) ?? 'null') as { email?: string; marketing?: boolean } | null
        return Boolean(stored?.marketing) && stored?.email === email.trim().toLowerCase()
    } catch {
        return false
    }
}

/**
 * Zapisuje zgodę w rejestrze (POST /api/consents). Wywoływane po udanym wysłaniu formularza i celowo nie
 * przerywa jego obsługi — błąd rejestru nie może zablokować zamówienia, zwrotu czy zapisu ulubionych.
 */
export const recordConsent = (record: ConsentRecord): void => {
    if (record.email) {
        try {
            window.localStorage.setItem(OPT_IN_KEY, JSON.stringify({ email: record.email.trim().toLowerCase(), marketing: record.marketing }))
        } catch {
            // bez storage nie zapamiętamy — status subskrybenta zostanie wtedy niezaznaczony
        }
    }
    fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        keepalive: true,
    }).catch((error) => console.error('[consents]', error))
}
