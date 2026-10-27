import type { Metadata } from "next"
import MaisonListPage from "@/components/maison/MaisonListPage"
import { MAISON_PATHS } from "@/lib/maisonShared"

export const revalidate = 60

export const metadata: Metadata = {
    title: "Kolekcja Maison Carinii — kozaki i botki",
    description: "Pełna kolekcja Maison Carinii: kozaki i botki z najszlachetniejszych skór. Designed to be collected.",
    alternates: { canonical: MAISON_PATHS.collection },
}

export default function Page() {
    return <MaisonListPage scope="all" />
}
