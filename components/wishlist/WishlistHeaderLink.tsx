'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/stores/wishlistStore'

// Serduszko w nagłówku: prowadzi do listy ulubionych, licznik pokazuje liczbę produktów.
export default function WishlistHeaderLink() {
    const count = useWishlistStore((state) => (state.isHydrated ? state.entries.length : 0))

    return (
        <Link
            href="/ulubione"
            aria-label={count > 0 ? `Ulubione (${count})` : 'Ulubione'}
            className="relative flex items-center justify-center rounded-full p-2 transition hover:bg-hertwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
            <Heart className="size-6" strokeWidth={1.5} aria-hidden="true" />
            {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full border-2 border-white bg-hcar text-[10px] font-bold tabular-nums text-white">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    )
}
