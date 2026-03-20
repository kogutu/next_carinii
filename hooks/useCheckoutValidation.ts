import { useState, useCallback } from 'react'

export interface BillingFormData {
    type: 'private' | 'company'
    firstName: string
    lastName: string
    street: string
    postcode: string
    city: string
    country: string
    phone: string
    phoneCode: string
    email: string
    documentType: 'receipt' | 'invoice'
    companyName?: string
    nip?: string
    sameAddress: boolean
}

export interface ShippingFormData {
    firstName: string
    lastName: string
    street: string
    postcode: string
    city: string
    country: string
    phone: string
    phoneCode: string
}

export interface CheckoutData {
    billing: BillingFormData
    shipping?: ShippingFormData
    shippingMethod: 'fedex' | 'pickup'
    paymentMethod: 'transfer' | 'cod'
    agreeToTerms: boolean
    agreeToNewsletter: boolean
}

export interface ValidationErrors {
    billing: Record<string, string>
    shipping: Record<string, string>
    shippingMethod: string
    paymentMethod: string
    terms: string
}

export interface SectionStatus {
    billing: 'incomplete' | 'complete' | 'error'
    shipping: 'incomplete' | 'complete' | 'error'
    shippingMethod: 'incomplete' | 'complete'
    paymentMethod: 'incomplete' | 'complete'
    terms: 'incomplete' | 'complete'
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\d{9,}$/
const POSTCODE_REGEX = /^\d{2}-\d{3}$/

export const useCheckoutValidation = () => {
    const [errors, setErrors] = useState<ValidationErrors>({
        billing: {},
        shipping: {},
        shippingMethod: '',
        paymentMethod: '',
        terms: ''
    })
    const [billingTouched, setBillingTouched] = useState(false)

    const validateBillingForm = useCallback(
        (data: BillingFormData): Record<string, string> => {
            const newErrors: Record<string, string> = {}
            // Common validatio an
            if (!data.firstName.trim()) newErrors.firstName = 'Imię jest wymagane'
            if (!data.lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane'
            if (!data.street.trim()) newErrors.street = 'Ulica i numer są wymagane'
            if (!data.postcode.trim()) newErrors.postcode = 'Kod pocztowy jest wymagany'
            if (!data.postcode || !POSTCODE_REGEX.test(data.postcode)) {
                newErrors.postcode = 'Kod pocztowy musi mieć format: XX-XXX'
            }
            if (!data.city.trim()) newErrors.city = 'Miasto jest wymagane'
            if (!data.phone.trim()) newErrors.phone = 'Telefon jest wymagany'
            if (!data.phone || !PHONE_REGEX.test(data.phone.replace(/[\s\-]/g, ''))) {
                newErrors.phone = 'Telefon musi zawierać co najmniej 9 cyfr'
            }
            if (!data.email.trim()) newErrors.email = 'Email jest wymagany'
            if (!data.email || !EMAIL_REGEX.test(data.email)) {
                newErrors.email = 'Podaj prawidłowy adres email'
            }

            // Company validation
            if (data.type === 'company') {
                if (!data.nip?.trim()) newErrors.nip = 'NIP jest wymagany dla firmy'
                if (data.nip && data.nip.length !== 13) {
                    newErrors.nip = 'NIP musi mieć 10 cyfr'
                }
                if (!data.companyName?.trim()) newErrors.companyName = 'Nazwa firmy jest wymagana'
            }
            return newErrors
        },
        []
    )

    const validateShippingForm = useCallback(
        (data: ShippingFormData): Record<string, string> => {
            const newErrors: Record<string, string> = {}

            if (!data.firstName.trim()) newErrors.firstName = 'Imię jest wymagane'
            if (!data.lastName.trim()) newErrors.lastName = 'Nazwisko jest wymagane'
            if (!data.street.trim()) newErrors.street = 'Ulica i numer są wymagane'
            if (!data.postcode.trim()) newErrors.postcode = 'Kod pocztowy jest wymagany'
            if (!data.postcode || !POSTCODE_REGEX.test(data.postcode)) {
                newErrors.postcode = 'Kod pocztowy musi mieć format: XX-XXX'
            }
            if (!data.city.trim()) newErrors.city = 'Miasto jest wymagane'
            if (!data.phone.trim()) newErrors.phone = 'Telefon jest wymagany'
            if (!data.phone || !PHONE_REGEX.test(data.phone.replace(/[\s\-]/g, ''))) {
                newErrors.phone = 'Telefon musi zawierać co najmniej 9 cyfr'
            }

            return newErrors
        },
        []
    )

    const validate = useCallback(
        (data: CheckoutData): ValidationErrors => {
            const newErrors: ValidationErrors = {
                billing: {},
                shipping: {},
                shippingMethod: '',
                paymentMethod: '',
                terms: ''
            }

            console.log(data.billing)
            // Validate billing
            newErrors.billing = validateBillingForm(data.billing)
            console.log(newErrors)
            // Validate shipping if different address
            if (!data.billing.sameAddress && data.shipping) {
                newErrors.shipping = validateShippingForm(data.shipping)
            }

            // Validate selections
            if (!data.shippingMethod) newErrors.shippingMethod = 'Wybierz sposób wysyłki'
            if (!data.paymentMethod) newErrors.paymentMethod = 'Wybierz metodę płatności'
            if (!data.agreeToTerms) newErrors.terms = 'Musisz zaakceptować regulamin'

            setErrors(newErrors)
            return newErrors
        },
        [validateBillingForm, validateShippingForm]
    )

    const updateFieldError = useCallback(
        (section: 'billing' | 'shipping', field: string, error: string) => {
            setErrors(prev => ({
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: error ? error : undefined
                }
            }))
        },
        []
    )

    const getSectionStatus = useCallback(
        (data: CheckoutData): SectionStatus => {
            const billingErrors = validateBillingForm(data.billing)
            console.log(billingErrors)
            const shippingErrors = data.billing.sameAddress
                ? {}
                : validateShippingForm(data.shipping || {} as any)

            return {
                billing: Object.keys(billingErrors).length === 0 ? 'complete' : 'error',
                shipping:
                    data.billing.sameAddress || Object.keys(shippingErrors).length === 0
                        ? 'complete'
                        : 'error',
                shippingMethod: data.shippingMethod ? 'complete' : 'incomplete',
                paymentMethod: data.paymentMethod ? 'complete' : 'incomplete',
                terms: data.agreeToTerms ? 'complete' : 'incomplete'
            }
        },
        [validateBillingForm, validateShippingForm]
    )

    const getCompletionPercentage = useCallback(
        (status: SectionStatus): number => {
            const sections = ['billing', 'shipping', 'shippingMethod', 'paymentMethod', 'terms']
            const completed = sections.filter(
                section =>
                    status[section as keyof SectionStatus] === 'complete' ||
                    status[section as keyof SectionStatus] === 'incomplete'
            ).length
            return Math.round((completed / sections.length) * 100)
        },
        []
    )

    const getCompletionCount = useCallback((status: SectionStatus): { completed: number; total: number } => {
        const sections = ['billing', 'shippingMethod', 'paymentMethod', 'terms']
        const completed = sections.filter(
            section =>
                status[section as keyof SectionStatus] === 'complete'
        ).length
        return { completed, total: sections.length }
    }, [])

    const markBillingTouched = useCallback(() => {
        setBillingTouched(true)
    }, [])

    return {
        errors,
        validate,
        updateFieldError,
        getSectionStatus,
        getCompletionPercentage,
        getCompletionCount,
        validateBillingForm,
        validateShippingForm,
        billingTouched,
        markBillingTouched
    }
}
