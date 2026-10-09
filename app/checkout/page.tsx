'use client'

import { useCartStore } from '@/stores/cartZustand'
import { useIsMobile } from '@/hooks/use-mobile'
import CheckoutLayout from '@/components/checkout/CheckoutLayout'
import { CheckoutSkeleton } from '@/components/checkout/CheckoutSkeleton'
import UndoRemoveBar from '@/components/checkout/UndoRemoveBar'
import { ArrowLeft, ChevronLeft } from 'lucide-react'

export default function CheckoutPage() {
    const items = useCartStore(state => state.items)
    const isHydrated = useCartStore(state => state.isHydrated)
    const isMobile = useIsMobile()

    // Użyj:
    if (!isHydrated || isMobile === undefined || isMobile === null) return <CheckoutSkeleton />

    if (items.length === 0) {
        return (
            <div className="mx-auto max-w-4xl px-4 py-20 text-center">
                <div className="flex justify-center mb-6">
                    <svg
                        className="size-28 text-muted-foreground/60"
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
                <h1 className="mb-4 text-balance text-3xl font-semibold tracking-tight text-foreground">
                    Twój koszyk jest pusty
                </h1>
                <p className="mb-6 text-pretty text-muted-foreground">
                    Wygląda na to, że nie dodałeś jeszcze żadnych produktów
                </p>
                <div className="max-w-md mx-auto mb-6">
                    <UndoRemoveBar />
                </div>
                <a
                    href="/"
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-menuhover active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
                >
                    <ArrowLeft />
                    <span>Wróć do sklepu</span>
                </a>
            </div>
        )
    }

    return <CheckoutLayout />
}
