'use client'

import { useEffect, useRef, useState } from 'react'
import PayButton from '@/components/payments/PayButton'
import { BlikIcon } from '@/components/payments/BrandIcons'
import { PaymentRequestError, startBlikPayment, waitForPayment } from '@/lib/tpay/browser-api'

type Phase = 'idle' | 'starting' | 'waiting' | 'failed' | 'timeout'

type TpayBlikPaymentProps = {
    oid: string
    onPaid: () => void
}

// BLIK Level 0: klient wpisuje 6-cyfrowy kod u nas, potwierdza płatność w aplikacji banku.
export default function TpayBlikPayment({ oid, onPaid }: TpayBlikPaymentProps) {
    const [code, setCode] = useState('')
    const [phase, setPhase] = useState<Phase>('idle')
    const [error, setError] = useState('')
    const abortRef = useRef<AbortController | null>(null)

    useEffect(() => () => abortRef.current?.abort(), [])

    const isBusy = phase === 'starting' || phase === 'waiting'
    const isCodeValid = /^\d{6}$/.test(code)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!isCodeValid || isBusy) return

        setError('')
        setPhase('starting')
        const controller = new AbortController()
        abortRef.current = controller

        try {
            const { transactionId } = await startBlikPayment(oid, code)
            setPhase('waiting')

            const status = await waitForPayment(oid, transactionId, { signal: controller.signal })
            if (controller.signal.aborted) return

            if (status === 'paid') return onPaid()
            if (status === 'failed') {
                setError('Płatność BLIK nie została potwierdzona. Wygeneruj nowy kod i spróbuj ponownie.')
                return setPhase('failed')
            }
            setPhase('timeout')
        } catch (err) {
            setError(err instanceof PaymentRequestError ? err.message : 'Nie udało się zainicjować płatności BLIK.')
            setPhase('failed')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full space-y-3">
            <label className="block text-sm font-medium text-foreground">
                Kod BLIK z aplikacji banku
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000 000"
                    disabled={isBusy}
                    className="mt-2 h-14 w-full rounded-xl border border-input bg-background text-center text-2xl tabular-nums tracking-[0.4em] outline-none transition-shadow placeholder:text-muted-foreground/50 focus-visible:ring-2 focus-visible:ring-ring"
                />
            </label>

            <PayButton type="submit" disabled={!isCodeValid} isLoading={isBusy} loadingLabel="Przetwarzanie…" logos={<BlikIcon className="outline-white/25" />}>
                Zapłać BLIK
            </PayButton>

            {phase === 'waiting' && (
                <p role="status" className="text-pretty text-sm text-muted-foreground">
                    Potwierdź płatność w aplikacji swojego banku. Nie zamykaj tej strony.
                </p>
            )}
            {phase === 'timeout' && (
                <p role="status" className="text-pretty text-sm text-warning">
                    Nie widzimy jeszcze potwierdzenia. Jeśli zatwierdziłeś płatność w banku, odśwież stronę za chwilę —
                    status zamówienia zaktualizuje się automatycznie.
                </p>
            )}
            {error && <p role="alert" className="text-pretty text-sm text-destructive">{error}</p>}
        </form>
    )
}
