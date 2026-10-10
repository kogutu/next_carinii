// Wybór klienta w sprawie cookies i śledzenia. Zapisujemy go lokalnie (localStorage) — bez danych osobowych —
// i rozgłaszamy zdarzeniem, żeby warstwa analityczna ładowała skrypty dopiero po zgodzie.
// Zmieniając kategorie lub opisy w banerze, podnieś COOKIE_CONSENT_VERSION: wszyscy zostaną zapytani ponownie.

export const COOKIE_CONSENT_VERSION = 1

const STORAGE_KEY = 'carinii_cookie_consent'

export const COOKIE_CONSENT_EVENT = 'carinii:cookie-consent'
export const COOKIE_SETTINGS_EVENT = 'carinii:cookie-settings'

// „Niezbędne” (koszyk, logowanie, zapamiętany wybór) działają zawsze i nie wymagają zgody
export type CookieChoice = {
    // pomiar ruchu i zachowań (Google Analytics)
    analytics: boolean
    // reklamy i remarketing (Google Ads, Meta)
    marketing: boolean
}

type StoredChoice = CookieChoice & { v: number; ts: number }

export const readCookieChoice = (): CookieChoice | null => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (!raw) return null

        const stored = JSON.parse(raw) as Partial<StoredChoice>
        if (stored.v !== COOKIE_CONSENT_VERSION) return null
        return { analytics: stored.analytics === true, marketing: stored.marketing === true }
    } catch {
        return null
    }
}

export const saveCookieChoice = (choice: CookieChoice): void => {
    const stored: StoredChoice = { ...choice, v: COOKIE_CONSENT_VERSION, ts: Date.now() }
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
        // tryb prywatny / zablokowany storage: wybór obowiązuje do końca wizyty (zdarzenie poniżej)
    }
    window.dispatchEvent(new CustomEvent<CookieChoice>(COOKIE_CONSENT_EVENT, { detail: choice }))
}

/** Otwiera okno ustawień cookies (np. z linku w stopce). */
export const openCookieSettings = (): void => {
    window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))
}
