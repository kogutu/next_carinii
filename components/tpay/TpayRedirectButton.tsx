'use client'

import { useState, type ReactNode } from 'react'
import PayButton from '@/components/payments/PayButton'
import { PaymentRequestError, startRedirectPayment, type RedirectMethod } from '@/lib/tpay/browser-api'

type TpayRedirectButtonProps = {
    oid: string
    method: RedirectMethod
    children: ReactNode
    // znaki płatności po prawej stronie przycisku
    logos?: ReactNode
    tone?: 'dark' | 'light'
    align?: 'between' | 'center'
}

// Tworzy transakcję w Tpay i przenosi klienta do panelu płatności (karta, Tpay, PayPo).
export default function TpayRedirectButton({ oid, method, children, logos, tone, align }: TpayRedirectButtonProps) {
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
        <div className="w-full space-y-2">
            <PayButton onClick={handleClick} isLoading={isLoading} logos={logos} tone={tone} align={align}>
                {children}
            </PayButton>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
