'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { ProductGrid } from '@/components/category/product-grid'
import { ENTER, EYEBROW, SurfaceCard } from '@/components/ui/surface'
import type { Product } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useWishlistStore } from '@/stores/wishlistStore'

const PRODUCTS_PER_REQUEST = 100
const EXCLUDED_FIELDS = 'embedding,imgs,charakterystyka_string,description,specyfikacja_string,charakterystyka,specyfikacja'

// Dane produktów z Typesense (przez serwerowe proxy) dla podanych sku
const fetchProducts = async (skus: string[]): Promise<Product[]> => {
    const filter = `sku:=[${skus.map((sku) => `\`${sku}\``).join(',')}]`
    const response = await fetch('/api/typesense/multisearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            searches: [
                {
                    collection: 'carinii_prs',
                    q: '*',
                    query_by: 'name',
                    filter_by: filter,
                    per_page: PRODUCTS_PER_REQUEST,
                    exclude_fields: EXCLUDED_FIELDS,
                },
            ],
        }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const json = await response.json()
    return (json.results?.[0]?.hits ?? []).map((hit: any) => hit.document as Product)
}

const chunk = <T,>(items: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(items.length / size) }, (_, index) => items.slice(index * size, (index + 1) * size))

export default function WishlistPage() {
    const { status } = useSession()
    const entries = useWishlistStore((state) => state.entries)
    const isHydrated = useWishlistStore((state) => state.isHydrated)
    const remove = useWishlistStore((state) => state.remove)

    // dane produktów pobieramy raz na produkt; usunięcie z listy tylko filtruje widok (bez ponownego pobierania)
    const [catalog, setCatalog] = useState<Record<string, Product>>({})
    const [missing, setMissing] = useState<Set<string>>(new Set())
    const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading')

    const entryIds = useMemo(() => entries.map((entry) => entry.sku), [entries])
    const idsToFetch = useMemo(
        () => entryIds.filter((id) => !catalog[id] && !missing.has(id)),
        [entryIds, catalog, missing],
    )

    useEffect(() => {
        if (!isHydrated) return
        if (idsToFetch.length === 0) {
            setState('ready')
            return
        }

        let cancelled = false
        const load = async () => {
            try {
                const batches = await Promise.all(chunk(idsToFetch, PRODUCTS_PER_REQUEST).map(fetchProducts))
                if (cancelled) return

                const found = batches.flat()
                const foundIds = new Set(found.map((product) => product.sku))
                setCatalog((current) => ({ ...current, ...Object.fromEntries(found.map((product) => [product.sku, product])) }))
                setMissing((current) => new Set([...current, ...idsToFetch.filter((id) => !foundIds.has(id))]))
                setState('ready')
            } catch (error) {
                console.error('[wishlist] pobieranie produktów nie powiodło się:', error)
                if (!cancelled) setState('error')
            }
        }
        load()
        return () => {
            cancelled = true
        }
    }, [isHydrated, idsToFetch])

    const products = entryIds.map((id) => catalog[id]).filter((product): product is Product => Boolean(product))
    const unavailableIds = entryIds.filter((id) => missing.has(id))

    const openLogin = () => window.dispatchEvent(new Event('open-account-modal'))

    return (
        <main className="bg-background">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <header className={cn(ENTER, 'flex flex-wrap items-end justify-between gap-4')}>
                    <div>
                        <p className={EYEBROW}>Lista życzeń</p>
                        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Ulubione</h1>
                    </div>
                    {entries.length > 0 && (
                        <p className="text-sm tabular-nums text-muted-foreground">
                            {entries.length} {entries.length === 1 ? 'produkt' : entries.length < 5 ? 'produkty' : 'produktów'}
                        </p>
                    )}
                </header>

                {status === 'unauthenticated' && (
                    <SurfaceCard className={cn(ENTER, 'mt-6 flex flex-wrap items-center justify-between gap-3 sm:p-5')}>
                        <p className="text-pretty text-sm text-muted-foreground">
                            Lista jest zapisana tylko w tej przeglądarce. Zaloguj się, aby zachować ją na koncie i mieć na każdym urządzeniu.
                        </p>
                        <button
                            type="button"
                            onClick={openLogin}
                            className="inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            Zaloguj się
                        </button>
                    </SurfaceCard>
                )}

                <div className="mt-8">
                    {isHydrated && entries.length === 0 && (
                        <SurfaceCard className="mx-auto max-w-xl text-center sm:p-12">
                            <Heart className="mx-auto size-10 text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
                            <p className="mt-4 text-lg font-semibold text-foreground">Nie masz jeszcze ulubionych</p>
                            <p className="mt-1 text-pretty text-sm text-muted-foreground">
                                Kliknij serduszko przy produkcie, aby zapisać go na później.
                            </p>
                            <Link href="/nowosci.html" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                                Zobacz nowości
                            </Link>
                        </SurfaceCard>
                    )}

                    {state === 'error' && (
                        <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            Nie udało się pobrać produktów. Odśwież stronę lub spróbuj ponownie za chwilę.
                        </p>
                    )}

                    {/* ta sama siatka i karty produktów co w kategorii */}
                    {(products.length > 0 || (entries.length > 0 && state === 'loading')) && (
                        <ProductGrid products={products} viewMode="grid" loading={false} />
                    )}

                    {unavailableIds.length > 0 && (
                        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/60 px-4 py-3">
                            <p className="text-sm text-muted-foreground">
                                {unavailableIds.length === 1 ? '1 zapisany produkt nie jest już dostępny' : `${unavailableIds.length} zapisanych produktów nie jest już dostępnych`}.
                            </p>
                            <button
                                type="button"
                                onClick={() => unavailableIds.forEach(remove)}
                                className="inline-flex min-h-11 items-center text-sm font-medium text-foreground underline underline-offset-4 hover:text-hcar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Usuń z listy
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
