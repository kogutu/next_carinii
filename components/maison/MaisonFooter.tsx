"use client"

import Link from "next/link"
import { openCookieSettings } from "@/lib/cookieConsent"
import WithdrawalButton from "@/components/withdrawal/WithdrawalButton"

// Stopka strefy Maison. Przycisk odstąpienia od umowy musi być stale widoczny na każdej stronie sklepu,
// więc zostaje także tutaj (jak w globalnej stopce).
export default function MaisonFooter() {
    return (
        <footer className="mz-foot mz-wrap">
            <div className="mz-foot-row">
                <span>© 2026 Maison Carinii</span>
                <span>Designed to be collected</span>
            </div>
            <div className="mz-foot-row" style={{ marginTop: 20 }}>
                <nav className="mz-foot-links" aria-label="Informacje">
                    <Link href="/">Sklep Carinii</Link>
                    <Link href="/kontakt">Kontakt</Link>
                    <Link href="/regulamin">Regulamin</Link>
                    <Link href="/polityka-prywatnosci">Polityka prywatności</Link>
                    <button type="button" onClick={openCookieSettings}>Ustawienia cookies</button>
                    <WithdrawalButton variant="link" className="!text-[11px] !font-normal !uppercase !tracking-[0.08em] !text-[#a8a8a8] !no-underline hover:!text-white" />
                </nav>
            </div>
        </footer>
    )
}
