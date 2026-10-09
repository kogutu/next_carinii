'use client'

import { useEffect, useRef, useState } from 'react'
import type { CartItem } from '@/stores/cartZustand'
import { tpayPublicConfig } from '@/lib/payments/config'
import { detectApplePay } from '@/lib/tpay/apple-sdk'
import { PaymentRequestError, createApplePaySession, payWithWallet, waitForPayment } from '@/lib/tpay/browser-api'
import { contactFromApple, missingContactFields } from '@/lib/express/contact'
import { ExpressOrderError, buildExpressOrderPayload, calculateExpressTotals, createExpressOrder } from '@/lib/express/order'
import { findShippingOption, getExpressShippingOptions } from '@/lib/express/shipping'
import { toBase64 } from '@/lib/google-pay'
import AppleButton from '../tpay/AppleButton'

const PREFERRED_VERSIONS = [6, 5, 4, 3]
const DISPLAY_NAME = 'Carinii'
const ALLOWED_COUNTRY = 'PL'

type ExpressApplePayButtonProps = {
    // pozycje do zamówienia w chwili kliknięcia (null = nie można kontynuować, np. brak rozmiaru)
    getItems: () => CartItem[] | null
    coupon?: string
    // wywoływane po utworzeniu zamówienia (np. wyczyszczenie koszyka)
    onOrderPlaced?: () => void
}

// Apple Pay „kup od razu”: okno zbiera e-mail, telefon i adres, klient wybiera kuriera, po autoryzacji powstaje zamówienie i płatność (Tpay).
export default function ExpressApplePayButton({ getItems, coupon, onOrderPlaced }: ExpressApplePayButtonProps) {
    const [available, setAvailable] = useState<'checking' | 'yes' | 'no'>('checking')
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState('')
    const latest = useRef({ getItems, coupon, onOrderPlaced })
    latest.current = { getItems, coupon, onOrderPlaced }

    useEffect(() => {
        let cancelled = false
        detectApplePay().then((ok) => !cancelled && setAvailable(ok ? 'yes' : 'no'))
        return () => {
            cancelled = true
        }
    }, [])

    if (available === 'checking') return null
    if (available === 'no') {
        // poza produkcją mówimy, dlaczego przycisku nie ma (HTTPS / przeglądarka)
        return process.env.NODE_ENV !== 'production'
            ? <p className="text-xs text-gray-400">Apple Pay niedostępny (wymaga HTTPS i Safari lub obsługiwanej przeglądarki).</p>
            : null
    }

    const startPayment = () => {
        const items = latest.current.getItems()
        if (!items || items.length === 0) return

        const ApplePaySession = window.ApplePaySession
        const version = PREFERRED_VERSIONS.find((v) => ApplePaySession.supportsVersion(v)) ?? 3
        const options = getExpressShippingOptions()
        let selected = options[0]

        const lineItems = () => {
            const totals = calculateExpressTotals(items, selected)
            return {
                totals,
                newTotal: { label: DISPLAY_NAME, amount: totals.total.toFixed(2) },
                newLineItems: [
                    { label: 'Produkty', amount: totals.subtotal.toFixed(2) },
                    { label: 'Dostawa', amount: totals.shipping.toFixed(2) },
                ],
            }
        }
        const shippingMethods = options.map((option) => ({
            identifier: option.code,
            label: option.label,
            detail: 'Dostawa kurierem',
            amount: option.price.toFixed(2),
        }))

        const initial = lineItems()
        const session = new ApplePaySession(version, {
            countryCode: 'PL',
            currencyCode: 'PLN',
            supportedNetworks: ['visa', 'masterCard'],
            merchantCapabilities: ['supports3DS'],
            requiredShippingContactFields: ['postalAddress', 'name', 'email', 'phone'],
            shippingType: 'shipping',
            shippingMethods,
            total: initial.newTotal,
            lineItems: initial.newLineItems,
        })

        setError('')
        setIsProcessing(true)

        session.onvalidatemerchant = async (event: { validationURL: string }) => {
            try {
                const { session: merchantSession } = await createApplePaySession(event.validationURL)
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
                setError('Nie udało się uruchomić Apple Pay. Spróbuj dodać do koszyka i zapłacić w kasie.')
                setIsProcessing(false)
            }
        }

        session.onshippingcontactselected = (event: { shippingContact: { countryCode?: string } }) => {
            const update: Record<string, unknown> = { newShippingMethods: shippingMethods, ...lineItems() }
            delete update.totals
            const AppleError = (window as any).ApplePayError
            if (event.shippingContact.countryCode?.toUpperCase() !== ALLOWED_COUNTRY && AppleError) {
                update.errors = [new AppleError('shippingContactInvalid', 'country', 'Dostawa tylko na terenie Polski')]
            }
            session.completeShippingContactSelection(update)
        }

        session.onshippingmethodselected = (event: { shippingMethod: { identifier: string } }) => {
            selected = findShippingOption(options, event.shippingMethod.identifier)
            const { newTotal, newLineItems } = lineItems()
            session.completeShippingMethodSelection({ newTotal, newLineItems })
        }

        session.onpaymentauthorized = async (event: { payment: { shippingContact: unknown; token: { paymentData: unknown } } }) => {
            let oid = ''
            try {
                const contact = contactFromApple(event.payment.shippingContact as Parameters<typeof contactFromApple>[0])
                const missing = missingContactFields(contact)
                if (missing.length > 0) throw new ExpressOrderError(`Brakuje danych: ${missing.join(', ')}`)
                if (contact.country !== ALLOWED_COUNTRY) throw new ExpressOrderError('Dostawa tylko na terenie Polski')

                const { totals } = lineItems()
                oid = await createExpressOrder(
                    buildExpressOrderPayload({ items, coupon: latest.current.coupon, contact, shipping: selected, wallet: 'applepay' }),
                    items,
                )
                latest.current.onOrderPlaced?.()

                const token = toBase64(JSON.stringify(event.payment.token.paymentData))
                const result = await payWithWallet(oid, 'applepay', token, totals.total)

                if (result.status === 'failed') {
                    session.completePayment({ status: ApplePaySession.STATUS_FAILURE })
                    setError('Płatność Apple Pay została odrzucona. Zamówienie czeka na stronie zamówienia — możesz zapłacić inną metodą.')
                    window.location.href = `/success/oid/${encodeURIComponent(oid)}?payment=tpay&result=error`
                    return
                }
                session.completePayment({ status: ApplePaySession.STATUS_SUCCESS })

                if (result.status !== 'paid' && result.redirectUrl) {
                    window.location.href = result.redirectUrl
                    return
                }
                if (result.status !== 'paid') await waitForPayment(oid, result.transactionId, { timeoutMs: 20_000 })
                window.location.href = `/success/oid/${encodeURIComponent(oid)}?payment=tpay&result=success`
            } catch (err) {
                session.completePayment({ status: ApplePaySession.STATUS_FAILURE })
                if (oid) {
                    // zamówienie już istnieje — klient dokończy płatność na jego stronie
                    window.location.href = `/success/oid/${encodeURIComponent(oid)}?payment=tpay&result=error`
                    return
                }
                setError(err instanceof ExpressOrderError || err instanceof PaymentRequestError ? err.message : 'Płatność Apple Pay nie powiodła się.')
                setIsProcessing(false)
            }
        }

        session.oncancel = () => setIsProcessing(false)
        session.begin()
    }

    return (
        <div className="space-y-2">
            <div className={isProcessing ? 'opacity-50 pointer-events-none' : ''}>
                <AppleButton type="buy" onPress={startPayment} />
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
    )
}
