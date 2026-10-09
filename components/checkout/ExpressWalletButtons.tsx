'use client'

import { useEffect, useState } from 'react'
import PayButton from '../payments/PayButton'
import { ApplePayMark, GooglePayMark } from '../payments/BrandIcons'
import WalletPlaceholder from '../payments/WalletPlaceholder'
import { paymentConfig } from '@/lib/payments/config'
import { isNativeApplePay } from '@/lib/tpay/apple-sdk'

export type ExpressWallet = 'googlepay' | 'applepay'

// Płatności online są niedostępne przy kurierze za pobraniem (ta sama reguła co w liście metod)
const COD_SHIPPING_METHOD = 'flatrate48_flatrate48'

type ExpressWalletButtonsProps = {
    shippingMethod: string
    isBusy: boolean
    onPay: (wallet: ExpressWallet) => void
}

// Szybka płatność już w koszyku: zamówienie jest składane z metodą „Płatność kartą”, a klient od razu
// trafia do Google Pay / Apple Pay w panelu Tpay (bez dodatkowego kroku na stronie zamówienia).
export default function ExpressWalletButtons({ shippingMethod, isBusy, onPay }: ExpressWalletButtonsProps) {
    const [isAppleDevice, setIsAppleDevice] = useState(false)

    useEffect(() => {
        setIsAppleDevice(isNativeApplePay())
    }, [])

    const showGoogle = paymentConfig.googlepay === 'tpay'
    // Apple Pay w panelu Tpay działa w Safari / na urządzeniach Apple; gdzie indziej płatność kodem QR jest na stronie zamówienia
    const showApple = paymentConfig.applepay === 'tpay' && isAppleDevice

    if (shippingMethod === COD_SHIPPING_METHOD || paymentConfig.express !== 'on') return null

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                lub zapłać od razu
                <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {showGoogle ? (
                    <PayButton align="center" isLoading={isBusy} loadingLabel="Chwila…" onClick={() => onPay('googlepay')} aria-label="Zapłać z Google Pay">
                        <GooglePayMark className="text-base" />
                    </PayButton>
                ) : (
                    <WalletPlaceholder wallet="googlepay" />
                )}
                {showApple ? (
                    <PayButton align="center" isLoading={isBusy} loadingLabel="Chwila…" onClick={() => onPay('applepay')} aria-label="Zapłać z Apple Pay">
                        <ApplePayMark className="text-base" />
                    </PayButton>
                ) : (
                    <WalletPlaceholder wallet="applepay" note={paymentConfig.applepay === 'tpay' ? 'Safari / iOS' : 'wkrótce'} />
                )}
            </div>
        </div>
    )
}
