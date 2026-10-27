'use client'

import { useEffect, useState, type RefObject } from 'react'
import { cn } from '@/lib/utils'
import { isSizeShown, sizeLabel } from '@/lib/sizeLabel'

type StickyBuyBarProps = {
    // SKU modelu — po nim rozpoznajemy rękawiczki (etykiety rozmiarów S/M/L)
    sku?: string
    name: string
    priceLabel: string
    // size_qty z Typesense: { roz36: 2, roz37: 0, ... }
    sizeQty: Record<string, number> | undefined
    selectedSize: string | null
    onPickSize: (size: string) => void
    onAdd: () => void
    // użytkownik kliknął „Dodaj do koszyka” bez rozmiaru
    errorVariant: boolean
    // główny przycisk zakupu; pasek pojawia się, gdy ten element zniknie nad górną krawędzią ekranu
    anchorRef: RefObject<HTMLElement | null>
    // maison: czarno-biały styl strefy Maison (klasy mz-*), light: styl całego sklepu
    variant?: 'maison' | 'light'
}

// Dolny pasek zakupu na stronie produktu: po przewinięciu poza główny przycisk klientka nadal może wybrać rozmiar i dodać do koszyka.
export default function StickyBuyBar({ sku, name, priceLabel, sizeQty, selectedSize, onPickSize, onAdd, errorVariant, anchorRef, variant = 'light' }: StickyBuyBarProps) {
    const [visible, setVisible] = useState(false)
    const maison = variant === 'maison'

    useEffect(() => {
        const anchor = anchorRef.current
        if (!anchor || !('IntersectionObserver' in window)) return
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
            { threshold: 0 },
        )
        observer.observe(anchor)
        return () => observer.disconnect()
    }, [anchorRef])

    const sizes = Object.entries(sizeQty ?? {})
        .filter(([key]) => isSizeShown(sku, key.replace('roz', ''))).map(([key, qty]) => ({ label: key.replace('roz', ''), qty: Number(qty) }))
        .sort((a, b) => Number(a.label) - Number(b.label))

    const addLabel = errorVariant && !selectedSize ? 'Wybierz rozmiar' : 'Dodaj do koszyka'

    if (maison) {
        return (
            <div className="mz-sticky" data-visible={visible} aria-hidden={!visible}>
                <div className="mz-sticky-inner mz-wrap">
                    <div className="mz-sticky-info">
                        <span className="mz-sticky-name">{name}</span>
                        <span>{priceLabel}</span>
                    </div>
                    <div className="mz-sticky-sizes" role="group" aria-label="Rozmiar">
                        {sizes.map((size) => (
                            <button
                                key={size.label}
                                type="button"
                                className="mz-size"
                                aria-pressed={selectedSize === size.label}
                                data-off={size.qty <= 0}
                                disabled={size.qty <= 0}
                                tabIndex={visible ? 0 : -1}
                                onClick={() => onPickSize(size.label)}
                            >
                                {sizeLabel(sku, size.label)}
                            </button>
                        ))}
                    </div>
                    <button type="button" className="mz-add" tabIndex={visible ? 0 : -1} onClick={onAdd}>
                        {addLabel}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div
            aria-hidden={!visible}
            className={cn(
                'fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 motion-reduce:transition-none',
                visible ? 'translate-y-0' : 'invisible translate-y-full',
            )}
        >
            <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 px-4 py-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
                <div className="hidden min-w-0 lg:block">
                    <p className="truncate text-sm font-semibold uppercase text-gray-900">{name}</p>
                    <p className="text-sm text-gray-700">{priceLabel}</p>
                </div>
                <div className="col-span-2 flex gap-1.5 overflow-x-auto lg:col-span-1" role="group" aria-label="Rozmiar">
                    {sizes.map((size) => (
                        <button
                            key={size.label}
                            type="button"
                            disabled={size.qty <= 0}
                            aria-pressed={selectedSize === size.label}
                            tabIndex={visible ? 0 : -1}
                            onClick={() => onPickSize(size.label)}
                            className={cn(
                                'h-10 min-w-10 flex-1 border px-2 text-sm transition-colors lg:flex-none',
                                selectedSize === size.label
                                    ? 'border-hcar bg-hcar text-white'
                                    : size.qty > 0
                                        ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-900'
                                        : 'cursor-not-allowed border-gray-200 text-gray-300 line-through',
                            )}
                        >
                            {sizeLabel(sku, size.label)}
                        </button>
                    ))}
                </div>
                <div className="col-span-2 lg:col-span-1">
                    <button
                        type="button"
                        tabIndex={visible ? 0 : -1}
                        onClick={onAdd}
                        className="h-12 w-full rounded-xl !bg-[#ff4d79] px-8 text-sm font-semibold text-primary-foreground transition-colors hover:!bg-[#e63e68] lg:w-auto"
                    >
                        {addLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
