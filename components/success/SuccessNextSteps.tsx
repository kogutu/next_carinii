import { EYEBROW } from '@/components/ui/surface'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type StepState = 'done' | 'current' | 'upcoming'

type Step = {
  title: string
  description: string
  state: StepState
}

type SuccessNextStepsProps = {
  email: string
  isPaid: boolean
  // płatność przy odbiorze / pobraniu — nie ma czego opłacać na tej stronie
  paysOnDelivery: boolean
}

const buildSteps = ({ email, isPaid, paysOnDelivery }: SuccessNextStepsProps): Step[] => {
  const paymentStep: Step = paysOnDelivery
    ? { title: 'Płatność przy odbiorze', description: 'Zapłacisz, gdy odbierzesz zamówienie.', state: 'upcoming' }
    : isPaid
      ? { title: 'Płatność przyjęta', description: 'Dziękujemy, wszystko się zgadza.', state: 'done' }
      : { title: 'Opłać zamówienie', description: 'Wybierz sposób płatności w panelu powyżej.', state: 'current' }

  return [
    {
      title: 'Potwierdzenie zamówienia',
      description: email ? `Wysłaliśmy je na ${email}.` : 'Wysłaliśmy je na Twój adres e-mail.',
      state: 'done',
    },
    paymentStep,
    {
      title: 'Wysyłka',
      description: 'Gdy zamówienie będzie gotowe do wysyłki, prześlemy Ci numer listu przewozowego.',
      state: 'upcoming',
    },
  ]
}

export function SuccessNextSteps(props: SuccessNextStepsProps) {
  const steps = buildSteps(props)

  return (
    <section aria-labelledby="next-steps-title">
      <h2 id="next-steps-title" className={EYEBROW}>
        Co dalej
      </h2>
      <ol className="mt-5">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex gap-4 pb-6 last:pb-0">
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-3 top-7 h-[calc(100%-1.75rem)] w-px bg-border" />
            )}
            <span
              aria-hidden="true"
              className={cn(
                'relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                step.state === 'done' && 'bg-primary text-primary-foreground',
                step.state === 'current' && 'bg-background text-foreground ring-2 ring-foreground',
                step.state === 'upcoming' && 'bg-muted text-muted-foreground',
              )}
            >
              {step.state === 'done' ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className={cn('text-sm font-semibold', step.state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground')}>
                {step.title}
              </p>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
