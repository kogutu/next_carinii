'use client'

import CategoryPageSkeleton from '@/components/skeletons/CategoryPageSkeleton'
import CmsPageSkeleton from '@/components/skeletons/CmsPageSkeleton'
import { usePageKind } from '@/components/skeletons/PageKindContext'
import ProductPageSkeleton from '@/components/skeletons/ProductPageSkeleton'

// Instant skeleton pokazywany przez App Router w trakcie SSR docelowej strony (kategoria / produkt / CMS).
// Dzięki temu klik w link daje natychmiastowy feedback, a pasek postępu z RouteListener tylko uzupełnia go
// przy wolniejszych przejściach. Szkielet zależy od typu strony (pageMetadata.type z layoutu), bo każdy ma inny układ.
export default function Loading() {
    const kind = usePageKind()
    if (kind === 'product') return <ProductPageSkeleton />
    if (kind === 'cms_page') return <CmsPageSkeleton />
    return <CategoryPageSkeleton />
}
