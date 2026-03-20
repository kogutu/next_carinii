"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Carousel45 } from "../components/carusel_4_5"

interface Variant {
    id: string
    image: string
    price: number
    sku: string
    status: number
    variant_name: string
}

interface ProductVariantsProps {
    model: string
    pid: number,
    onVariantSelect?: (variant: Variant) => void
    className?: string
}

export function ProductColorVariants({ model, pid, onVariantSelect, className }: ProductVariantsProps) {
    const [variants, setVariants] = useState<Variant[]>([])
    const [selectedVariant, setSelectedVariant] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

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
                        const prs = products.map((e: any) => {
                            return {
                                id: e.document.id,
                                image: e.document.imgs[0].url,
                                url: e.document.url,
                                price: e.document.price,
                                sku: e.document.sku,
                                status: e.document.status,
                                variant_name: e.document.variant_name
                            }
                        })

                        setVariants(prs)

                        // Automatycznie wybierz pierwszy dostępny wariant
                        if (prs.length > 0)
                            setSelectedVariant(prs[0]);

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
    }, [model])

    const handleVariantClick = (variant: Variant) => {
        if (variant.status === 0) return // Nie pozwalaj wybrać niedostępnego wariantu

        setSelectedVariant(variant.id)
        onVariantSelect?.(variant)
    }

    if (loading) {
        return (
            <div className={cn("flex items-center gap-2", className)}>
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
            </div>
        )
    }

    if (error) {
        return (
            <div className={cn("rounded-lg border border-destructive/50 bg-destructive/10 p-4", className)}>
                <p className="text-sm text-destructive">{error}</p>
            </div>
        )
    }

    if (variants.length === 0) {
        return (
            <div className={cn("rounded-lg border border-muted bg-muted/50 p-4", className)}>
                <p className="text-sm text-muted-foreground">Brak dostępnych wariantów</p>
            </div>
        )
    }

    return (
        <>
            <Carousel45 items={variants || []} />


            <div className={cn("space-y-3", className)}>
                <h3 className="text-sm font-medium text-foreground">Inne warianty kolorystyczne</h3>
                <div className="flex flex-wrap gap-3">
                    {variants.map((variant) => {
                        const isSelected = selectedVariant === variant.id
                        const isDisabled = variant.status === 0

                        return (
                            <button
                                key={variant.id}
                                onClick={() => handleVariantClick(variant)}
                                disabled={isDisabled}
                                className={cn(
                                    "group relative flex flex-col items-center gap-2 rounded-lg border-2 p-2 transition-all",
                                    isSelected && !isDisabled && "border-primary ring-2 ring-primary/20",
                                    !isSelected && !isDisabled && "border-border hover:border-primary/50",
                                    isDisabled && "cursor-not-allowed opacity-50",
                                    !isDisabled && "cursor-pointer",
                                )}
                                title={isDisabled ? "Produkt niedostępny" : variant.variant_name}
                            >
                                <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
                                    <Image
                                        src={variant.image || "/placeholder.svg"}
                                        alt={variant.variant_name}
                                        fill
                                        className={cn("object-cover transition-all", isDisabled && "grayscale")}
                                        sizes="84px"
                                    />

                                    {/* Przekreślenie dla niedostępnych wariantów */}
                                    {isDisabled && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="h-[2px] w-full rotate-45 bg-destructive" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-center gap-0.5">
                                    <span
                                        className={cn(
                                            "text-xs font-medium",
                                            isDisabled && "line-through text-muted-foreground",
                                            !isDisabled && "text-foreground",
                                        )}
                                    >
                                        {variant.variant_name}
                                    </span>

                                    <span
                                        className={cn(
                                            "text-xs",
                                            isDisabled && "text-muted-foreground",
                                            !isDisabled && "text-muted-foreground",
                                        )}
                                    >
                                        {variant.price.toFixed(2)} zł
                                    </span>
                                </div>

                                {isDisabled && (
                                    <span className="absolute -right-1 -top-1 rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-medium text-destructive-foreground">
                                        Niedostępny
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </>

    )
}
