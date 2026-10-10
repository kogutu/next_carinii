// Widżet Google Translate ładujemy dopiero wtedy, gdy klient sam wybierze język inny niż polski (albo wrócił z już wybranym).
// Wcześniej skrypty Google (ok. 100 KB) ładowały się przy każdej wizycie, bez zgody i bez potrzeby.

const ELEMENT_ID = 'google_translate_element'
const SCRIPT_SRC = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
const COMBO_SELECTOR = '.goog-te-combo'
const READY_TIMEOUT_MS = 8000

type TranslateWindow = Window & {
    googleTranslateElementInit?: () => void
    google?: { translate?: { TranslateElement: new (options: Record<string, unknown>, elementId: string) => unknown } }
}

let loading: Promise<void> | null = null

const waitForCombo = (): Promise<void> =>
    new Promise((resolve, reject) => {
        const started = Date.now()
        const timer = setInterval(() => {
            if (document.querySelector(COMBO_SELECTOR)) {
                clearInterval(timer)
                resolve()
            } else if (Date.now() - started > READY_TIMEOUT_MS) {
                clearInterval(timer)
                reject(new Error('Google Translate nie załadował się'))
            }
        }, 100)
    })

/** Ładuje widżet raz; rozwiązuje się, gdy lista języków (select.goog-te-combo) jest gotowa. */
export const loadGoogleTranslate = (): Promise<void> => {
    if (loading) return loading

    const w = window as TranslateWindow
    loading = new Promise<void>((resolve, reject) => {
        w.googleTranslateElementInit = () => {
            const TranslateElement = w.google?.translate?.TranslateElement
            if (!TranslateElement) {
                reject(new Error('Brak Google Translate'))
                return
            }
            new TranslateElement({ pageLanguage: 'pl', includedLanguages: 'pl,en,de', autoDisplay: false }, ELEMENT_ID)
            waitForCombo().then(resolve, reject)
        }

        const script = document.createElement('script')
        script.async = true
        script.src = SCRIPT_SRC
        script.onerror = () => reject(new Error('Nie udało się pobrać Google Translate'))
        document.head.appendChild(script)
    }).catch((error) => {
        loading = null // kolejna próba ma szansę się udać
        throw error
    })

    return loading
}

/** Przełącza stronę na wskazany język (kod Google, np. 'en'); ładuje widżet, jeśli trzeba. */
export const translateTo = async (googleCode: string): Promise<void> => {
    await loadGoogleTranslate()
    // widżet podpina obsługę zmiany języka chwilę po utworzeniu listy — bez tego pierwsze przełączenie bywa ignorowane
    await new Promise((resolve) => setTimeout(resolve, 400))
    const combo = document.querySelector<HTMLSelectElement>(COMBO_SELECTOR)
    if (!combo) return
    combo.value = googleCode
    combo.dispatchEvent(new Event('change', { bubbles: true }))
}
