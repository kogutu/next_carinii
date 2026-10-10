'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { trustmateScriptUrl } from '@/lib/trustmate'

// Kolory widżetów Trustmate dopasowane do sklepu — dokładnie te same reguły, których używa obecny sklep Magento
const TRUSTMATE_THEME = `
.hydra-grade__verified, .hydra-grade__logo { display: none; }
.tm-filter-reviews { display: none; }
.hydra-grade-distribution__bar-value { background: linear-gradient(180deg, #b2135c 0%, #dd4d8f 49.27%, #b2135c 100%); border-radius: 16px; height: 100%; width: 50%; }
.tm-hydra svg { fill: #b2135c !important; }
.tm-hydra * { border-color: #b2135c; color: black !important; }
.tm-widget .hydra-main-box__tab--active { border-color: #bd6890; }
.tm-widget .hydra-grade-distribution__bar-value, .tm-icon__verified-badge--active, button.tm-hydra-button.tm-hydra-button__show-all { filter: hue-rotate(300deg) brightness(0.7); }
.tm-hydra img, .tm-tooltip .tm-tooltip-icon__verified-badge--active, .hydra-main-box__extra-modules-content .tm-omnibus-modal__icon, .tm-widget__vote-up, .tm-widget__vote-down, .tm-hornet-container .tm-hornet-wrapper .tm-grade-label__stars img { filter: hue-rotate(-72deg) brightness(0.7); }
.tm-widget .hydra-grade-distribution__grade-chart { align-items: center; }
/* reset obrazków z Tailwinda (max-width: 100%) zwija gwiazdki w układzie flex do zera — widżet wymaga max-width: none */
.tm-hornet-container img { max-width: none; }
/* klasy rozmiaru widżetu (size-2) kolidują z narzędziem size-2 z Tailwinda (8x8 px) — wewnątrz widżetu je neutralizujemy */
.tm-hornet-container .tm-hornet-wrapper { width: auto; height: auto; }
`

type TrustmateWidgetProps = {
    // token widżetu z panelu Trustmate (hornet = gwiazdki, hydra = lista opinii)
    token: string
    // ID produktu głównego z katalogu
    productId: string
    // true = skrypt (hydra ma ok. 370 KB) ładuje się dopiero, gdy widżet zbliża się do widoku
    lazy?: boolean
    // zarezerwowana wysokość, żeby strona nie skakała po załadowaniu widżetu
    minHeight?: number
    className?: string
    // wołane, gdy po załadowaniu skryptu widżet nic nie pokazał (produkt bez opinii) — rodzic może ukryć sekcję
    onEmpty?: () => void
}

// Po tylu ms od uruchomienia skryptu pusty widżet uznajemy za „brak opinii”
const EMPTY_CHECK_MS = 6000

// Widżet Trustmate: pusty element z id równym tokenowi + skrypt, który sam pobiera i wstawia opinie produktu.
// Po zmianie produktu (nawigacja bez przeładowania) widżet jest czyszczony i ładowany od nowa.
export default function TrustmateWidget({ token, productId, lazy = false, minHeight, className, onEmpty }: TrustmateWidgetProps) {
    const placeholderRef = useRef<HTMLDivElement>(null)
    const [empty, setEmpty] = useState(false)

    useEffect(() => {
        const placeholder = placeholderRef.current
        if (!placeholder || !productId) return

        let script: HTMLScriptElement | null = null
        let observer: IntersectionObserver | null = null
        let emptyTimer: ReturnType<typeof setTimeout> | null = null
        setEmpty(false)

        const load = () => {
            script = document.createElement('script')
            script.defer = true
            script.src = trustmateScriptUrl(token, productId)
            // produkt bez opinii: Trustmate niczego nie wstawia — zwijamy zarezerwowane miejsce. Odliczamy dopiero od
            // załadowania skryptu, żeby wolne łącze nie zostało wzięte za „brak opinii”
            script.onload = () => {
                emptyTimer = setTimeout(() => {
                    // widżet bez opinii wstawia tylko style (textContent nie jest pusty), więc patrzymy na tekst widoczny dla klientki
                    if (!placeholder.innerText.trim() && !placeholder.querySelector('img')) {
                        setEmpty(true)
                        onEmpty?.()
                    }
                }, EMPTY_CHECK_MS)
            }
            document.body.appendChild(script)
        }

        if (lazy && 'IntersectionObserver' in window) {
            observer = new IntersectionObserver(
                (entries) => {
                    if (entries.some((entry) => entry.isIntersecting)) {
                        observer?.disconnect()
                        load()
                    }
                },
                { rootMargin: '600px' },
            )
            observer.observe(placeholder)
        } else {
            load()
        }

        return () => {
            observer?.disconnect()
            if (emptyTimer) clearTimeout(emptyTimer)
            script?.remove()
            placeholder.innerHTML = ''
            delete placeholder.dataset.tmRenderedId
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, productId, lazy])

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: TRUSTMATE_THEME }} />
            {/* zawartość wstawia skrypt Trustmate — React jej nie dotyka (element nie ma dzieci) */}
            <div ref={placeholderRef} id={token} className={cn(className)} style={minHeight && !empty ? { minHeight } : undefined} suppressHydrationWarning />
        </>
    )
}
