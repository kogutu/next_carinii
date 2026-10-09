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
        <div role="alert" className="mb-3 bg-white rounded-lg border border-red-300 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                    <p className="font-semibold text-red-700 text-sm">Uzupełnij pola</p>
                    <p className="text-xs text-gray-500">do poprawy: {totalErrors}</p>
                </div>
            </div>
            <ul className="px-4 pb-3 space-y-1.5">
                {sections.map((section) => (
                    <li key={section.id}>
                        <button
                            type="button"
                            onClick={() => scrollTo(section.anchorId)}
                            className="w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded text-xs font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors text-left"
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
