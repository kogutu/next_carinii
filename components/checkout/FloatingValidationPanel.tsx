'use client'

import { AlertCircle } from 'lucide-react'
import { useCheckoutValidationStore } from './checkoutValidationStore'

type SectionSummary = {
    id: string
    label: string
    anchorId: string
    messages: string[]
}

const firstKey = (errors: Record<string, string>): string => Object.keys(errors)[0] ?? ''

// Panel pojawia się dopiero po próbie złożenia zamówienia — wcześniej nie straszymy błędami.
export default function FloatingValidationPanel() {
    const errors = useCheckoutValidationStore((state) => state.errors)
    const submitAttempted = useCheckoutValidationStore((state) => state.submitAttempted)

    const sections: SectionSummary[] = [
        {
            id: 'customer',
            label: 'Dane i adres dostawy',
            anchorId: `checkout-${firstKey(errors.customer)}`,
            messages: Object.values(errors.customer),
        },
        {
            id: 'invoice',
            label: 'Dane do faktury',
            anchorId: `checkout-invoice-${firstKey(errors.invoice)}`,
            messages: Object.values(errors.invoice),
        },
        {
            id: 'shippingMethod',
            label: 'Sposób wysyłki',
            anchorId: 'section-shipping',
            messages: errors.shippingMethod ? [errors.shippingMethod] : [],
        },
        {
            id: 'paymentMethod',
            label: 'Metoda płatności',
            anchorId: 'section-payment',
            messages: errors.paymentMethod ? [errors.paymentMethod] : [],
        },
        {
            id: 'terms',
            label: 'Zgody i warunki',
            anchorId: 'checkout-terms',
            messages: errors.terms ? [errors.terms] : [],
        },
    ].filter((section) => section.messages.length > 0)

    if (!submitAttempted || sections.length === 0) return null

    const scrollTo = (anchorId: string) => {
        const element = document.getElementById(anchorId)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus({ preventScroll: true })
    }

    const totalErrors = sections.reduce((sum, section) => sum + section.messages.length, 0)

    return (
        <div role="alert" className="surface-card mb-4 overflow-hidden rounded-2xl bg-card">
            <div className="flex items-center gap-3 px-4 py-3">
                <AlertCircle className="size-5 shrink-0 text-destructive" aria-hidden="true" />
                <div>
                    <p className="text-sm font-semibold text-foreground">Uzupełnij pola</p>
                    <p className="text-xs tabular-nums text-muted-foreground">do poprawy: {totalErrors}</p>
                </div>
            </div>
            <ul className="px-4 pb-3 space-y-1.5">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            type="button"
                            onClick={() => scrollTo(section.anchorId)}
                            className="flex min-h-10 w-full items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/15"
                        >
                            <span className="truncate">{section.label}</span>
                            <span className="flex-shrink-0">{section.messages.length}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
