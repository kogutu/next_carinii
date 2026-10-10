'use client'

import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { selectIsFavorite, useWishlistStore, type WishlistProduct } from '@/stores/wishlistStore'

type WishlistButtonProps = {
    product: WishlistProduct & { name?: string }
    // overlay: serduszko na zdjęciu karty produktu; outline: przycisk z ramką (strona produktu)
    variant?: 'overlay' | 'outline'
    className?: string
}

// Serduszko ulubionych: świeci się (czerwone, wypełnione), gdy produkt jest na liście. Stan pochodzi z jednego
// store'a, więc dodanie lub usunięcie widać natychmiast na liście, karcie produktu i w nagłówku.
export default function WishlistButton({ product, variant = 'overlay', className }: WishlistButtonProps) {
    const isFavorite = useWishlistStore(selectIsFavorite(product.sku))
    const toggle = useWishlistStore((state) => state.toggle)
    const name = product.name?.split('CARINII')[0]?.trim()

    const label = isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'

    return (
        <button
            type="button"
            aria-pressed={isFavorite}
            aria-label={name ? `${label}: ${name}` : label}
            title={label}
            onClick={(event) => {
                // serduszko leży w karcie-linku: nie przechodzimy do produktu
                event.preventDefault()
                event.stopPropagation()
                toggle(product)
            }}
            className={cn(
                'flex items-center justify-center transition-[transform,background-color] duration-150 ease-out active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:active:scale-100',
                variant === 'overlay' && 'size-11 rounded-full',
                variant === 'outline' && 'size-9 rounded-md border border-input bg-background hover:bg-muted',
                className,
            )}
        >
            <Heart
                key={String(isFavorite)}
                strokeWidth={1.5}
                aria-hidden="true"
                className={cn(
                    variant === 'overlay' ? 'size-5' : 'size-4',
                    isFavorite
                        ? 'animate-in zoom-in-50 fill-hcar text-hcar duration-200 motion-reduce:animate-none'
                        : 'text-gray-500 hover:text-hcar',
                )}
            />
        </button>
    )
}
