'use client'

import type { CartItem } from '@/stores/cartZustand'
import { paymentConfig } from '@/lib/payments/config'
import ExpressApplePayButton from './ExpressApplePayButton'
import ExpressGooglePayButton from './ExpressGooglePayButton'

type ExpressCheckoutProps = {
    // pozycje do zamówienia w chwili kliknięcia (null = nie można kontynuować, np. brak rozmiaru)
    getItems: () => CartItem[] | null
    coupon?: string
    onOrderPlaced?: () => void
    // przyciski widoczne, ale nieaktywne (np. nie wybrano rozmiaru)
    disabled?: boolean
    // kliknięcie zablokowanych przycisków (np. pokazanie komunikatu o rozmiarze)
    onBlockedClick?: () => void
    className?: string
}

// „Kup od razu”: Apple Pay (Tpay) i Google Pay (Przelewy24) bez przechodzenia przez koszyk i formularz.
export default function ExpressCheckout({ getItems, coupon, onOrderPlaced, disabled, onBlockedClick, className }: ExpressCheckoutProps) {
    // Apple Pay w szybkiej płatności działa tylko na stronie (onsite): wymaga domeny zarejestrowanej w Apple i Tpay.
    // W trybie redirect płatność odbywa się u Tpay, a przycisk bez zamówienia nie ma dokąd przekierować.
    const showApple = paymentConfig.applepay === 'tpay' && paymentConfig.applepayMode === 'onsite'
    // Google Pay on-site działa przez P24; przy Tpay (redirect) szybka płatność jest w koszyku
    const showGoogle = paymentConfig.googlepay === 'p24'

    if (paymentConfig.express !== 'on' || (!showApple && !showGoogle)) return null

    return (
        <div className={className}>
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                <span className="h-px flex-1 bg-gray-200" />
                lub kup od razu
                <span className="h-px flex-1 bg-gray-200" />
            </div>
            {/* przechwytujemy kliknięcie zablokowanych przycisków, żeby pokazać komunikat zamiast cichej bezczynności */}
            <div
                className={disabled ? 'opacity-50' : ''}
                onClickCapture={disabled ? (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onBlockedClick?.()
                } : undefined}
            >
                <div className="grid grid-cols-1 gap-2">
                    {showGoogle && <ExpressGooglePayButton getItems={getItems} coupon={coupon} onOrderPlaced={onOrderPlaced} />}
                    {showApple && <ExpressApplePayButton getItems={getItems} coupon={coupon} onOrderPlaced={onOrderPlaced} />}
                </div>
            </div>
        </div>
    )
}
