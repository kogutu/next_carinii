'use client'

import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import { ENTER, EYEBROW, SURFACE_CARD } from '@/components/ui/surface'
import { cn } from '@/lib/utils'

const LINKS = [
    { href: '/nowosci.html', title: 'Nowości', description: 'To się będzie nosić' },
    { href: '/torebki.html', title: 'Torebki', description: 'Nie samymi butami człowiek żyje :)' },
    { href: '/kontakt', title: 'Kontakt', description: 'Skontaktuj się z nami' },
    { href: '/kontakt', title: 'Pomoc', description: 'Pytania o zamówienie i dostawę' },
]

const BUTTON =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100'

export default function NotFound() {
    return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center bg-background px-4 py-16">
            <div className={cn(ENTER, 'w-full max-w-2xl text-center')}>
                <p className={EYEBROW}>Błąd 404</p>
                <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                    Nie ma takiej strony
                </h1>
                <p className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground">
                    Strona, której szukasz, nie istnieje albo została przeniesiona. Sprawdź adres lub wróć do sklepu.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href="/" className={cn(BUTTON, 'bg-primary text-primary-foreground hover:bg-menuhover')}>
                        <Home className="size-4" aria-hidden="true" />
                        Strona główna
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className={cn(BUTTON, 'surface-card bg-background text-foreground hover:bg-muted')}
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        Wróć wstecz
                    </button>
                </div>

                <div className="mt-12 text-left">
                    <p className={cn(EYEBROW, 'mb-4 text-center')}>Przydatne linki</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {LINKS.map((link) => (
                            <Link
                                key={link.title}
                                href={link.href}
                                className={cn(
                                    SURFACE_CARD,
                                    'block p-4 transition-[transform,background-color] duration-150 ease-out hover:bg-muted active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100',
                                )}
                            >
                                <h2 className="text-sm font-semibold text-foreground">{link.title}</h2>
                                <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
}
