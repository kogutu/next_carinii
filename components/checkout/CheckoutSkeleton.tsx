import { Skeleton } from '@/components/ui/skeleton'

export function CheckoutSkeleton() {
    return (
        <div className="relative z-0 min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-4 w-96 mb-8" />

                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-12">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* Forms */}
                        <div className="surface-card rounded-2xl bg-card p-5 sm:p-8 space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Shipping Method */}
                        <div className="surface-card rounded-2xl bg-card p-5 sm:p-8 space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>

                        {/* Payment Method */}
                        <div className="surface-card rounded-2xl bg-card p-5 sm:p-8 space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="space-y-6 lg:sticky lg:top-24">
                            {/* Validation Summary */}
                            <div className="surface-card rounded-2xl bg-card p-5 sm:p-6 space-y-3">
                                <Skeleton className="h-6 w-32" />
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="surface-card rounded-2xl bg-card p-5 sm:p-6 space-y-4">
                                <Skeleton className="h-6 w-32 mb-4" />
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                                <Skeleton className="h-12 w-full mt-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
