import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardCategorySkeleton() {
    return (
        <Card className="group relative overflow-hidden border-0 bg-card shadow-lg transition-all duration-300 hover:shadow-xl py-0 my-4 gap-0 border border-gray-50 min-h-[400px] md:min-h-[400px]">
            {/* Badges placeholder */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                <Skeleton className="h-5 w-12" />
            </div>

            {/* Image placeholder */}
            <div className="relative overflow-hidden aspect-[4/3]">
                <Skeleton className="h-full w-full" />
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
                {/* Discount/Delivery badges placeholder */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 justify-center w-full">
                        <div className="flex items-center gap-1 justify-center w-full">
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </div>
                </div>

                {/* Product Name placeholder */}
                <div className="space-y-1 w-full flex flex-col items-center">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2 mt-1" />
                </div>

                {/* Rating & Stock placeholder */}
                <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                    <div className="flex items-baseline gap-3">
                        <Skeleton className="h-3 w-8" />
                        <Skeleton className="h-5 w-5" />
                    </div>
                </div>

                {/* Pricing Section placeholder */}
                <div className="space-y-1.5 mt-4">
                    <div className="flex items-center justify-between flex-wrap mt-5">
                        <div className="flex justify-between w-full mb-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-6 w-16 rounded-md" />
                    </div>

                    {/* Delivery Details placeholder */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/50 mt-2">
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3 rounded-full" />
                            <Skeleton className="h-3 w-12" />
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    )
}
