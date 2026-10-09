'use client'

import { useEffect, useState } from 'react'
import { Banknote, CreditCard, Building2, Wallet } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { cn } from '@/lib/utils'
import { getPaymentMethods } from '@/lib/payments/methods'
import { paymentConfig } from '@/lib/payments/config'
import { ApplePayBadge, BlikIcon, GooglePayBadge, MastercardIcon, PayPoIcon, VisaIcon } from '../payments/BrandIcons'



const blikIcon = <BlikIcon className="w-12" />

const cardIcon = (
    <span className="flex flex-wrap items-center justify-end gap-1">
        {paymentConfig.card === 'tpay' && <><VisaIcon /><MastercardIcon /></>}
        {paymentConfig.googlepay !== 'off' && <GooglePayBadge />}
        {paymentConfig.applepay === 'tpay' && <ApplePayBadge />}
    </span>
)

const tpayIcon = <span className="text-lg font-bold lowercase text-foreground">tpay</span>

export const methodIcons: Record<string, React.ReactNode> = {
    checkmo: <Banknote className="w-5 h-5 text-foreground" />,
    dialcom_przelewy: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#D9001D" />
            <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">P24</text>
        </svg>
    ),
    devbackblik: blikIcon,
    tpay_blik: blikIcon,
    tpay_card: cardIcon,
    tpay: tpayIcon,
    carinii_sklep: (<svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"> <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /> <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.6 19.1 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.6 6.3 14.7z" /> <path fill="#FBBC04" d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.4 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.6 41.4 15.2 46 24 46z" /> <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.7 7.5l6.5 5.5C40.6 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" /> </svg>),
    banktransfer: <Building2 className="w-5 h-5 text-foreground" />,
    cashondelivery: <Wallet className="w-5 h-5 text-foreground" />,
    payu_account: (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 145" width="47px"><path fill="#A6C307" d="m267.9 30.2h-17.2c-1.9 0-3.4 1.5-3.4 3.4v2.4h1.2c7.8 0 10.7 1.3 10.7 8.4v10.1h8.7c1.9 0 3.4-1.5 3.4-3.4l0.1-17.5c0-1.8-1.6-3.4-3.4-3.4zm-94.1 27.1c-0.8-1-2.3-1.1-3.8-1.1h-1.1c-3.8 0-5.2 1.1-6.1 4.7l-10.4 43.4c-1.3 5.3-3.1 6.3-6.3 6.3-3.8 0-5.3-0.9-6.9-6.3l-11.8-43.4c-0.9-3.6-2.4-4.7-6.1-4.7h-1.1c-1.5 0-3 0.1-3.8 1.1-0.7 1-0.5 2.5-0.1 4l12 43.8c2.2 8.3 4.9 15.3 14.8 15.3 1.9 0 3.6-0.3 5-0.8-3 9.5-6.1 13.7-15.1 14.6-1.8 0.2-3 0.5-3.7 1.4-0.7 0.9-0.5 2.2-0.3 3.4l0.3 1.1c0.5 2.6 1.4 4.2 4.3 4.2q0.5 0 1 0c13.5-0.9 20.8-8.2 25-25.2l14.5-57.8c0.3-1.5 0.5-3-0.3-4zm-88.9-3c-7.4 0-12 1-13.7 1.3-3.1 0.7-4.4 1.5-4.4 5.1v1c0 1.3 0.2 2.3 0.6 3q0.8 1.2 2.5 1.2 0.8 0 1.9-0.3c1.8-0.5 7.4-1.4 13.6-1.4 11.2 0 15.7 3.1 15.7 10.7v6.7h-14c-18.1 0-26.5 6.1-26.5 19.2 0 12.6 8.7 19.6 24.4 19.6 18.8 0 27.1-6.4 27.1-20.6v-24.9c0-13.9-8.9-20.6-27.2-20.6zm16.2 36.3v8.8c0 7.1-2.7 11.2-16.2 11.2-8.9 0-13.3-3.2-13.3-9.8 0-7.3 4.4-10.2 15.6-10.2zm-68.2-54.6h-18.6c-10 0-14.4 4.4-14.4 14.4v63.9c0 3.8 1.2 5 5.1 5h1.2c3.9 0 5.1-1.2 5.1-5v-24.9h21.6c19.1 0 28-8.5 28-26.7 0-18.2-8.9-26.7-28-26.7zm16.6 26.7c0 10.4-2.6 16.1-16.6 16.1h-21.6v-26.9c0-3.7 1.4-5.1 5.1-5.1h16.5c10.5 0 16.6 2.6 16.6 15.9zm220-50.5h-8.7c-0.9 0-1.7-0.7-1.7-1.7v-8.8c0-0.9 0.8-1.7 1.7-1.7h8.7c1 0 1.7 0.8 1.7 1.7v8.8c0 1-0.7 1.7-1.7 1.7zm17.1 18h-12.8c-1.4 0-2.6-1.1-2.6-2.5l0.1-12.9c0-1.4 1.1-2.6 2.5-2.6h12.8c1.4 0 2.5 1.2 2.5 2.6v12.9c0 1.4-1.1 2.5-2.5 2.5zm-36 24.3c-1.9 0-3.4-1.6-3.4-3.4v-15.1h-1.2c-7.8 0-10.7 1.3-10.7 8.4v16.6q0 0 0 0.1v3.6q0 0.2 0 0.4v23.2c0 2.8-0.6 5-1.7 6.8-2.1 3.3-6.3 4.7-13 4.7-6.8 0-10.9-1.4-13.1-4.7-1.1-1.8-1.6-4-1.6-6.8v-23.2q0-0.2-0.1-0.4v-3.6q0-0.1 0-0.1v-16.6c0-7.1-2.9-8.4-10.6-8.4h-2.5c-7.8 0-10.6 1.3-10.6 8.4v43.9c0 7 1.5 13 4.6 17.8 6 9.3 17.5 14.3 33.8 14.3q0 0 0.1 0 0 0 0 0c16.4 0 27.9-5 33.8-14.3 3.1-4.8 4.7-10.8 4.7-17.8v-33.8z" /></svg>
    ),
    purchaseorder: <PayPoIcon />,

}

type PaymentMethodProps = {
    onMethodChange: (method: string) => void
    shippingMethod: string
    init?: string
    lastUsed?: string
    error?: string
}

export default function PaymentMethod({ onMethodChange, shippingMethod, init, lastUsed, error }: PaymentMethodProps) {
    const paymentMethods = getPaymentMethods()
    const [payment, setPayment] = useState(init ?? paymentMethods[0]?.code ?? '')

    const handleChange = (code: string) => {
        setPayment(code)
        onMethodChange(code)
    }

    const filteredPaymentMethods = paymentMethods.filter((method: any) => {
        const hasWildcard = method.shipping_methods[0] === '*'
        const hasShippingMethod = method.shipping_methods.includes(shippingMethod)
        const isExcluded = method.exclude_hipping_methods.includes(shippingMethod)

        return (hasWildcard || hasShippingMethod) && !isExcluded
    })

    // Zmiana wysyłki może wykluczyć wybraną płatność (np. pobranie) — wybierz pierwszą dostępną
    useEffect(() => {
        const stillAvailable = filteredPaymentMethods.some((method: any) => method.code === payment)
        if (!stillAvailable && filteredPaymentMethods.length > 0) {
            handleChange(filteredPaymentMethods[0].code)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shippingMethod])

    const selected = filteredPaymentMethods.find((m: any) => m.code === payment)

    return (
        <div id="section-payment" className="scroll-mt-24">
            <SectionHeader step={3} title="Metoda płatności" complete={!error} hasErrors={!!error} />

            <div role="radiogroup" aria-label="Metoda płatności" className="grid gap-3">
                {filteredPaymentMethods.map((method: any) => {
                    const isSelected = payment === method.code

                    return (
                        <label
                            key={method.code}
                            className={cn(
                                'block cursor-pointer rounded-xl border-2 p-4 transition-colors motion-reduce:transition-none',
                                isSelected ? 'border-foreground bg-muted/60' : 'border-border hover:border-foreground/50',
                            )}
                        >
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={isSelected}
                                    onChange={() => handleChange(method.code)}
                                    className="size-4 shrink-0 accent-black"
                                />
                                <p className="min-w-0 flex-1 font-semibold text-foreground" data-method={method.code}>
                                    {method.title}
                                </p>
                                <span className="flex items-center">
                                    {methodIcons[method.code] ?? <CreditCard className="size-5 text-foreground" aria-hidden="true" />}
                                </span>
                            </div>
                            {lastUsed === method.code && isSelected && (
                                <span className="mt-2 block pl-8 text-[10px] uppercase tracking-wide text-muted-foreground">Ostatnio używane</span>
                            )}
                            {selected?.description && selected.code === method.code && (
                                <div className="mt-3 whitespace-pre-line text-pretty pl-8 text-sm text-muted-foreground">
                                    {selected.description}
                                </div>
                            )}
                        </label>
                    )
                })}
            </div>
            {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
    )
}
