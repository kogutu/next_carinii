'use client'

import type { CartItem } from '@/stores/cartZustand'
import { paymentConfig } from '@/lib/payments/config'
import ExpressApplePayButton from './ExpressApplePayButton'
import ExpressGooglePayButton from './ExpressGooglePayButton'
import WalletPlaceholder from '../payments/WalletPlaceholder'

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

    if (paymentConfig.express !== 'on') return null

    return (
        <div className={className}>
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                lub kup od razu
                <span className="h-px flex-1 bg-border" />
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
                    {/* gdy portfel nie jest jeszcze włączony, pokazujemy wyłączony przycisk — widać, gdzie będzie */}
                    {showGoogle
                        ? <ExpressGooglePayButton getItems={getItems} coupon={coupon} onOrderPlaced={onOrderPlaced} />
                        : <WalletPlaceholder wallet="googlepay" />}
                    {showApple
                        ? <ExpressApplePayButton getItems={getItems} coupon={coupon} onOrderPlaced={onOrderPlaced} />
                        : <WalletPlaceholder wallet="applepay" />}
                </div>
            </div>
        </div>
    )
}
