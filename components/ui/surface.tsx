import type { ComponentProps, ElementType } from 'react'
import { cn } from '@/lib/utils'

// Wspólne elementy wyglądu „Carinii”: karta z cieniem, mały nagłówek nad sekcją, wejście z opóźnieniem.
// Strona zamówienia, koszyk, mini-koszyk i strony CMS korzystają z tych samych stałych.

/** Karta: cień zamiast ramki (utility `surface-card` z globals.css), zaokrąglenie 16 px. */
export const SURFACE_CARD = 'surface-card rounded-2xl bg-card'

/** Mały nagłówek nad sekcją: wersaliki z rozstrzelonymi literami. */
export const EYEBROW = 'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

/** Wejście sekcji: lekkie wsunięcie od dołu; kolejne bloki dostają opóźnienie z ENTER_DELAY. */
export const ENTER = 'animate-in fade-in slide-in-from-bottom-3 duration-500 fill-mode-backwards motion-reduce:animate-none'

export const ENTER_DELAY = ['', 'delay-100', 'delay-200', 'delay-300'] as const

type SurfaceCardProps = ComponentProps<'div'> & {
    // false = bez wewnętrznego odstępu (gdy karta sama układa zawartość)
    padded?: boolean
}

export function SurfaceCard({ className, padded = true, ...props }: SurfaceCardProps) {
    return <div className={cn(SURFACE_CARD, padded && 'p-5 sm:p-8', className)} {...props} />
}

type EyebrowProps = ComponentProps<'p'> & {
    as?: ElementType
}

export function Eyebrow({ as: Tag = 'p', className, ...props }: EyebrowProps) {
    return <Tag className={cn(EYEBROW, className)} {...props} />
}
