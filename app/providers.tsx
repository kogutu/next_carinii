'use client'

import { WishlistSync } from '@/components/wishlist/WishlistSync'
import { SessionProvider } from 'next-auth/react'
import type React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <WishlistSync />
            {children}
        </SessionProvider>
    )
}
