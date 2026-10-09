// Wspólne helpery Google Pay JS (przeglądarka) — ładowanie skryptu i dostęp do API.
// window.google jest już typowany przez starszy przycisk P24, więc czytamy go bez własnej deklaracji.

const GOOGLE_PAY_SCRIPT = 'https://pay.google.com/gp/p/js/pay.js'

export const BASE_REQUEST = { apiVersion: 2, apiVersionMinor: 0 } as const

export const googleApi = (): any => (window as any).google

export const loadGooglePayScript = (): Promise<void> =>
    new Promise((resolve, reject) => {
        if (googleApi()?.payments?.api) return resolve()

        const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_PAY_SCRIPT}"]`)
        const script = existing ?? Object.assign(document.createElement('script'), { src: GOOGLE_PAY_SCRIPT, async: true })
        script.addEventListener('load', () => resolve())
        script.addEventListener('error', () => reject(new Error('Nie udało się załadować Google Pay')))
        if (!existing) document.head.appendChild(script)
    })

// Token do bramek przekazujemy zakodowany w base64 (UTF-8 bezpiecznie)
export const toBase64 = (value: string): string => {
    const bytes = new TextEncoder().encode(value)
    return btoa(String.fromCharCode(...bytes))
}

// zamknięcie okna Google Pay przez klienta to nie błąd
export const isGooglePayCanceled = (error: unknown): boolean =>
    (error as { statusCode?: string })?.statusCode === 'CANCELED'
