'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
        <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
            <label className="block text-sm text-gray-700">
                Kod BLIK (6 cyfr z aplikacji banku)
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000 000"
                    disabled={isBusy}
                    className="mt-1 w-full px-3 py-3 border border-gray-300 rounded-md text-lg tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#441c49]"
                />
            </label>

            <Button type="submit" disabled={!isCodeValid || isBusy} className="bg-black hover:bg-gray-800 text-white" size="lg">
                {isBusy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Przetwarzanie…</> : 'Zapłać BLIK'}
            </Button>

            {phase === 'waiting' && (
                <p role="status" className="text-sm text-gray-700">
                    Potwierdź płatność w aplikacji swojego banku. Nie zamykaj tej strony.
                </p>
            )}
            {phase === 'timeout' && (
                <p role="status" className="text-sm text-amber-700">
                    Nie widzimy jeszcze potwierdzenia. Jeśli zatwierdziłeś płatność w banku, odśwież stronę za chwilę —
                    status zamówienia zaktualizuje się automatycznie.
                </p>
            )}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </form>
    )
}
