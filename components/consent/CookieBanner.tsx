'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { COOKIE_SETTINGS_EVENT, readCookieChoice, saveCookieChoice, type CookieChoice } from '@/lib/cookieConsent'

const BUTTON =
    'inline-flex h-11 items-center justify-center rounded-xl px-3 text-sm sm:px-5 font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100'
// Zaakceptowanie i odrzucenie mają ten sam rozmiar i wagę — odmowa ma być równie łatwa jak zgoda
const ACCEPT = cn(BUTTON, 'bg-primary text-primary-foreground hover:bg-menuhover')
const REJECT = cn(BUTTON, 'border border-foreground bg-background text-foreground hover:bg-muted')
const LINK = 'underline underline-offset-4 hover:text-foreground'

const ACCEPT_ALL: CookieChoice = { analytics: true, marketing: true }
const REJECT_OPTIONAL: CookieChoice = { analytics: false, marketing: false }

type ToggleProps = {
    id: string
    label: string
    checked: boolean
    disabled?: boolean
    onChange?: (value: boolean) => void
}

// Prosty przełącznik (button role="switch"): nie potrzebuje dodatkowej biblioteki
function Toggle({ id, label, checked, disabled, onChange }: ToggleProps) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
                'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
                checked ? 'bg-primary' : 'bg-input',
            )}
        >
            <span
                aria-hidden="true"
                className={cn('pointer-events-none block size-5 rounded-full bg-background shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')}
            />
        </button>
    )
}

type CategoryRowProps = {
    id: string
    title: string
    description: string
    checked: boolean
    disabled?: boolean
    onChange?: (value: boolean) => void
}

function CategoryRow({ id, title, description, checked, disabled, onChange }: CategoryRowProps) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-border p-4">
            <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="mt-1 text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <Toggle id={id} label={title} checked={checked} disabled={disabled} onChange={onChange} />
        </div>
    )
}

// Baner zgody na cookies + okno ustawień (otwierane też z linku w stopce). Zgoda jest dobrowolna i szczegółowa:
// niezbędne działają zawsze, analityczne i marketingowe — tylko po zaznaczeniu.
export default function CookieBanner() {
    // null = jeszcze nie sprawdzono (SSR), false = wybór już jest, true = baner widoczny
    const [bannerVisible, setBannerVisible] = useState<boolean | null>(null)
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [draft, setDraft] = useState<CookieChoice>(REJECT_OPTIONAL)

    useEffect(() => {
        setBannerVisible(readCookieChoice() === null)

        const openSettings = () => {
            setDraft(readCookieChoice() ?? REJECT_OPTIONAL)
            setSettingsOpen(true)
        }
        window.addEventListener(COOKIE_SETTINGS_EVENT, openSettings)
        return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, openSettings)
    }, [])

    const decide = (choice: CookieChoice) => {
        saveCookieChoice(choice)
        setBannerVisible(false)
        setSettingsOpen(false)
    }

    return (
        <>
            {bannerVisible && !settingsOpen && (
                <section
                    role="region"
                    aria-label="Zgoda na pliki cookies"
                    className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4"
                >
                    <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-border bg-background p-4 shadow-[0_8px_30px_rgba(0,0,0,0.18)] sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                        <p className="text-pretty text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            <span className="font-semibold text-foreground">Szanujemy Twoją prywatność.</span> Niezbędne pliki cookies
                            sprawiają, że sklep działa. Za Twoją zgodą używamy też cookies analitycznych i marketingowych (Google, Meta),
                            aby ulepszać sklep i pokazywać trafniejsze reklamy. Wybór możesz zmienić w stopce.{' '}
                            <Link href="/polityka-prywatnosci" className={LINK}>
                                Polityka prywatności
                            </Link>
                            .
                        </p>
                        <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:w-52 sm:flex-col">
                            <button type="button" className={ACCEPT} onClick={() => decide(ACCEPT_ALL)}>
                                Akceptuję wszystkie
                            </button>
                            <button type="button" className={REJECT} onClick={() => decide(REJECT_OPTIONAL)}>
                                Tylko niezbędne
                            </button>
                            <button
                                type="button"
                                className="col-span-2 h-9 text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:col-span-1"
                                onClick={() => {
                                    setDraft(REJECT_OPTIONAL)
                                    setSettingsOpen(true)
                                }}
                            >
                                Dostosuj
                            </button>
                        </div>
                    </div>
                </section>
            )}

            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-balance text-xl font-semibold tracking-tight">Ustawienia cookies</DialogTitle>
                        <DialogDescription className="text-pretty">
                            Zdecyduj, z jakich plików cookies możemy korzystać. Zgodę możesz w każdej chwili zmienić lub wycofać.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <CategoryRow
                            id="cookies-necessary"
                            title="Niezbędne"
                            description="Koszyk, logowanie, bezpieczeństwo płatności i zapamiętanie tego wyboru. Bez nich sklep nie działa, dlatego są zawsze włączone."
                            checked
                            disabled
                        />
                        <CategoryRow
                            id="cookies-analytics"
                            title="Analityczne"
                            description="Google Analytics: anonimowe statystyki odwiedzin i korzystania ze sklepu, dzięki którym poprawiamy jego działanie."
                            checked={draft.analytics}
                            onChange={(value) => setDraft((current) => ({ ...current, analytics: value }))}
                        />
                        <CategoryRow
                            id="cookies-marketing"
                            title="Marketingowe"
                            description="Google Ads i Meta (Facebook, Instagram): mierzenie skuteczności reklam i pokazywanie ich osobom zainteresowanym naszą ofertą."
                            checked={draft.marketing}
                            onChange={(value) => setDraft((current) => ({ ...current, marketing: value }))}
                        />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row-reverse">
                        <button type="button" className={cn(ACCEPT, 'sm:flex-1')} onClick={() => decide(draft)}>
                            Zapisz wybór
                        </button>
                        <button type="button" className={cn(REJECT, 'sm:flex-1')} onClick={() => decide(REJECT_OPTIONAL)}>
                            Tylko niezbędne
                        </button>
                    </div>
                    <button type="button" className={cn(ACCEPT, 'w-full')} onClick={() => decide(ACCEPT_ALL)}>
                        Akceptuję wszystkie
                    </button>
                    <p className="text-pretty text-xs text-muted-foreground">
                        Szczegóły w{' '}
                        <Link href="/polityka-prywatnosci" className={LINK}>
                            polityce prywatności
                        </Link>
                        .
                    </p>
                </DialogContent>
            </Dialog>
        </>
    )
}
