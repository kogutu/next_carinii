import { buildProductJsonLd } from '@/lib/json-ld'
import { JsonLd } from '@/components/json-ld'

interface ProductJsonLdProps {
    product: any
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
    return <JsonLd data={buildProductJsonLd(product)} />
}
