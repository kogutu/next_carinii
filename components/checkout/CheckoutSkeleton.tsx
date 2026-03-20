import { Skeleton } from '@/components/ui/skeleton'

export function CheckoutSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f4f1] to-white relative z-0">
            <div className="max-w-7xl mx-auto py-12 px-4">
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-4 w-96 mb-8" />

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Progress Bar */}
                        <Skeleton className="h-2 w-full" />

                        {/* Forms */}
                        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i}>
                                    <Skeleton className="h-4 w-24 mb-2" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ))}
                        </div>

                        {/* Shipping Method */}
                        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm space-y-4">
                            <Skeleton className="h-8 w-40 mb-6" />
                            {Array.from({ length: 2 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full" />
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="sticky top-8 space-y-6">
                            {/* Validation Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-3">
                                <Skeleton className="h-6 w-32" />
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <Skeleton key={i} className="h-4 w-full" />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm space-y-4">
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
