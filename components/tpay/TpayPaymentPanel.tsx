'use client'

import { useEffect, useState } from 'react'
import { CreditCard } from 'lucide-react'
import { ApplePayMark, GooglePayMark, MastercardIcon, PayPoIcon, VisaIcon } from '../payments/BrandIcons'
import { paymentConfig } from '@/lib/payments/config'
import TpayBlikPayment from './TpayBlikPayment'
import TpayRedirectButton from './TpayRedirectButton'
import GooglePayTpayButton from './GooglePayTpayButton'
import P24GooglePayButton from '../p24/P24GooglePayButton'
import ApplePayTpayButton, { AppleUnavailableNote } from './ApplePayTpayButton'
import { isNativeApplePay } from '@/lib/tpay/apple-sdk'

type TpayPaymentPanelProps = {
    // kod metody płatności zapisany w zamówieniu
    code: string
    oid: string
    amount: number
    onPaid: () => void
}

export const isTpayHandledCode = (code: string): boolean =>
    code === 'tpay_blik' || code === 'tpay_card' || code === 'tpay' || (code === 'purchaseorder' && paymentConfig.paypo === 'tpay')

// Apple Pay działa tylko w Safari / na urządzeniach Apple — poza nimi przycisk byłby ślepym zaułkiem
const useAppleDevice = (): boolean => {
    const [isApple, setIsApple] = useState(false)
    useEffect(() => {
        setIsApple(isNativeApplePay())
    }, [])
    return isApple
}

type WalletButtonsProps = Pick<TpayPaymentPanelProps, 'oid' | 'amount' | 'onPaid'>

const WalletButtons = ({ oid, amount, onPaid }: WalletButtonsProps) => {
    const isAppleDevice = useAppleDevice()

    return (
        <>
            {paymentConfig.googlepay === 'p24' && <P24GooglePayButton oid={oid} amount={amount} onPaid={onPaid} />}
            {paymentConfig.googlepay === 'tpay' && (
                paymentConfig.googlepayMode === 'onsite'
                    ? <GooglePayTpayButton oid={oid} amount={amount} onPaid={onPaid} />
                    : (
                        <TpayRedirectButton oid={oid} method="googlepay" align="center">
                            Zapłać z <GooglePayMark className="text-base" />
                        </TpayRedirectButton>
                    )
            )}
            {paymentConfig.applepay === 'tpay' && (
                paymentConfig.applepayMode === 'onsite'
                    ? <ApplePayTpayButton oid={oid} amount={amount} onPaid={onPaid} />
                    : isAppleDevice
                        ? (
                            <TpayRedirectButton oid={oid} method="applepay" align="center">
                                Zapłać z <ApplePayMark className="text-base" />
                            </TpayRedirectButton>
                        )
                        : <AppleUnavailableNote />
            )}
        </>
    )
}

// Sposób opłacenia zamówienia przez Tpay — zależny od kodu metody i od ustawień w .env
export default function TpayPaymentPanel({ code, oid, amount, onPaid }: TpayPaymentPanelProps) {
    if (code === 'tpay_blik') return <TpayBlikPayment oid={oid} onPaid={onPaid} />

    if (code === 'tpay_card') {
        return (
            <div className="flex flex-col gap-3">
                {paymentConfig.card === 'tpay' && (
                    <TpayRedirectButton oid={oid} method="card" logos={<><VisaIcon /><MastercardIcon /></>}>
                        <CreditCard className="size-4" aria-hidden="true" /> Zapłać kartą
                    </TpayRedirectButton>
                )}
                <WalletButtons oid={oid} amount={amount} onPaid={onPaid} />
            </div>
        )
    }

    if (code === 'tpay') return <TpayRedirectButton oid={oid} method="tpay">Zapłać przez Tpay</TpayRedirectButton>

    if (code === 'purchaseorder' && paymentConfig.paypo === 'tpay') {
        return (
            <TpayRedirectButton oid={oid} method="paypo" tone="light" logos={<PayPoIcon />}>
                Zapłać z
            </TpayRedirectButton>
        )
    }

    return null
}
