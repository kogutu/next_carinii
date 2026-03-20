import { Skeleton } from "@/components/ui/skeleton"

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Image skeleton */}
            <div className="relative aspect-square bg-gray-100">
                <Skeleton className="absolute top-2 left-2 h-6 w-20" />
            </div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Title */}
                <div className="space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </div>

                {/* Warranty */}
                <Skeleton className="h-4 w-2/3" />

                {/* Rating and stock */}
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                </div>

                {/* Delivery info */}
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>

                {/* Price */}
                <div className="space-y-2 pt-2">
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Delivery cost */}
                <Skeleton className="h-5 w-40" />
            </div>
        </div>
    )
}
