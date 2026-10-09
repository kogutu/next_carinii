'use client'

import { useState, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PaymentRequestError, startRedirectPayment, type RedirectMethod } from '@/lib/tpay/browser-api'

type TpayRedirectButtonProps = {
    oid: string
    method: RedirectMethod
    children: ReactNode
    className?: string
}

// Tworzy transakcję w Tpay i przenosi klienta do panelu płatności (karta, Tpay, PayPo).
export default function TpayRedirectButton({ oid, method, children, className }: TpayRedirectButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleClick = async () => {
        setIsLoading(true)
        setError('')

        try {
            const { redirectUrl } = await startRedirectPayment(oid, method)
            if (!redirectUrl) throw new PaymentRequestError('Brak adresu płatności')
            window.location.href = redirectUrl
        } catch (err) {
            setError(err instanceof PaymentRequestError ? err.message : 'Nie udało się rozpocząć płatności.')
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-2">
            <Button onClick={handleClick} disabled={isLoading} size="lg" className={className ?? 'bg-[#441c49] hover:bg-[#3d1841] text-white'}>
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Przekierowuję…</> : children}
            </Button>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
