import type { Metadata } from "next"
import MaisonListPage from "@/components/maison/MaisonListPage"
import { MAISON_PATHS } from "@/lib/maisonShared"

export const revalidate = 60

export const metadata: Metadata = {
    title: "Botki Maison Carinii — ekskluzywne botki",
    description: "Botki Maison Carinii: wyrazista linia cholewki i rzeźbiony obcas w jednej, spójnej kompozycji.",
    alternates: { canonical: MAISON_PATHS.botki },
}

export default function Page() {
    return <MaisonListPage scope="botki" />
}
