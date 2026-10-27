"use client"

import { useState } from "react"
import MaisonProductCard from "./MaisonProductCard"
import type { MaisonCategory, MaisonProduct } from "@/lib/maisonShared"

type MaisonCatalogProps = {
    products: MaisonProduct[]
    title: string
    // filtr kategorii tylko na liście „Odkryj kolekcję”
    withFilter?: boolean
}

const FILTERS: { value: "all" | MaisonCategory; label: string }[] = [
    { value: "all", label: "Wszystkie" },
    { value: "kozaki", label: "Kozaki" },
    { value: "botki", label: "Botki" },
]

// Kolejna karta po pierwszych ośmiu ładuje się leniwie, pierwsze cztery z priorytetem (kandydaci na LCP).
const PRIORITY_CARDS = 4

export default function MaisonCatalog({ products, title, withFilter = false }: MaisonCatalogProps) {
    const [filter, setFilter] = useState<"all" | MaisonCategory>("all")
    const visible = filter === "all" ? products : products.filter((product) => product.category === filter)

    return (
        <div className="maison-main mz-wrap">
            <div className="mz-head">
                <h1>{title}</h1>
                <span>{visible.length} {visible.length === 1 ? "model" : "modeli"}</span>
            </div>

            {withFilter && (
                <div className="mz-filter" role="group" aria-label="Filtr kategorii">
                    {FILTERS.map((item) => (
                        <button key={item.value} type="button" aria-pressed={filter === item.value} onClick={() => setFilter(item.value)}>
                            {item.label}
                        </button>
                    ))}
                </div>
            )}

            {visible.length === 0 ? (
                <p className="mz-empty">Brak produktów w tej kategorii.</p>
            ) : (
                <div className="mz-list">
                    {visible.map((product, index) => (
                        <MaisonProductCard key={product.sku} product={product} priority={index < PRIORITY_CARDS} />
                    ))}
                </div>
            )}
        </div>
    )
}
