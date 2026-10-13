import type { Metadata } from 'next'
import { ENTER, EYEBROW } from '@/components/ui/surface'
import WithdrawalForm from '@/components/withdrawal/WithdrawalForm'
import { cn } from '@/lib/utils'
import { WITHDRAW_DAYS, WITHDRAW_LABEL, WITHDRAW_PATH } from '@/lib/withdrawal'

export const metadata: Metadata = {
  title: `${WITHDRAW_LABEL} | Carinii`,
  description: `Odstąp od umowy zakupu w Carinii online. Wystarczy imię i nazwisko, numer zamówienia i e-mail, bez konta i bez podawania przyczyny. Potwierdzenie dostaniesz mailem.`,
  alternates: { canonical: WITHDRAW_PATH },
}

type PageProps = {
  searchParams: Promise<{ order?: string }>
}

export default async function WithdrawalPage({ searchParams }: PageProps) {
  const { order } = await searchParams

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-16">
        <header className={cn(ENTER, 'mb-10')}>
          <p className={EYEBROW}>Odstąpienie od umowy</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{WITHDRAW_LABEL}</h1>
          <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground">
            Masz {WITHDRAW_DAYS} dni na odstąpienie od umowy zakupu bez podawania przyczyny. Podaj imię i nazwisko, numer zamówienia oraz adres e-mail użyty przy zakupie. Potwierdzenie z datą i godziną
            otrzymasz od razu na ten adres.
          </p>
        </header>

        <WithdrawalForm initialOrder={typeof order === 'string' ? order.slice(0, 40) : ''} />
      </div>
    </main>
  )
}
