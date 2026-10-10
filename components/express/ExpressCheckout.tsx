'use client'

import { useState } from 'react'
import type { CartItem } from '@/stores/cartZustand'
import ConsentFields, { EMPTY_CONSENT, type ConsentState } from '@/components/consent/ConsentFields'
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

    // Portfel zbiera e-mail i telefon klienta, więc przed jego uruchomieniem wymagamy regulaminu;
    // zgoda marketingowa jest osobna i dobrowolna (trafia do zamówienia i rejestru zgód)
    const [consent, setConsent] = useState<ConsentState>(EMPTY_CONSENT)
    const [termsError, setTermsError] = useState('')

    if (paymentConfig.express !== 'on') return null

    // zgody pokazujemy tylko, gdy któryś portfel jest naprawdę włączony (sam przycisk-zapowiedź niczego nie zbiera)
    const walletLive = showApple || showGoogle
    const blocked = Boolean(disabled) || (walletLive && !consent.terms)

    const handleBlockedClick = () => {
        if (disabled) {
            onBlockedClick?.()
            return
        }
        setTermsError('Aby kupić od razu, zaakceptuj regulamin sklepu.')
    }

    return (
        <div className={className}>
            <div className="mb-3 flex items-center gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                lub kup od razu
                <span className="h-px flex-1 bg-border" />
            </div>
            {walletLive && <ConsentFields
                idPrefix="express"
                channels="email-sms"
                className="mb-3"
                value={consent}
                onChange={(next) => {
                    setConsent(next)
                    if (next.terms) setTermsError('')
                }}
                termsError={termsError}
            />}
            {/* przechwytujemy kliknięcie zablokowanych przycisków, żeby pokazać komunikat zamiast cichej bezczynności */}
            <div
                className={blocked ? 'opacity-50' : ''}
                onClickCapture={blocked ? (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    handleBlockedClick()
                } : undefined}
            >
                <div className="grid grid-cols-1 gap-2">
                    {/* gdy portfel nie jest jeszcze włączony, pokazujemy wyłączony przycisk — widać, gdzie będzie */}
                    {showGoogle
                        ? <ExpressGooglePayButton getItems={getItems} coupon={coupon} agreeToNewsletter={consent.marketing} onOrderPlaced={onOrderPlaced} />
                        : <WalletPlaceholder wallet="googlepay" />}
                    {showApple
                        ? <ExpressApplePayButton getItems={getItems} coupon={coupon} agreeToNewsletter={consent.marketing} onOrderPlaced={onOrderPlaced} />
                        : <WalletPlaceholder wallet="applepay" />}
                </div>
            </div>
        </div>
    )
}
