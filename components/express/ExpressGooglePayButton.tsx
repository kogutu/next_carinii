'use client'

import WalletPlaceholder from '../payments/WalletPlaceholder'
import { useEffect, useRef, useState } from 'react'
import type { CartItem } from '@/stores/cartZustand'
import { tpayPublicConfig } from '@/lib/payments/config'
import { BASE_REQUEST, isGooglePayCanceled } from '@/lib/google-pay'
import {
    P24PaymentError,
    allowedPaymentMethods,
    chargeWithP24Bundle,
    createPaymentsClient,
    getP24GpayConfig,
    registerP24Payment,
    type P24GpayConfig,
} from '@/lib/p24/gpay-browser'
import { contactFromGoogle, missingContactFields } from '@/lib/express/contact'
import { ExpressOrderError, buildExpressOrderPayload, calculateExpressTotals, createExpressOrder } from '@/lib/express/order'
import { findShippingOption, getExpressShippingOptions } from '@/lib/express/shipping'

const ALLOWED_COUNTRY = 'PL'

type ExpressGooglePayButtonProps = {
    // pozycje do zamówienia w chwili kliknięcia (null = nie można kontynuować, np. brak rozmiaru)
    getItems: () => CartItem[] | null
    coupon?: string
    agreeToNewsletter?: boolean
    // wywoływane po utworzeniu zamówienia (np. wyczyszczenie koszyka)
    onOrderPlaced?: () => void
}

// Google Pay „kup od razu”, rozliczane przez Przelewy24: okno zbiera e-mail, telefon i adres, klient wybiera kuriera,
// po autoryzacji powstaje zamówienie, a płatność idzie przez P24.
export default function ExpressGooglePayButton({ getItems, coupon, agreeToNewsletter, onOrderPlaced }: ExpressGooglePayButtonProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [error, setError] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    // 'no' = brak konfiguracji P24 albo przeglądarka bez Google Pay — pokazujemy wyłączony przycisk
    const [availability, setAvailability] = useState<'checking' | 'yes' | 'no'>('checking')
    const latest = useRef({ getItems, coupon, agreeToNewsletter, onOrderPlaced })
    latest.current = { getItems, coupon, agreeToNewsletter, onOrderPlaced }
    // pozycje z chwili kliknięcia — potrzebne też w callbackach okna (zmiana adresu / kuriera)
    const activeItems = useRef<CartItem[]>([])

    useEffect(() => {
        let cancelled = false
        const options = getExpressShippingOptions()

        const transactionInfo = (shippingCode: string) => {
            const shipping = findShippingOption(options, shippingCode)
            const totals = calculateExpressTotals(activeItems.current, shipping)
            return {
                totalPriceStatus: 'FINAL',
                totalPriceLabel: 'Razem',
                totalPrice: totals.total.toFixed(2),
                currencyCode: 'PLN',
                countryCode: 'PL',
                displayItems: [
                    { label: 'Produkty', type: 'SUBTOTAL', price: totals.subtotal.toFixed(2) },
                    { label: 'Dostawa', type: 'LINE_ITEM', price: totals.shipping.toFixed(2) },
                ],
            }
        }

        // aktualizacja sumy po zmianie adresu lub kuriera w oknie Google Pay
        const onPaymentDataChanged = async (intermediate: {
            callbackTrigger?: string
            shippingAddress?: { countryCode?: string }
            shippingOptionData?: { id?: string }
        }) => {
            if (intermediate.shippingAddress && intermediate.shippingAddress.countryCode?.toUpperCase() !== ALLOWED_COUNTRY) {
                return {
                    error: {
                        reason: 'SHIPPING_ADDRESS_UNSERVICEABLE',
                        message: 'Dostawa tylko na terenie Polski',
                        intent: 'SHIPPING_ADDRESS',
                    },
                }
            }
            const shippingCode = intermediate.shippingOptionData?.id ?? options[0].code
            return { newTransactionInfo: transactionInfo(shippingCode) }
        }

        const buildRequest = (config: P24GpayConfig) => ({
            ...BASE_REQUEST,
            allowedPaymentMethods: allowedPaymentMethods(config),
            merchantInfo: {
                merchantName: config.merchantName,
                ...(tpayPublicConfig.googleMerchantId ? { merchantId: tpayPublicConfig.googleMerchantId } : {}),
            },
            emailRequired: true,
            shippingAddressRequired: true,
            shippingAddressParameters: { allowedCountryCodes: [ALLOWED_COUNTRY], phoneNumberRequired: true },
            shippingOptionRequired: true,
            shippingOptionParameters: {
                defaultSelectedOptionId: options[0].code,
                shippingOptions: options.map((option) => ({
                    id: option.code,
                    label: `${option.label}: ${option.price.toFixed(2).replace('.', ',')} zł`,
                    description: 'Dostawa kurierem',
                })),
            },
            callbackIntents: ['SHIPPING_ADDRESS', 'SHIPPING_OPTION'],
            transactionInfo: transactionInfo(options[0].code),
        })

        const pay = async (config: P24GpayConfig, client: any) => {
            const items = latest.current.getItems()
            if (!items || items.length === 0) return
            activeItems.current = items

            setError('')
            setIsProcessing(true)
            let oid = ''
            try {
                const paymentData = await client.loadPaymentData(buildRequest(config))

                const contact = contactFromGoogle(paymentData.email, paymentData.shippingAddress ?? {})
                const missing = missingContactFields(contact)
                if (missing.length > 0) throw new ExpressOrderError(`Brakuje danych: ${missing.join(', ')}`)
                if (contact.country !== ALLOWED_COUNTRY) throw new ExpressOrderError('Dostawa tylko na terenie Polski')

                const shipping = findShippingOption(options, paymentData.shippingOptionData?.id ?? options[0].code)
                const { total } = calculateExpressTotals(items, shipping)

                oid = await createExpressOrder(
                    buildExpressOrderPayload({ items, coupon: latest.current.coupon, agreeToNewsletter: latest.current.agreeToNewsletter, contact, shipping, wallet: 'googlepay' }),
                    items,
                )
                latest.current.onOrderPlaced?.()

                const p24Token = await registerP24Payment(oid, paymentData.paymentMethodData.tokenizationData.token, total)
                await chargeWithP24Bundle(config.baseUrl, p24Token)
                window.location.href = `/success/oid/${encodeURIComponent(oid)}?payment=p24&result=success`
            } catch (err) {
                if (isGooglePayCanceled(err)) return
                if (oid) {
                    // zamówienie już istnieje — klient dokończy płatność na jego stronie
                    window.location.href = `/success/oid/${encodeURIComponent(oid)}?payment=p24&result=error`
                    return
                }
                setError(
                    err instanceof ExpressOrderError || err instanceof P24PaymentError
                        ? err.message
                        : 'Płatność Google Pay nie powiodła się.',
                )
            } finally {
                if (!cancelled) setIsProcessing(false)
            }
        }

        const init = async () => {
            const config = await getP24GpayConfig()
            const client = await createPaymentsClient(config, { callbacks: { onPaymentDataChanged } })
            if (cancelled) return
            if (!client || !containerRef.current) {
                setAvailability('no')
                return
            }

            setAvailability('yes')
            containerRef.current.replaceChildren(
                client.createButton({
                    onClick: () => pay(config, client),
                    allowedPaymentMethods: allowedPaymentMethods(config),
                    buttonType: 'buy',
                    buttonSizeMode: 'fill',
                    buttonRadius: 12,
                }),
            )
        }

        init().catch((err) => {
            console.error('[p24] express Google Pay init failed:', err)
            if (!cancelled) setAvailability('no')
        })
        return () => {
            cancelled = true
        }
    }, [])

    if (availability === 'no') return <WalletPlaceholder wallet="googlepay" />

    return (
        <div className="space-y-2">
            {/* wysokość kontenera wyznacza wysokość przycisku Google (tryb fill) — tyle samo co przycisk Apple */}
            <div ref={containerRef} className={`h-11 w-full ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`} />
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </div>
    )
}
