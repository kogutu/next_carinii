'use client'

import { useEffect, useRef, useState } from 'react'
import { tpayPublicConfig } from '@/lib/payments/config'
import { PaymentRequestError, payWithWallet, waitForPayment } from '@/lib/tpay/browser-api'
import { BASE_REQUEST, googleApi, isGooglePayCanceled, loadGooglePayScript, toBase64 } from '@/lib/google-pay'

// toBase64 jest używane też przez przycisk Apple Pay
export { toBase64 }

const allowedPaymentMethods = () => [
    {
        type: 'CARD',
        parameters: {
            allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
            allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
            type: 'PAYMENT_GATEWAY',
            parameters: { gateway: 'tpaycom', gatewayMerchantId: tpayPublicConfig.merchantId },
        },
    },
]

type GooglePayTpayButtonProps = {
    oid: string
    amount: number
    onPaid: () => void
}

export default function GooglePayTpayButton({ oid, amount, onPaid }: GooglePayTpayButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    // najświeższa kwota/callback bez ponownego tworzenia przycisku Google
    const latest = useRef({ oid, amount, onPaid })
    latest.current = { oid, amount, onPaid }

    useEffect(() => {
        if (!tpayPublicConfig.merchantId) {
            console.warn('[tpay] Brak NEXT_PUBLIC_TPAY_MERCHANT_ID — Google Pay jest ukryte')
            return
        }

        let cancelled = false

        const pay = async (client: any) => {
            setError('')
            setIsProcessing(true)
            try {
                const paymentData = await client.loadPaymentData({
                    ...BASE_REQUEST,
                    allowedPaymentMethods: allowedPaymentMethods(),
                    merchantInfo: {
                        merchantName: 'Carinii',
                        ...(tpayPublicConfig.googleMerchantId ? { merchantId: tpayPublicConfig.googleMerchantId } : {}),
                    },
                    transactionInfo: {
                        totalPriceStatus: 'FINAL',
                        totalPrice: latest.current.amount.toFixed(2),
                        currencyCode: 'PLN',
                        countryCode: 'PL',
                    },
                })
                const token = paymentData.paymentMethodData.tokenizationData.token
                const result = await payWithWallet(latest.current.oid, 'googlepay', toBase64(token))

                if (result.status === 'paid') return latest.current.onPaid()
                // wymagane 3DS
                if (result.status === 'pending' && result.redirectUrl) {
                    window.location.href = result.redirectUrl
                    return
                }
                if (result.status === 'pending') {
                    const status = await waitForPayment(latest.current.oid, result.transactionId)
                    if (status === 'paid') return latest.current.onPaid()
                }
                setError('Płatność Google Pay nie została zrealizowana.')
            } catch (err) {
                // zamknięcie okna Google Pay przez klienta to nie błąd
                if (isGooglePayCanceled(err)) return
                setError(err instanceof PaymentRequestError ? err.message : 'Płatność Google Pay nie powiodła się.')
            } finally {
                if (!cancelled) setIsProcessing(false)
            }
        }

        const init = async () => {
            await loadGooglePayScript()
            if (cancelled || !containerRef.current) return

            const client = new (googleApi().payments.api.PaymentsClient)({
                environment: tpayPublicConfig.environment === 'production' ? 'PRODUCTION' : 'TEST',
            })
            const { result } = await client.isReadyToPay({
                ...BASE_REQUEST,
                allowedPaymentMethods: allowedPaymentMethods(),
            })
            if (!result || cancelled || !containerRef.current) return

            containerRef.current.replaceChildren(
                client.createButton({
                    onClick: () => pay(client),
                    allowedPaymentMethods: allowedPaymentMethods(),
                    buttonType: 'pay',
                    buttonSizeMode: 'fill',
                }),
            )
        }

        init().catch((err) => console.error('[tpay] Google Pay init failed:', err))
        return () => {
            cancelled = true
        }
    }, [])

    return (
        <div className="space-y-2 w-full max-w-xs">
            <div ref={containerRef} className={isProcessing ? 'opacity-50 pointer-events-none' : ''} />
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
