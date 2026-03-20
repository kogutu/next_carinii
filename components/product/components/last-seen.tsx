"use client"

import { useEffect, useState } from "react"
import ProductCarousel from "../ProductsCarusel";
import ProductsCarousel from "@/components/hert/products-carousel";


interface LastSeenProps {
    pid: number
}

export async function LastSeen({ pid }: LastSeenProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)
    const newestProducts = await getNewestProducts();

    // Funkcja do pobierania najnowszych produktów
    async function getNewestProducts() {
        try {
            const res = await fetch('http://localhost:3000/api/home/new_products', {
                next: { revalidate: 3600 }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await res.json();

            if (data.hits && Array.isArray(data.hits)) {
                return data.hits.map((hit: any) => {
                    const product = hit.document || hit;
                    return {
                        id: product.id,
                        image: product?.image_medium,
                        name: product.name,
                        url: product.slug,
                        price: product.price,
                        hidePrice: product.hide_price,
                        priceNet: (product.final_price_netto_pln).toFixed(2),
                        priceGross: (product.final_price_netto_pln * 1.23).toFixed(2),
                        priceNet_eur: product.netto_eur,
                        priceGross_eur: product.brutto_eur,
                        specialPrice_pln: product.brutto_specialprice_pln,
                        specialPrice_eur: product.brutto_specialprice_eur,
                        tag: product.is_new ? 'NOWOŚĆ' : ''
                    };
                });
            }

            return [];
        } catch (error) {
            console.error('Error fetching newest products:', error);
            return [];
        }
    }

    useEffect(() => {
        if (typeof window === "undefined") return

        setIsClient(true)

        // Get existing IDs from localStorage
        const existingIds = localStorage.getItem("lastSeen")?.split(",").filter(Boolean) || []



        // Create the filter query and URL
        const filterQuery = `filter_by=pid:[${existingIds.join(",")}]`
        const apiUrl = `https://www.hert.pl/typesense/api/collections/meble/documents/search?q=*&page=1&per_page=18&exclude_fields=embedding,imgs,charakterystyka_string,description,specyfikacja_string,charakterystyka,specyfikacja&${filterQuery}`


        // Add current product ID
        const updatedIds = [pid.toString(), ...existingIds]

        // Keep only unique IDs (remove duplicates)
        const uniqueIds = Array.from(new Set(updatedIds))

        // Store back to localStorage (limit to last N items if needed)
        localStorage.setItem("lastSeen", uniqueIds.join(","))
        if (existingIds.length > 0) {
            setUrl(apiUrl)
        }
    }, [pid])

    // Don't render anything during SSR or if no URL is set
    if (!isClient || !url) return null

    return (
        <div className="related_products px-4 md:px-0 mt-8">
            <div className="relative border p-4 rounded-2xl border-[1.5px] shadow-lg">
                <div className="flex gap-2 items-baseline "><div className="line rounded-full overflow-hidden bg-mpgold w-5 h-5"></div><span><span className="text-lg "></span><b className="text-xl md:text-2xl  font-bold uppercase  text-mpgray  ">Ostatnio oglądane </b></span></div>

                {/* <h2 className="text-2xl font-bold mb-4">Ostatnio oglądane</h2> */}
                <ProductsCarousel title="Ostatnio oglądane" products={getNewestProducts} />
            </div>
        </div>
    )
}
