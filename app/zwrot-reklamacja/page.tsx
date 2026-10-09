import type { Metadata } from 'next'
import { ENTER, EYEBROW } from '@/components/ui/surface'
import ReturnRequestForm from '@/components/returns/ReturnRequestForm'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Zgłoś zwrot lub reklamację | Carinii',
  description: 'Zgłoś zwrot lub reklamację zamówienia w Carinii. Wystarczy numer zamówienia i e-mail; możesz dodać zdjęcia.',
}

type PageProps = {
  searchParams: Promise<{ order?: string }>
}

export default async function ReturnRequestPage({ searchParams }: PageProps) {
  const { order } = await searchParams

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <header className={cn(ENTER, 'mb-10')}>
          <p className={EYEBROW}>Zwroty i reklamacje</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Zgłoś zwrot lub reklamację
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Podaj numer zamówienia i adres e-mail, z którego je złożyłeś. Zgłoszenie trafi bezpośrednio do nas, a potwierdzenie dostaniesz mailem.
          </p>
        </header>

        <ReturnRequestForm initialOrder={typeof order === 'string' ? order.slice(0, 40) : ''} />
      </div>
    </main>
  )
}
