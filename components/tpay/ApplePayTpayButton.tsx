'use client'

import { useEffect, useRef, useState } from 'react'
import { tpayPublicConfig } from '@/lib/payments/config'
import { PaymentRequestError, createApplePaySession, payWithWallet, waitForPayment } from '@/lib/tpay/browser-api'
import { detectApplePay } from '@/lib/tpay/apple-sdk'
import { toBase64 } from './GooglePayTpayButton'
import AppleButton from './AppleButton'

declare global {
    interface Window {
        ApplePaySession?: any
    }
}

const PREFERRED_VERSIONS = [6, 5, 4, 3]
const DISPLAY_NAME = 'Carinii'

// Komunikat zamiast cichego ukrywania opcji (np. Safari bez karty w Wallet albo przeglądarka bez obsługi)
export const AppleUnavailableNote = () => (
    <p className="text-pretty text-xs text-muted-foreground">
        Apple Pay jest tu niedostępny. Wymaga połączenia HTTPS oraz Safari albo przeglądarki z iPhonem skanującym kod QR (karta dodana do Wallet).
    </p>
)

type ApplePayTpayButtonProps = {
    oid: string
    amount: number
    onPaid: () => void
}

// Apple Pay na stronie (Apple Pay JS). W Chrome/Edge/Firefox działa przez kod QR (SDK Apple).
export default function ApplePayTpayButton({ oid, amount, onPaid }: ApplePayTpayButtonProps) {
    const [availability, setAvailability] = useState<'checking' | 'available' | 'unavailable'>('checking')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const latest = useRef({ oid, amount, onPaid })
    latest.current = { oid, amount, onPaid }

    useEffect(() => {
        let cancelled = false
        detectApplePay().then((available) => {
            if (!cancelled) setAvailability(available ? 'available' : 'unavailable')
        })
        return () => {
            cancelled = true
        }
    }, [])

    if (availability === 'checking') return null
    if (availability === 'unavailable') return <AppleUnavailableNote />

    const startPayment = () => {
        const ApplePaySession = window.ApplePaySession
        const version = PREFERRED_VERSIONS.find((v) => ApplePaySession.supportsVersion(v)) ?? 3

        const session = new ApplePaySession(version, {
            countryCode: 'PL',
            currencyCode: 'PLN',
            supportedNetworks: ['visa', 'masterCard'],
            merchantCapabilities: ['supports3DS'],
            total: { label: DISPLAY_NAME, amount: latest.current.amount.toFixed(2) },
        })

        setError('')
        setIsProcessing(true)

        session.onvalidatemerchant = async (event: { validationURL: string }) => {
            try {
                const { session: merchantSession } = await createApplePaySession(event.validationURL)

                // Bez sesji od Tpay: uzupełnienie walidacji danymi domeny (umożliwia płatność kodem QR na iPhonie/iPadzie)
                const merchantId = tpayPublicConfig.appleMerchantId
                if (!merchantSession && !merchantId) throw new Error('Brak sesji Apple Pay')

                session.completeMerchantValidation(
                    merchantSession ?? {
                        merchantIdentifier: merchantId,
                        displayName: DISPLAY_NAME,
                        initiative: 'web',
                        initiativeContext: window.location.hostname,
                    },
                )
            } catch {
                session.abort()
                setError('Nie udało się uruchomić Apple Pay. Wybierz inną metodę płatności.')
                setIsProcessing(false)
            }
        }

        session.onpaymentauthorized = async (event: { payment: { token: { paymentData: unknown } } }) => {
            try {
                const token = toBase64(JSON.stringify(event.payment.token.paymentData))
                const result = await payWithWallet(latest.current.oid, 'applepay', token)

                if (result.status === 'failed') {
                    session.completePayment(ApplePaySession.STATUS_FAILURE)
                    setError('Płatność Apple Pay została odrzucona.')
                    return
                }
                session.completePayment(ApplePaySession.STATUS_SUCCESS)

                if (result.status === 'paid') return latest.current.onPaid()
                // wymagane 3DS
                if (result.redirectUrl) {
                    window.location.href = result.redirectUrl
                    return
                }
                if ((await waitForPayment(latest.current.oid, result.transactionId)) === 'paid') {
                    return latest.current.onPaid()
                }
                setError('Nie widzimy jeszcze potwierdzenia płatności. Odśwież stronę za chwilę.')
            } catch (err) {
                session.completePayment(ApplePaySession.STATUS_FAILURE)
                setError(err instanceof PaymentRequestError ? err.message : 'Płatność Apple Pay nie powiodła się.')
            } finally {
                setIsProcessing(false)
            }
        }

        session.oncancel = () => setIsProcessing(false)
        session.begin()
    }

    return (
        <div className="w-full space-y-2">
            {/* oficjalny element Apple (SDK): ten sam przycisk w Safari i w innych przeglądarkach */}
            <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                <AppleButton type="pay" onPress={startPayment} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
