import { notFound } from 'next/navigation'
import { getCachedPageType } from './metadata'

type SlugLayoutProps = {
    children: React.ReactNode
    params: Promise<{ slug: string[] }>
}

// Nieznany adres musi zwrócić prawdziwe HTTP 404. Strona (page.tsx) jest strumieniowana pod loading.tsx,
// więc status 200 wychodzi, zanim zdąży zadziałać notFound() z samej strony. Ten layout leży nad loading.tsx
// i rozstrzyga istnienie adresu przed wysłaniem odpowiedzi; lista adresów jest cache'owana (1 h), a wynik
// getCachedPageType trafia do page.tsx bez ponownego liczenia.
export default async function SlugLayout({ children, params }: SlugLayoutProps) {
    const { slug } = await params

    if (!(await getCachedPageType(slug))) {
        notFound()
    }

    return children
}
