"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CartDrawerContent } from "@/components/hert/items_modal/CartDrawer"
import { useCartStore } from "@/stores/cartZustand"
import { useWishlistStore } from "@/stores/wishlistStore"
import { MAISON_PATHS } from "@/lib/maisonShared"

type MaisonHeaderProps = {
    // na stronie głównej nagłówek leży na filmie, na pozostałych jest zwykłym paskiem z linią
    overlay?: boolean
}

export default function MaisonHeader({ overlay = false }: MaisonHeaderProps) {
    const pathname = usePathname()
    const setShowMiniCart = useCartStore((state) => state.setShowMiniCart)
    const isCartHydrated = useCartStore((state) => state.isHydrated)
    const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.qty, 0))
    const wishlistCount = useWishlistStore((state) => (state.isHydrated ? state.entries.length : 0))

    return (
        <>
            <header className={`mz-top mz-wrap ${overlay ? "mz-top--overlay" : "mz-top--flat"}`}>
                <nav aria-label="Kategorie Maison">
                    <Link href={MAISON_PATHS.kozaki} aria-current={pathname === MAISON_PATHS.kozaki ? "page" : undefined}>Kozaki</Link>
                    <Link href={MAISON_PATHS.botki} aria-current={pathname === MAISON_PATHS.botki ? "page" : undefined}>Botki</Link>
                </nav>
                <Link className="mz-top-logo" href={MAISON_PATHS.home} aria-label="Maison Carinii — strona główna">
                    <img src="/maison/logotyp_white.svg" alt="Maison Carinii" width={1012} height={67} />
                </Link>
                <div className="mz-tools">
                    <Link className="mz-hide-sm" href="/">Carinii</Link>
                    <Link className="mz-hide-sm" href="/ulubione">Ulubione{wishlistCount > 0 ? ` (${wishlistCount})` : ""}</Link>
                    <button type="button" onClick={() => setShowMiniCart(true)} aria-label="Otwórz koszyk">
                        Koszyk{isCartHydrated && cartCount > 0 ? ` (${cartCount})` : ""}
                    </button>
                </div>
            </header>
            <CartDrawerContent />
        </>
    )
}
