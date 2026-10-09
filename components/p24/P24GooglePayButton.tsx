'use client'

import { useEffect, useRef, useState } from 'react'
import { BASE_REQUEST, isGooglePayCanceled } from '@/lib/google-pay'
import {
    P24PaymentError,
    allowedPaymentMethods,
    chargeWithP24Bundle,
    createPaymentsClient,
    getP24GpayConfig,
    registerP24Payment,
    waitForOrderPaid,
} from '@/lib/p24/gpay-browser'

type P24GooglePayButtonProps = {
    oid: string
    amount: number
    onPaid: () => void
}

// Google Pay na stronie zamówienia, rozliczane przez Przelewy24 (Tpay oferuje on-site Google Pay tylko u agenta Pekao).
export default function P24GooglePayButton({ oid, amount, onPaid }: P24GooglePayButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState('')
    const [status, setStatus] = useState<'idle' | 'processing' | 'confirming'>('idle')
    // najświeższe dane bez ponownego tworzenia przycisku Google
    const latest = useRef({ oid, amount, onPaid })
    latest.current = { oid, amount, onPaid }

    useEffect(() => {
        let cancelled = false

        const pay = async (config: Awaited<ReturnType<typeof getP24GpayConfig>>, client: any) => {
            setError('')
            setStatus('processing')
            try {
                const paymentData = await client.loadPaymentData({
                    ...BASE_REQUEST,
                    allowedPaymentMethods: allowedPaymentMethods(config),
                    merchantInfo: { merchantName: config.merchantName },
                    transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPrice: latest.current.amount.toFixed(2),
                        currencyCode: 'PLN',
                        countryCode: 'PL',
                    },
                })
                const googleToken = paymentData.paymentMethodData.tokenizationData.token

                const p24Token = await registerP24Payment(latest.current.oid, googleToken, latest.current.amount)
                await chargeWithP24Bundle(config.baseUrl, p24Token)

                setStatus('confirming')
                if (await waitForOrderPaid(latest.current.oid)) return latest.current.onPaid()
                setError('Płatność została wysłana. Potwierdzenie może potrwać chwilę — odśwież stronę za moment.')
            } catch (err) {
                if (isGooglePayCanceled(err)) return
                setError(err instanceof P24PaymentError ? err.message : 'Płatność Google Pay nie powiodła się.')
            } finally {
                if (!cancelled) setStatus('idle')
            }
        }

        const init = async () => {
            const config = await getP24GpayConfig()
            const client = await createPaymentsClient(config)
            if (!client || cancelled || !containerRef.current) return

            containerRef.current.replaceChildren(
                client.createButton({
                    onClick: () => pay(config, client),
                    allowedPaymentMethods: allowedPaymentMethods(config),
                    buttonType: 'pay',
                    buttonSizeMode: 'fill',
                    buttonRadius: 12,
                }),
            )
        }

        init().catch((err) => console.error('[p24] Google Pay init failed:', err))
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="w-full space-y-2">
            <div ref={containerRef} className={`h-11 w-full ${status !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`} />
            {status === 'confirming' && <p role="status" className="text-sm text-muted-foreground">Potwierdzamy płatność…</p>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
