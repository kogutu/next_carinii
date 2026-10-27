'use client'

import { usePathname } from 'next/navigation'
import CategoryPageSkeleton from '@/components/skeletons/CategoryPageSkeleton'
import ProductPageSkeleton from '@/components/skeletons/ProductPageSkeleton'
import { isProductPath } from '@/lib/slugKind'

// Instant skeleton pokazywany przez App Router w trakcie SSR docelowej strony (kategoria / produkt / CMS).
// Dzięki temu klik w link daje natychmiastowy feedback, a pasek postępu z RouteListener tylko uzupełnia go
// przy wolniejszych przejściach. Szkielet zależy od adresu, bo produkt i kategoria mają zupełnie inny układ.
export default function Loading() {
    const pathname = usePathname()
    return isProductPath(pathname ?? '') ? <ProductPageSkeleton /> : <CategoryPageSkeleton />
}
