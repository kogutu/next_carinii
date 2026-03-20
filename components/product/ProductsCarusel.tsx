"use client"

import { useEffect, useState } from "react"
import ProductCardMp, { type Product } from "./ProductCardMp"
import ProductCardSkeleton from "./product-card-skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ProductCard } from "./ProductCard"
import ProductItem from "@/pages/product-item"

interface TypesenseResponse {
    found: number
    hits: Array<{
        document: Product
    }>
    page: number
    out_of: number
}

interface ProductCarouselProps {
    url: string
}

export default function ProductCarousel({ url }: ProductCarouselProps) {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchProducts() {
            try {
                setLoading(true)
                const response = await fetch(url, {
                    cache: "no-store",
                })

                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.status}`)
                }

                const data: TypesenseResponse = await response.json()
                setProducts(data.hits.map((hit) => hit.document))
            } catch (err) {
                console.error("[v0] Error fetching products:", err)
                setError(err instanceof Error ? err.message : "Failed to load products")
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [url])

    if (loading) {
        return (
            <div className="w-full">
                <Carousel
                    opts={{
                        align: "start",
                        loop: false,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {Array.from({ length: 4 }).map((_, index) => (
                            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                                <ProductCardSkeleton />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-destructive">Błąd: {error}</p>
            </div>
        )
    }

    if (products.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Nie znaleziono produktów</p>
            </div>
        )
    }

    return (
        <div className="w-full pl-2">
            <Carousel
                opts={{
                    align: "start",
                    loop: true,
                }}
                className="w-full"
            >
                <CarouselContent>
                    {products.map((product) => (
                        <CarouselItem key={product.id} className="basis-2/3 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                            <ProductItem product={product} />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}
