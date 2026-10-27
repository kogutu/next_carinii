import MaisonHeader from "./MaisonHeader"
import MaisonCatalog from "./MaisonCatalog"
import { getMaisonProducts } from "@/lib/maison"
import { MAISON_TITLES, type MaisonScope } from "@/lib/maisonShared"

// Wspólna strona list strefy Maison: Kozaki, Botki i „Odkryj kolekcję” (z filtrem).
export default async function MaisonListPage({ scope }: { scope: MaisonScope }) {
    const products = await getMaisonProducts(scope)

    return (
        <>
            <MaisonHeader />
            <MaisonCatalog products={products} title={MAISON_TITLES[scope]} withFilter={scope === "all"} />
        </>
    )
}
