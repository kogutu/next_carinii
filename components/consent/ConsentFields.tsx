'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

export type ConsentState = {
    terms: boolean
    marketing: boolean
}

export const EMPTY_CONSENT: ConsentState = { terms: false, marketing: false }

type ConsentFieldsProps = {
    value: ConsentState
    onChange: (next: ConsentState) => void
    // unikalny przedrostek id, bo na jednej stronie bywa kilka formularzy (modal + strona)
    idPrefix: string
    // jakimi kanałami wysyłamy marketing: sam e-mail albo e-mail i SMS (gdy formularz zbiera telefon)
    channels?: 'email' | 'email-sms'
    // komunikat pod zgodą na regulamin (np. po próbie wysłania bez zaznaczenia)
    termsError?: string
    disabled?: boolean
    className?: string
}

const LINK_CLASS = 'underline underline-offset-4 hover:text-foreground'

// Dwie osobne zgody (RODO: zgoda marketingowa jest dobrowolna i nie może być wymuszona ani połączona z regulaminem):
// 1) regulamin i polityka prywatności — wymagana do wysłania formularza,
// 2) informacje handlowe — opcjonalna, domyślnie niezaznaczona.
export default function ConsentFields({ value, onChange, idPrefix, channels = 'email', termsError, disabled, className }: ConsentFieldsProps) {
    const termsId = `${idPrefix}-terms`
    const marketingId = `${idPrefix}-marketing`
    const channelLabel = channels === 'email-sms' ? 'e-mailem i SMS-em' : 'e-mailem'

    return (
        <div className={cn('space-y-3', className)}>
            <div>
                <label htmlFor={termsId} className="flex cursor-pointer items-start gap-3">
                    <input
                        id={termsId}
                        type="checkbox"
                        checked={value.terms}
                        disabled={disabled}
                        aria-invalid={Boolean(termsError)}
                        aria-describedby={termsError ? `${termsId}-error` : undefined}
                        onChange={(event) => onChange({ ...value, terms: event.target.checked })}
                        className="mt-0.5 size-5 shrink-0 accent-black"
                    />
                    <span className={cn('text-pretty text-xs leading-relaxed', termsError ? 'text-destructive' : 'text-muted-foreground')}>
                        <span className="font-semibold">*</span> Akceptuję{' '}
                        <Link href="/regulamin" target="_blank" rel="noopener" className={LINK_CLASS}>regulamin sklepu</Link>
                        {' '}i zapoznałem(-am) się z{' '}
                        <Link href="/polityka-prywatnosci" target="_blank" rel="noopener" className={LINK_CLASS}>polityką prywatności</Link>.
                    </span>
                </label>
                {termsError && (
                    <p id={`${termsId}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
                        {termsError}
                    </p>
                )}
            </div>

            <label htmlFor={marketingId} className="flex cursor-pointer items-start gap-3">
                <input
                    id={marketingId}
                    type="checkbox"
                    checked={value.marketing}
                    disabled={disabled}
                    onChange={(event) => onChange({ ...value, marketing: event.target.checked })}
                    className="mt-0.5 size-5 shrink-0 accent-black"
                />
                <span className="text-pretty text-xs leading-relaxed text-muted-foreground">
                    Chcę otrzymywać {channelLabel} informacje handlowe o nowościach, promocjach i wyprzedażach Carinii
                    (zgoda dobrowolna; mogę ją wycofać w każdej chwili).
                </span>
            </label>
        </div>
    )
}
