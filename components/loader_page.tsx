"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Cienki pasek postępu na górze (styl YouTube) zamiast blokującego
// pełnoekranowego overlay'a. Pokazuje się dopiero po 250 ms — szybkie
// przejścia (prefetch / cache) nie migają loaderem, a wolne dostają
// sygnał wizualny bez blokowania klików (pointer-events-none).
const SHOW_DELAY_MS = 250;
const SAFETY_HIDE_MS = 8000;

function shouldIgnoreClick(e: MouseEvent, anchor: HTMLAnchorElement, pathname: string | null): boolean {
    // Tylko lewy przycisk bez modyfikatorów
    if (e.button !== 0) return true;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return true;

    const href = anchor.getAttribute("href");
    if (!href) return true;
    if (href.startsWith("#")) return true;
    if (anchor.target === "_blank") return true;
    if (anchor.hasAttribute("download")) return true;
    // Linki zewnętrzne / akcje (tel:, mailto:) — nie nasze przejścia
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(href)) return true;
    if (href.startsWith("http")) return true;

    // Ten sam URL (z query/hash) — brak nawigacji
    try {
        const url = new URL(href, window.location.href);
        const current = pathname ?? window.location.pathname;
        if (url.pathname === current && url.search === window.location.search) return true;
    } catch {
        return true;
    }

    return false;
}

export function NavigationButton() {
    return null;
}

export default function RouteListener() {
    const pathname = usePathname();
    const [active, setActive] = useState(false);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimers = () => {
        if (showTimer.current) clearTimeout(showTimer.current);
        if (safetyTimer.current) clearTimeout(safetyTimer.current);
        showTimer.current = null;
        safetyTimer.current = null;
    };

    // Nawigacja zakończona (pathname się zmienił) → schowaj pasek
    useEffect(() => {
        clearTimers();
        setActive(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    // Klik w link wewnętrzny → uzbrój pasek z opóźnieniem
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest("a");
            if (!anchor) return;
            if (shouldIgnoreClick(e, anchor as HTMLAnchorElement, pathname)) return;

            clearTimers();
            // Pokaż tylko gdy przejście faktycznie trwa
            showTimer.current = setTimeout(() => setActive(true), SHOW_DELAY_MS);
            // Awaryjne schowanie, gdyby pathname nie drgnął (błąd nawigacji)
            safetyTimer.current = setTimeout(() => {
                setActive(false);
            }, SAFETY_HIDE_MS);
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("click", handleClick, true);
            clearTimers();
        };
    }, [pathname]);

    if (!active) return null;

    return (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999]" aria-hidden="true">
            <div className="h-[3px] w-full overflow-hidden bg-black/5">
                <div className="h-full w-1/3 rounded-r-full bg-black/70 route-progress-slide" />
            </div>
            <style jsx>{`
                .route-progress-slide {
                    animation: route-progress 1s ease-in-out infinite;
                }
                @keyframes route-progress {
                    0% { margin-left: -33%; }
                    100% { margin-left: 100%; }
                }
            `}</style>
        </div>
    );
}
