import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WITHDRAW_LABEL, withdrawHref } from '@/lib/withdrawal'

type WithdrawalButtonProps = {
    // z numerem zamówienia formularz startuje z wybranym zamówieniem
    orderNumber?: string
    // primary: ciemny przycisk; secondary: jasna karta; link: tekstowy odnośnik (np. w stopce)
    variant?: 'primary' | 'secondary' | 'link'
    className?: string
}

const VARIANTS = {
    // min-h zamiast stałej wysokości: w wąskiej kolumnie (stopka na małym ekranie) etykieta może się zawinąć
    primary:
        'inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold leading-snug text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    secondary:
        'surface-card inline-flex min-h-11 items-center justify-center rounded-xl bg-background px-5 py-2.5 text-center text-sm font-semibold leading-snug text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    link: 'text-sm font-semibold text-foreground underline underline-offset-4 hover:text-hcar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
} as const

// Wejście do funkcji odstąpienia od umowy. Etykieta zawsze „Odstąp od umowy tutaj”; przycisk ma być stale dostępny i widoczny.
export default function WithdrawalButton({ orderNumber, variant = 'primary', className }: WithdrawalButtonProps) {
    return (
        <Link href={withdrawHref(orderNumber)} className={cn(VARIANTS[variant], className)}>
            {WITHDRAW_LABEL}
        </Link>
    )
}
