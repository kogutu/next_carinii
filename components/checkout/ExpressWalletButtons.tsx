'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
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

    if (shippingMethod === COD_SHIPPING_METHOD || (!showGoogle && !showApple)) return null

    const buttonClass =
        'h-11 rounded-md bg-black text-white text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="h-px flex-1 bg-gray-200" />
                lub zapłać od razu
                <span className="h-px flex-1 bg-gray-200" />
            </div>
            <div className={`grid gap-2 ${showGoogle && showApple ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {showGoogle && (
                    <button type="button" disabled={isBusy} onClick={() => onPay('googlepay')} className={buttonClass} aria-label="Zapłać z Google Pay">
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Google Pay'}
                    </button>
                )}
                {showApple && (
                    <button type="button" disabled={isBusy} onClick={() => onPay('applepay')} className={buttonClass} aria-label="Zapłać z Apple Pay">
                        {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apple Pay'}
                    </button>
                )}
            </div>
        </div>
    )
}
