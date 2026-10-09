import { EYEBROW } from '@/components/ui/surface'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import { CopyOrderNumber } from './CopyOrderNumber'

type SuccessHeaderProps = {
  incrementId: string
  firstName: string
  email: string
  isPaid: boolean
}

export function SuccessHeader({ incrementId, firstName, email, isPaid }: SuccessHeaderProps) {
  return (
    <header className="max-w-3xl">
      <p className={cn(EYEBROW, 'flex items-center gap-3')}>
        <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
        </span>
        Zamówienie przyjęte
      </p>

      <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        {firstName ? `Dziękujemy, ${firstName}!` : 'Dziękujemy za zamówienie!'}
      </h1>

      <p className="mt-4 max-w-xl text-pretty text-base text-muted-foreground">
        {isPaid
          ? 'Płatność dotarła do nas. Szczegóły i kolejne kroki znajdziesz poniżej.'
          : 'Zamówienie jest już w naszym systemie. Szczegóły i kolejne kroki znajdziesz poniżej.'}
        {email && <> Potwierdzenie wysłaliśmy na <span className="font-medium text-foreground">{email}</span>.</>}
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Numer zamówienia</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{incrementId}</p>
        </div>
        <CopyOrderNumber value={incrementId} />
      </div>
    </header>
  )
}
