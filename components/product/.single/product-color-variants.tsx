"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from 'next/navigation'

interface Variant {
    id: string
    image: string
    url: string
    price: number
    sku: string
    status: number
    variant_name: string
}

interface ProductVariantsProps {
    model: string
    pid: number
    onVariantSelect?: (variant: Variant) => void
    className?: string
}

// Skeleton Component
function ProductVariantsSkeleton() {
    return (
        <div className="w-full space-y-4 overflow-hidden min-h-[157px]">
            <div className="flex items-center justify-between">
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="relative aspect-[4/3] bg-gray-200 rounded-xl animate-pulse flex-shrink-0"
                        style={{
                            width: "calc((100vw - 2rem) / 5)",
                            maxWidth: "140px",
                            minWidth: "100px",
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export function ProductColorVariants({
    model,
    pid,
    onVariantSelect,
    className
}: ProductVariantsProps) {
    const [variants, setVariants] = useState<Variant[]>([])
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [scrollPosition, setScrollPosition] = useState(0)
    const [maxScroll, setMaxScroll] = useState(0)
    const [showAll, setShowAll] = useState(false)
    const thumbnailContainerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchVariants = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(
                    `https://www.hert.pl/devback/typesense/api/collections/meble/documents/search?q=*&page=1&per_page=10&filter_by=model:${model} && status:=true && id:!=${pid}`,
                )

                if (!response.ok) {
                    throw new Error("Nie udało się pobrać wariantów produktu")
                }

                const data = await response.json()
                if (data.hits && data.hits.length > 0) {
                    const products = data.hits
                    if (products) {
                        const prs = products.map((e: any) => ({
                            id: e.document.id,
                            image: e.document.imgs[0].url,
                            url: "/" + e.document.slug,
                            price: e.document.price,
                            sku: e.document.sku,
                            status: e.document.status,
                            variant_name: e.document.variant_name
                        }))
                        setVariants(prs)
                        // Automatycznie wybierz pierwszy dostępny wariant
                        if (prs.length > 0) setSelectedVariant(prs[0].id)
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : "Wystąpił błąd")
            } finally {
                setLoading(false)
            }
        }

        if (model) {
            fetchVariants()
        }
    }, [model, pid])

    // Update max scroll when container resizes or items change
    const updateMaxScroll = useCallback(() => {
        if (thumbnailContainerRef.current) {
            const container = thumbnailContainerRef.current
            const scrollableElement = container.querySelector('.overflow-x-auto') as HTMLElement || container
            const max = scrollableElement.scrollWidth - scrollableElement.clientWidth
            setMaxScroll(Math.max(0, max))
            setScrollPosition(scrollableElement.scrollLeft)
        }
    }, [])

    // Initialize and update on resize
    useEffect(() => {
        const timer = setTimeout(() => {
            updateMaxScroll()
        }, 100)

        const handleResize = () => {
            updateMaxScroll()
        }

        window.addEventListener('resize', handleResize)
        return () => {
            clearTimeout(timer)
            window.removeEventListener('resize', handleResize)
        }
    }, [updateMaxScroll, variants.length, showAll])

    const showLeftArrow = !showAll && scrollPosition > 10
    const showRightArrow = !showAll && scrollPosition < maxScroll - 10

    const scrollThumbnails = useCallback((direction: "left" | "right") => {
        if (!thumbnailContainerRef.current) return

        const container = thumbnailContainerRef.current
        const scrollableElement = container.querySelector('.overflow-x-auto') as HTMLElement || container
        const itemWidth = scrollableElement.children[0]?.clientWidth || 0
        const gap = 8 // gap-2 = 0.5rem = 8px
        const scrollAmount = itemWidth + gap

        if (direction === "left") {
            const newPosition = Math.max(0, scrollPosition - scrollAmount)
            scrollableElement.scrollTo({ left: newPosition, behavior: "smooth" })
            setScrollPosition(newPosition)
        } else {
            const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount)
            scrollableElement.scrollTo({ left: newPosition, behavior: "smooth" })
            setScrollPosition(newPosition)
        }
    }, [scrollPosition, maxScroll])

    const handleVariantClick = (variant: Variant) => {
        if (variant.status === 0) return // Nie pozwalaj wybrać niedostępnego wariantu
        setSelectedVariant(variant.id)
        onVariantSelect?.(variant)

        // Navigate to variant URL
        const url = variant.url.split("/").pop()
        router.push(url)
    }

    const handleThumbnailScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        setScrollPosition(target.scrollLeft)
    }

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            scrollThumbnails("left")
        } else if (e.key === 'ArrowRight') {
            scrollThumbnails("right")
        }
    }, [scrollThumbnails])

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    if (loading) {
        return <ProductVariantsSkeleton />
    }

    if (error) {
        return (
            <div className="text-red-500 p-4 rounded-lg bg-red-50">
                {error}
            </div>
        )
    }

    if (variants.length === 0) {
        return (
            <div className="text-gray-500 p-4 rounded-lg bg-gray-50">
                Brak dostępnych wariantów
            </div>
        )
    }

    return (
        <div className={cn("w-full", className)}>

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium">Wersje kolorystyczne:</h3>
                {variants.length > 3 && (
                    <Button
                        variant="link"
                        onClick={() => setShowAll(!showAll)}
                        className="text-sm text-mpgreen hover:text-mpgreen/80"
                    >
                        {showAll ? 'Pokaż mniej' : 'Zobacz wszystkie'}
                    </Button>
                )}
            </div>

            {/* Mobile Carousel */}
            <div ref={thumbnailContainerRef} className="relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                        onClick={() => scrollThumbnails("left")}
                        aria-label="Scroll left"
                        type="button"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}

                {/* Scrollable Container */}
                <div
                    className={cn(
                        "overflow-x-auto scrollbar-hide",
                        showAll ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" : "flex gap-2 snap-x snap-mandatory"
                    )}
                    onScroll={handleThumbnailScroll}
                >
                    {variants.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleVariantClick(item)}
                            disabled={item.status === 0}
                            className={cn(
                                "relative aspect-[4/3] bg-muted rounded-xl overflow-hidden border border-gray-50 cursor-pointer transition-all hover:border-b-2 hover:border-mpgreen disabled:opacity-50 disabled:cursor-not-allowed",
                                selectedVariant === item.id && "border-2 border-mpgreen",
                                showAll ? '' : 'snap-start flex-shrink-0'
                            )}
                            style={
                                !showAll
                                    ? {
                                        width: "calc((100vw - 2rem) / 5)",
                                        maxWidth: "140px",
                                        minWidth: "100px",
                                    }
                                    : undefined
                            }
                            type="button"
                        >
                            <Image
                                src={item.image}
                                alt={item.variant_name || `Wariant ${item.id}`}
                                fill
                                className="object-cover"
                                sizes="140px"
                            />
                            {item.status === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">Niedostępny</span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                        onClick={() => scrollThumbnails("right")}
                        aria-label="Scroll right"
                        type="button"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}