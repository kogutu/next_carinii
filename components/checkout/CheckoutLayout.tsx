'use client'

import { useState, useCallback, useEffect } from 'react'
import BillingForm from '@/components/checkout/BillingForm'
import ShippingForm from '@/components/checkout/ShippingForm'
import ShippingMethod from '@/components/checkout/ShippingMethod'
import PaymentMethod from '@/components/checkout/PaymentMethod'
import OrderSummary from '@/components/checkout/OrderSummary'
import FloatingValidationPanel from '@/components/checkout/FloatingValidationPanel'
import { useCheckoutValidationStore } from '@/components/checkout/checkoutValidationStore'

import { signOut, useSession } from 'next-auth/react'
import { useCheckoutValidation, BillingFormData, CheckoutData, ShippingFormData } from '@/hooks/useCheckoutValidation'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { InfoIcon } from 'lucide-react'
import Link from 'next/link'



export default function CheckoutLayout() {
    const { validateBillingForm, validateShippingForm } = useCheckoutValidation()
    const { data: sessionUser } = useSession()

    // Zustand store
    const {
        setErrors: setZustandErrors,
        setStatus: setZustandStatus,
        setBillingTouched: setZustandBillingTouched,
        setShippingTouched: setZustandShippingTouched,
        updateSectionStatus: setZustandSectionStatus,
        setShippingMethod: setZustandShippingMethod,
        setPaymentMethod: setZustandPaymentMethod,
        shippingTouched,
        billingTouched,
        shippingMethod,
        shippingTotal,
        paymentMethod,
        setSameAddress
    } = useCheckoutValidationStore()

    const [checkoutData, setCheckoutData] = useState<CheckoutData>({
        billing: {
            type: 'private',
            firstName: '',
            lastName: '',
            nip: '',
            street: '',
            postcode: '',
            city: '',
            country: 'Polska',
            phone: '',
            phoneCode: '+48',
            email: '',
            documentType: 'receipt',
            sameAddress: true
        },
        shipping: {
            firstName: '',
            lastName: '',
            street: '',
            postcode: '',
            city: '',
            country: 'Polska',
            phone: '',
            phoneCode: '+48'
        },
        shippingMethod: 'dhl_dhl24pl_courier' as any,
        paymentMethod: 'checkmo' as any,
        agreeToTerms: false,
        agreeToNewsletter: false
    })


    useEffect(() => {
        const loadUser = async () => {
            if (!sessionUser?.user?.id) return

            try {
                const response = await fetch('/api/user/getuser', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: sessionUser.user.id }),
                    cache: 'no-store'
                })

                if (!response.ok) throw new Error('Failed to fetch user')

                let data = await response.json()
                let phone = data.data.phone;
                let phoneCode = '+48';
                let phoneNumber = phone || '';

                // Parse phone code if it exists
                if (phone && phone.match(/^(\+\d{1,3})\s?(.+)$/)) {
                    const match = phone.match(/^(\+\d{1,3})\s?(.+)$/)
                    if (match) {
                        phoneCode = match[1]
                        phoneNumber = match[2]
                    }
                }

                let email = data.data.email;

                let billingData = data.data.billingAddress
                let shippingData = data.data.shippingAddress
                console.log(data)
                let sameAddress = true;
                if (shippingData?.firstName) {
                    setZustandShippingTouched(true)
                    sameAddress = false;
                }
                var newCheckoutData: CheckoutData = {
                    ...checkoutData,
                    billing: {
                        email: email || '',
                        firstName: data.data.firstName,
                        lastName: data.data.lastName,
                    }
                }
                // Aktualizuj dane formularza
                if (billingData && shippingData)
                    newCheckoutData = {
                        ...newCheckoutData,
                        billing: {
                            ...checkoutData.billing,
                            nip: billingData.nip,
                            customerType: billingData.customerType,
                            companyName: billingData.companyName,
                            invoiceType: billingData.invoiceType,
                            firstName: billingData.firstName,
                            lastName: billingData.lastName,
                            street: billingData.street || '',
                            postcode: billingData.postal || '',
                            city: billingData.city || '',
                            country: billingData.country || 'Polska',
                            phone: phoneNumber,
                            phoneCode: phoneCode,
                            email: email || '',
                            documentType: billingData.type === 'company' ? 'invoice' : 'receipt',
                            sameAddress: sameAddress
                        },
                        shipping: {
                            ...checkoutData.shipping,
                            firstName: shippingData.firstName,
                            lastName: shippingData.lastName,
                            street: shippingData.street || '',
                            postcode: shippingData.postal || '',
                            city: shippingData.city || '',
                            country: shippingData.country || 'Polska',
                            phone: phoneNumber,
                            phoneCode: phoneCode,
                        }
                    }

                setCheckoutData(newCheckoutData)

                // Update Zustand store
                setSameAddress(sameAddress)
            } catch (error) {
                console.error('Error loading user:', error)
            }
        }

        loadUser()
    }, [sessionUser?.user?.id, setSameAddress])


    const handleBillingChange = useCallback((billingData: BillingFormData, isValid: boolean) => {
        setCheckoutData(prev => {
            let newData = {
                ...prev,
                billing: billingData
            }

            // Jeśli adresy są takie same, skopiuj dane billingowe do shipping
            if (billingData.sameAddress) {
                newData.shipping = {
                    firstName: billingData.firstName,
                    lastName: billingData.lastName,
                    street: billingData.street,
                    postcode: billingData.postcode,
                    city: billingData.city,
                    country: billingData.country,
                    phone: billingData.phone,
                    phoneCode: billingData.phoneCode
                }
            }

            return newData
        })

        // Oblicz błędy z nowych danych (billingData) zamiast starego state
        const billingErrors = validateBillingForm(billingData)

        // Aktualizuj store z błędami
        setZustandErrors({
            billing: billingErrors,
            shipping: {},
            shippingMethod: '',
            paymentMethod: '',
            terms: ''
        })

        // const newStatus = {
        //     billing: isValid ? 'complete' as const : 'incomplete' as const,
        //     shipping: 'incomplete' as const,
        //     shippingMethod: 'incomplete' as const,
        //     paymentMethod: 'incomplete' as const,
        //     terms: 'incomplete' as const
        // }

        // Update Zustand store
        setZustandSectionStatus('billing', isValid ? 'complete' as const : 'incomplete' as const);
        setZustandBillingTouched(true)
        if (billingData.sameAddress

        )
            setZustandShippingTouched(true)
        // console.log('newStatus', newStatus)
        // setZustandStatus(newStatus)
        setSameAddress(billingData.sameAddress)
    }, [validateBillingForm, setZustandSectionStatus, setZustandBillingTouched, setZustandErrors, setSameAddress])

    const handleShippingChange = useCallback((shippingData: ShippingFormData, isValid: boolean) => {
        setCheckoutData(prev => ({
            ...prev,
            shipping: shippingData
        }))
        console.log('shippingData', shippingData)

        // Oblicz błędy z nowych danych (shippingData) zamiast starego state
        const shippingErrors = validateShippingForm(shippingData)
        // Aktualizuj store z błędami
        setZustandErrors({
            billing: {},
            shipping: shippingErrors,
            shippingMethod: '',
            paymentMethod: '',
            terms: ''
        })


        setZustandShippingTouched(true)
        setZustandSectionStatus('shipping', isValid ? 'complete' as const : 'incomplete' as const);

        // Update Zustand store
        // setZustandStatus(newStatus)

    }, [validateShippingForm, setZustandSectionStatus, setZustandErrors])


    const handleShippingMethodChange = useCallback((method: any) => {
        setCheckoutData(prev => ({
            ...prev,
            shippingMethod: method
        }))

        setZustandShippingMethod(method)


        setZustandSectionStatus('shippingMethod', 'complete' as const);

        // Update Zustand store
    }, [setZustandSectionStatus])

    const handlePaymentMethodChange = useCallback((method: any) => {
        setCheckoutData(prev => ({
            ...prev,
            paymentMethod: method
        }))

        setZustandPaymentMethod(method)


        setZustandSectionStatus('paymentMethod', 'complete' as const);

        // Update Zustand store
    }, [setZustandStatus])

    const handleTermsChange = useCallback((agree: boolean) => {
        setCheckoutData(prev => ({
            ...prev,
            agreeToTerms: agree
        }))

        // Aktualizuj błędy w store
        setZustandErrors({
            billing: {},
            shipping: {},
            shippingMethod: '',
            paymentMethod: '',
            terms: agree ? '' : 'Musisz zaakceptować regulamin'
        })



        setZustandSectionStatus('terms', agree ? 'complete' as const : 'incomplete' as const);

        // Update Zustand store
    }, [setZustandErrors])



    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-[#f8f4f1] to-white relative z-0">
            {/* Floating Validation Panel */}

            <div className="max-w-7xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-[#441c49] mb-4">
                    Koszyk
                </h1>
                <p className="text-gray-600 mb-8">Uzupełnij wszystkie pola, aby przejść do płatności</p>
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
                        {/* Billing Form */}
                        <div className="bg-white rounded-lg border  p-8 shadow-sm">
                            <BillingForm
                                onValidationChange={handleBillingChange}

                                isTouched={billingTouched}
                                initialBillingData={checkoutData.billing}
                            />
                        </div>

                        {/* Shipping Form - pokazuje się tylko gdy adresy są różne */}

                        {!checkoutData.billing.sameAddress && (
                            <div className="bg-white rounded-lg border  p-8 shadow-sm">
                                <ShippingForm
                                    onValidationChange={handleShippingChange}
                                    isTouched={shippingTouched}
                                    initialShippingData={checkoutData.shipping as ShippingFormData}
                                />
                            </div>
                        )}

                        <div className="bg-white rounded-lg border  p-8 shadow-sm">
                            <ShippingMethod
                                onMethodChange={handleShippingMethodChange}
                                init={shippingMethod}
                            />
                        </div>

                        <div className="bg-white rounded-lg border  p-8 shadow-sm">
                            <PaymentMethod
                                onMethodChange={handlePaymentMethodChange}
                                shippingMethod={checkoutData.shippingMethod}
                                init={paymentMethod}
                            />
                        </div>
                    </div>

                    {/* Right Column - Only Order Summary */}
                    <div className="md:col-span-1">
                        <div className="sticky top-8">
                            <FloatingValidationPanel />

                            <OrderSummary
                                onTermsChange={handleTermsChange}
                                isTermsAccepted={checkoutData.agreeToTerms}
                                shippingTotal={shippingTotal}
                                checkoutData={checkoutData}
                                onOrderSubmit={() => {
                                    console.log('[v0] Order submitted, can reset form or redirect')
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
