'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { InfoIcon } from 'lucide-react'
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
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

const DEFAULT_SHIPPING_METHOD = 'dhl_dhl24pl_courier'
const DEFAULT_PAYMENT_METHOD = 'banktransfer'
const DRAFT_SAVE_DELAY_MS = 600

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
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f4f1] to-white relative z-0">
            <div className="max-w-7xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-[#441c49] mb-4">
                    Koszyk
                </h1>
                <p className="text-gray-600 mb-8">Uzupełnij dane, aby złożyć zamówienie</p>
                {sessionUser?.user && (
                    <div className="mb-4">
                        <Alert>
                            <InfoIcon />
                            <AlertTitle>Jesteś zalogowany!</AlertTitle>
                            <AlertDescription>
                                <div className="flex gap-2 items-center">  Jesteś zalogowany jako użytkownik: <Link className="bg-hgold py-2 px-4 text-white rounded-2xl" href="/klient/panel/profil">
                                    {sessionUser?.user.email}</Link>
                                    <span className="cursor-pointer underline text-xs" onClick={async () => { await signOut({ callbackUrl: "/checkout" }) }}>wyloguj się</span>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                )}
                <div className="block md:grid md:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white rounded-lg border p-8 shadow-sm">
                            <SectionHeader
                                title="1. Dane i adres dostawy"
                                complete={customerComplete}
                                hasErrors={customerHasErrors}
                            />
                            {hasSavedDraft && !isPristine(customer) && (
                                <p className="text-xs text-gray-500 -mt-3 mb-4">
                                    Dane zapamiętane w tej przeglądarce.{' '}
                                    <button type="button" onClick={handleClearSavedData} className="underline hover:text-gray-700">
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

                        <div className="bg-white rounded-lg border py-8 px-8 shadow-sm">
                            <ShippingMethod
                                init={shippingMethod}
                                point={inpost}
                                lastUsed={initialDraft?.shippingMethod}
                                onMethodChange={handleShippingMethodChange}
                                onPointChange={setInpost}
                                error={submitAttempted ? errors.shippingMethod : ''}
                            />
                        </div>

                        <div className="bg-white rounded-lg border p-8 shadow-sm">
                            <PaymentMethod
                                init={paymentMethod}
                                shippingMethod={shippingMethod}
                                lastUsed={initialDraft?.paymentMethod}
                                onMethodChange={setPaymentMethod}
                                error={submitAttempted ? errors.paymentMethod : ''}
                            />
                        </div>
                    </div>

                    {/* Right Column - Only Order Summary */}
                    <div className="md:col-span-1">
                        <div className="sticky top-8">
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
        </div>
    )
}
