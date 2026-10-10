import type { ConsentRecord } from '@/lib/consents'

/**
 * Zapisuje zgodę w rejestrze (POST /api/consents). Wywoływane po udanym wysłaniu formularza i celowo nie
 * przerywa jego obsługi — błąd rejestru nie może zablokować zamówienia, zwrotu czy zapisu ulubionych.
 */
export const recordConsent = (record: ConsentRecord): void => {
    fetch('/api/consents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
        keepalive: true,
    }).catch((error) => console.error('[consents]', error))
}
