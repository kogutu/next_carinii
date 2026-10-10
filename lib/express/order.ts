import type { CartItem } from '@/stores/cartZustand'
import type { WalletContact } from './contact'
import type { ExpressShippingOption } from './shipping'
import { recordConsent } from '@/lib/consentClient'

// Szybka płatność tworzy zamówienie z danych portfela: odbiorca = płatnik, dokument = paragon, płatność „Płatność kartą”.
const VAT_RATE = 0.23
const EXPRESS_PAYMENT_CODE = 'tpay_card'

export type ExpressWalletKind = 'googlepay' | 'applepay'

const WALLET_LABELS: Record<ExpressWalletKind, string> = {
    googlepay: 'Google Pay',
    applepay: 'Apple Pay',
}

export type ExpressTotals = {
    subtotal: number
    shipping: number
    total: number
}

const round2 = (value: number): number => Math.round(value * 100) / 100

export const calculateExpressTotals = (items: CartItem[], shipping: ExpressShippingOption): ExpressTotals => {
    const subtotal = round2(items.reduce((sum, item) => sum + item.final_price * item.qty, 0))
    return { subtotal, shipping: shipping.price, total: round2(subtotal + shipping.price) }
}

export class ExpressOrderError extends Error {}

type BuildInput = {
    items: CartItem[]
    coupon?: string
    contact: WalletContact
    shipping: ExpressShippingOption
    wallet: ExpressWalletKind
    // zgoda marketingowa z pola obok przycisków (regulamin jest warunkiem uruchomienia portfela)
    agreeToNewsletter?: boolean
}

export type ExpressOrderPayload = ReturnType<typeof buildExpressOrderPayload>

export const buildExpressOrderPayload = ({ items, coupon, contact, shipping, wallet, agreeToNewsletter = false }: BuildInput) => {
    const totals = calculateExpressTotals(items, shipping)

    const address = {
        firstName: contact.firstName,
        lastName: contact.lastName,
        street: contact.street,
        postcode: contact.postcode,
        city: contact.city,
        country: contact.country || 'PL',
        phone: contact.phone,
    }

    return {
        customer: {
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.email,
            phone: contact.phone,
            phoneCode: contact.phoneCode,
            type: 'private',
        },
        documentType: 'receipt',
        invoice: null,
        billingAddress: address,
        shippingAddress: address,
        shippingMethod: shipping.code,
        paymentMethod: EXPRESS_PAYMENT_CODE,
        items: items.map((item) => ({
            productId: item.pid,
            variantId: item.variantId,
            variant: item.variant,
            sku: item.sku,
            name: item.name,
            priceNetto: round2(item.final_price / (1 + VAT_RATE)),
            priceBrutto: item.final_price,
            quantity: item.qty,
        })),
        priceType: 'brutto',
        Inpost: {},
        couponCode: coupon || undefined,
        notes: `Szybka płatność: ${WALLET_LABELS[wallet]}`,
        agreeToNewsletter,
        subtotalBrutto: totals.subtotal,
        shippingBrutto: totals.shipping,
        grandTotalBrutto: totals.total,
    }
}

type OrderResponse = {
    success?: boolean
    message?: string
    externalOrderId?: string
    errItemId?: number | string
}

// Zwraca numer zamówienia; błędy (np. brak towaru) jako ExpressOrderError z komunikatem dla klienta
export const createExpressOrder = async (payload: ExpressOrderPayload, items: CartItem[]): Promise<string> => {
    const res = await fetch('/api/magento/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    const result: OrderResponse = await res.json().catch(() => ({}))

    if (!res.ok || !result.success || !result.externalOrderId) {
        const unavailable = items.find((item) => String(item.variantId) === String(result.errItemId))
        const detail = unavailable
            ? `: ${unavailable.name.split('CARINII--')[0].trim()}${unavailable.variant?.size ? ` roz. ${unavailable.variant.size}` : ''}`
            : ''
        throw new ExpressOrderError((result.message || 'Nie udało się złożyć zamówienia') + detail)
    }
    const orderNumber = String(result.externalOrderId)
    recordConsent({
        source: 'express',
        email: payload.customer.email,
        phone: payload.customer.phone,
        terms: true,
        marketing: payload.agreeToNewsletter,
        context: { order: orderNumber },
    })
    return orderNumber
}
