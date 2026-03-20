// components/CurrencyHydration.tsx
'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartZustand';

export function CurrencyHydration() {
    const hydrate = useCartStore((state: any) => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return null;

}