import type { ReactNode } from "react"
import "@/components/maison/maison.css"
import { geistMono } from "@/components/maison/font"
import MaisonFooter from "@/components/maison/MaisonFooter"

// Strefa Maison Carinii: własny, czarno-biały układ. Globalny nagłówek i stopka sklepu są tu ukryte (SiteChrome w app/layout.tsx).
export default function MaisonLayout({ children }: { children: ReactNode }) {
    return (
        <div className={`maison ${geistMono.variable}`}>
            {children}
            <MaisonFooter />
        </div>
    )
}
