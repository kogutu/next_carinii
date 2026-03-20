'use client'

import { useCartStore } from '@/stores/cartZustand'
import { useIsMobile } from '@/hooks/use-mobile'
import CheckoutLayout from '@/components/checkout/CheckoutLayout'
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton'
import { ArrowLeft, ChevronLeft } from 'lucide-react'

export default function CheckoutPage() {
    const items = useCartStore(state => state.items)
    const isHydrated = useCartStore(state => state.isHydrated)
    const isMobile = useIsMobile()

    // Użyj:
    if (!isHydrated || isMobile === undefined || isMobile === null) return <CheckoutSkeleton />

    if (items.length === 0) {
        return (
            <div className="max-w-4xl mx-auto py-20 text-center">
                <div className="flex justify-center mb-6">
                    <svg
                        className="w-32 h-32 text-gray-400 animate-bounce"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                    </svg>
                </div>
                <h1 className="text-3xl font-semibold mb-4 text-gray-800">
                    Twój koszyk jest pusty
                </h1>
                <p className="text-gray-600 mb-6">
                    Wygląda na to, że nie dodałeś jeszcze żadnych produktów
                </p>
                <a
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-hert text-white rounded-lg hover:bg-hert/90 transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    <ArrowLeft />
                    <span>Wróć do sklepu</span>
                </a>
            </div>
        )
    }

    return <CheckoutLayout />
}
