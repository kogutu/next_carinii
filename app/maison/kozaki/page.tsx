import type { Metadata } from "next"
import MaisonListPage from "@/components/maison/MaisonListPage"
import { MAISON_PATHS } from "@/lib/maisonShared"

export const revalidate = 60

export const metadata: Metadata = {
    title: "Kozaki Maison Carinii — skórzane kozaki i oficerki",
    description: "Kozaki Maison Carinii: awangardowe projekty o rzeźbiarskich proporcjach, wykonane z najszlachetniejszych skór.",
    alternates: { canonical: MAISON_PATHS.kozaki },
}

export default function Page() {
    return <MaisonListPage scope="kozaki" />
}
