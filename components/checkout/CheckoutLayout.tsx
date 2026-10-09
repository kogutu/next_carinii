'use client'

import { ENTER, EYEBROW, SURFACE_CARD } from '@/components/ui/surface'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import CustomerForm from '@/components/checkout/CustomerForm'
import InvoiceSection from '@/components/checkout/InvoiceSection'
import ShippingMethod from '@/components/checkout/ShippingMethod'
import PaymentMethod from '@/components/checkout/PaymentMethod'
import OrderSummary from '@/components/checkout/OrderSummary'
import SectionHeader from '@/components/checkout/SectionHeader'
import FloatingValidationPanel from '@/components/checkout/FloatingValidationPanel'
import {
    getCartPaymentMethod,
    useCheckoutValidationStore,
} from '@/components/checkout/checkoutValidationStore'
import {
    EMPTY_CUSTOMER,
    EMPTY_INVOICE,
    INPOST_PARCEL_LOCKER,
    countCheckoutErrors,
    validateCheckout,
    type CheckoutData,
    type CheckoutErrors,
    type CustomerFormData,
    type InpostPoint,
    type InvoiceFormData,
} from '@/hooks/useCheckoutValidation'
import { mapAccountToCheckout, type AccountData } from '@/lib/checkoutAccount'
import { readCheckoutDraft, useCheckoutDraftStore } from '@/stores/checkoutDraftStore'
import { cn } from '@/lib/utils'

const DEFAULT_SHIPPING_METHOD = 'dhl_dhl24pl_courier'
const DEFAULT_PAYMENT_METHOD = 'banktransfer'
const DRAFT_SAVE_DELAY_MS = 600

const CARD = cn(SURFACE_CARD, 'p-5 sm:p-8')

const CUSTOMER_FIELD_ORDER = ['firstName', 'lastName', 'email', 'phone', 'street', 'postcode', 'city']
const INVOICE_FIELD_ORDER = ['nip', 'companyName', 'street', 'postcode', 'city']

const findFirstErrorAnchor = (errors: CheckoutErrors): string | null => {
    const customerField = CUSTOMER_FIELD_ORDER.find((field) => errors.customer[field])
    if (customerField) return `checkout-${customerField}`

    const invoiceField = INVOICE_FIELD_ORDER.find((field) => errors.invoice[field])
    if (invoiceField) return `checkout-invoice-${invoiceField}`

    if (errors.shippingMethod) return 'section-shipping'
    if (errors.paymentMethod) return 'section-payment'
    if (errors.terms) return 'checkout-terms'
    return null
}

const isPristine = (customer: CustomerFormData): boolean =>
    !customer.firstName && !customer.lastName && !customer.email && !customer.phone && !customer.street

export default function CheckoutLayout() {
    const { data: sessionUser } = useSession()

    const setZustandErrors = useCheckoutValidationStore((state) => state.setErrors)
    const submitAttempted = useCheckoutValidationStore((state) => state.submitAttempted)
    const setSubmitAttempted = useCheckoutValidationStore((state) => state.setSubmitAttempted)

    const saveDraft = useCheckoutDraftStore((state) => state.saveDraft)
    const clearDraft = useCheckoutDraftStore((state) => state.clearDraft)
    const hasSavedDraft = useCheckoutDraftStore((state) => state.savedAt > 0)

    // Zapis z poprzedniego zamówienia — czytany raz, przy wejściu na stronę
    const [initialDraft] = useState(readCheckoutDraft)

    const [customer, setCustomer] = useState<CustomerFormData>({ ...EMPTY_CUSTOMER, ...initialDraft?.customer })
    const [invoiceEnabled, setInvoiceEnabled] = useState(initialDraft?.invoiceEnabled ?? false)
    const [invoice, setInvoice] = useState<InvoiceFormData>({ ...EMPTY_INVOICE, ...initialDraft?.invoice })
    const [shippingMethod, setShippingMethod] = useState(initialDraft?.shippingMethod ?? DEFAULT_SHIPPING_METHOD)
    const [inpost, setInpost] = useState<InpostPoint>(initialDraft?.inpost ?? {})
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState(() => {
        // płatność wybrana w koszyku (np. PayPo z karty produktu) wygrywa z zapisem
        const cartPayment = getCartPaymentMethod()
        return cartPayment !== DEFAULT_PAYMENT_METHOD
            ? cartPayment
            : initialDraft?.paymentMethod ?? cartPayment
    })

    const customerRef = useRef(customer)
    customerRef.current = customer

    const checkoutData: CheckoutData = useMemo(
        () => ({
            customer,
            invoice: invoiceEnabled ? invoice : null,
            shippingMethod,
            paymentMethod,
            agreeToTerms,
            agreeToNewsletter: false,
            inpost,
        }),
        [customer, invoiceEnabled, invoice, shippingMethod, paymentMethod, agreeToTerms, inpost],
    )

    const errors = useMemo(() => validateCheckout(checkoutData), [checkoutData])

    useEffect(() => {
        setZustandErrors(errors)
    }, [errors, setZustandErrors])

    // Przy wyjściu ze strony nie zostawiamy „submitAttempted” z poprzedniej wizyty
    useEffect(() => () => setSubmitAttempted(false), [setSubmitAttempted])

    // Zapamiętywanie danych i metod (debounce, nie zapisujemy pustego formularza)
    useEffect(() => {
        if (isPristine(customer)) return

        const timer = setTimeout(
            () => saveDraft({ customer, invoiceEnabled, invoice, shippingMethod, paymentMethod, inpost }),
            DRAFT_SAVE_DELAY_MS,
        )
        return () => clearTimeout(timer)
    }, [customer, invoiceEnabled, invoice, shippingMethod, paymentMethod, inpost, saveDraft])

    // Zalogowany użytkownik: dane z konta uzupełniają formularz
    useEffect(() => {
        const userId = sessionUser?.user?.id
        if (!userId) return

        const loadUser = async () => {
            try {
                const response = await fetch('/api/user/getuser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: userId }),
                    cache: 'no-store',
                })
                if (!response.ok) throw new Error('Failed to fetch user')

                const { data }: { data?: AccountData } = await response.json()
                if (!data) return

                const prefill = mapAccountToCheckout(data, customerRef.current)
                setCustomer(prefill.customer)
                if (prefill.invoice) {
                    setInvoice(prefill.invoice)
                    setInvoiceEnabled(true)
                }
            } catch (error) {
                console.error('Error loading user:', error)
            }
        }

        loadUser()
    }, [sessionUser?.user?.id])

    const handleShippingMethodChange = useCallback((method: string) => {
        setShippingMethod(method)
        if (method !== INPOST_PARCEL_LOCKER) setInpost({})
    }, [])

    const handleValidate = useCallback((): boolean => {
        if (countCheckoutErrors(errors) === 0) return true

        setSubmitAttempted(true)
        const anchorId = findFirstErrorAnchor(errors)
        const element = anchorId ? document.getElementById(anchorId) : null
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        element?.focus({ preventScroll: true })
        return false
    }, [errors, setSubmitAttempted])

    const handleClearSavedData = () => {
        clearDraft()
        setCustomer(EMPTY_CUSTOMER)
        setInvoice(EMPTY_INVOICE)
        setInvoiceEnabled(false)
        setInpost({})
    }

    const customerComplete = Object.keys(errors.customer).length === 0 && Object.keys(errors.invoice).length === 0
    const customerHasErrors = submitAttempted && !customerComplete

    return (
        <div className="relative z-0 min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                <header className={cn(ENTER, 'max-w-3xl')}>
                    <p className={EYEBROW}>Zamówienie</p>
                    <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                        Koszyk
                    </h1>
                    <p className="mt-3 text-pretty text-base text-muted-foreground">
                        Uzupełnij dane, aby złożyć zamówienie.
                    </p>
                </header>

                {sessionUser?.user && (
                    <div className={cn(ENTER, 'mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-muted/60 px-4 py-2 text-sm text-muted-foreground')}>
                        <span>
                            Jesteś zalogowany jako{' '}
                            <Link className="font-medium text-foreground underline underline-offset-4" href="/klient/panel/profil">
                                {sessionUser.user.email}
                            </Link>
                        </span>
                        <button
                            type="button"
                            className="inline-flex h-11 items-center text-foreground underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            onClick={async () => { await signOut({ callbackUrl: '/checkout' }) }}
                        >
                            Wyloguj się
                        </button>
                    </div>
                )}

                <div className="mt-10 grid gap-8 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_25rem] lg:items-start lg:gap-12">
                    {/* Lewa kolumna: formularze */}
                    <div className="space-y-6">
                        <div className={cn(ENTER, 'delay-100', CARD)}>
                            <SectionHeader
                                step={1}
                                title="Dane i adres dostawy"
                                complete={customerComplete}
                                hasErrors={customerHasErrors}
                            />
                            {hasSavedDraft && !isPristine(customer) && (
                                <p className="-mt-3 mb-4 text-xs text-muted-foreground">
                                    Dane zapamiętane w tej przeglądarce.{' '}
                                    <button type="button" onClick={handleClearSavedData} className="underline underline-offset-4 hover:text-foreground">
                                        Wyczyść
                                    </button>
                                </p>
                            )}
                            <CustomerForm
                                value={customer}
                                onChange={setCustomer}
                                errors={errors.customer}
                                showAllErrors={submitAttempted}
                            />
                            <InvoiceSection
                                customer={customer}
                                enabled={invoiceEnabled}
                                onEnabledChange={setInvoiceEnabled}
                                value={invoice}
                                onChange={setInvoice}
                                errors={errors.invoice}
                                showAllErrors={submitAttempted}
                            />
                        </div>

                        <div className={cn(ENTER, 'delay-200', CARD)}>
                            <ShippingMethod
                                init={shippingMethod}
                                point={inpost}
                                lastUsed={initialDraft?.shippingMethod}
                                onMethodChange={handleShippingMethodChange}
                                onPointChange={setInpost}
                                error={submitAttempted ? errors.shippingMethod : ''}
                            />
                        </div>

                        <div className={cn(ENTER, 'delay-300', CARD)}>
                            <PaymentMethod
                                init={paymentMethod}
                                shippingMethod={shippingMethod}
                                lastUsed={initialDraft?.paymentMethod}
                                onMethodChange={setPaymentMethod}
                                error={submitAttempted ? errors.paymentMethod : ''}
                            />
                        </div>
                    </div>

                    {/* Prawa kolumna: podsumowanie */}
                    <div className={cn(ENTER, 'delay-200 lg:sticky lg:top-24')}>
                        <FloatingValidationPanel />

                        <OrderSummary
                            checkoutData={checkoutData}
                            isTermsAccepted={agreeToTerms}
                            termsError={submitAttempted ? errors.terms : ''}
                            onTermsChange={setAgreeToTerms}
                            onValidate={handleValidate}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
