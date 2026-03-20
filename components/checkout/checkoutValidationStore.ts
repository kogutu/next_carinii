import { create } from 'zustand'

export interface ValidationErrors {
    billing: Record<string, string>
    shipping: Record<string, string>
    shippingMethod: string
    paymentMethod: string
    terms: string
}

export type SectionStatusType = 'complete' | 'incomplete' | 'error'

export interface SectionStatus {
    billing: SectionStatusType
    shipping: SectionStatusType
    shippingMethod: SectionStatusType
    paymentMethod: SectionStatusType
    terms: SectionStatusType
}

export interface CheckoutValidationStore {
    errors: ValidationErrors
    status: SectionStatus
    billingTouched: boolean
    shippingTouched: boolean
    sameAddress: boolean
    isExpanded: boolean
    expandedSection: string | null
    shippingMethod: string
    paymentMethod: string
    shippingTotal: number

    // Actions
    setErrors: (errors: ValidationErrors) => void
    setStatus: (status: any) => void
    setBillingTouched: (touched: boolean) => void
    setShippingTouched: (touched: boolean) => void
    setSameAddress: (same: boolean) => void
    setIsExpanded: (expanded: boolean) => void
    setExpandedSection: (section: string | null) => void
    setShippingMethod: (method: string) => void
    setPaymentMethod: (method: string) => void
    updateSectionStatus: (section: keyof SectionStatus, status: SectionStatusType) => void
    updateSectionErrors: (section: keyof Omit<ValidationErrors, 'shippingMethod' | 'paymentMethod' | 'terms'>, errors: Record<string, string>) => void
    updateFieldError: (section: string, field: string, error: string) => void
    clearFieldError: (section: string, field: string) => void
}

export const useCheckoutValidationStore = create<CheckoutValidationStore>((set) => ({
    errors: {
        billing: {},
        shipping: {},
        shippingMethod: '',
        paymentMethod: '',
        terms: ''
    },
    status: {
        billing: 'incomplete',
        shipping: 'incomplete',
        shippingMethod: 'complete',
        paymentMethod: 'complete',
        terms: 'incomplete'
    },
    billingTouched: false,
    shippingTouched: false,
    shippingMethod: 'dhl_dhl24pl_courier',
    paymentMethod: 'checkmo',
    sameAddress: true,
    isExpanded: false,
    expandedSection: null,
    shippingTotal: 0,

    setErrors: (errors) => set({ errors }),
    setStatus: (status) => set({ status }),
    setBillingTouched: (touched) => {
        console.log('setBillingTouched', touched)
        set({ billingTouched: touched })
    },
    setShippingTouched: (touched) => {
        console.log('setShippingTouched', touched)
        set({ shippingTouched: touched })
    },
    setSameAddress: (same) => set({ sameAddress: same }),
    setIsExpanded: (expanded) => set({ isExpanded: expanded }),
    setExpandedSection: (section) => set({ expandedSection: section }),
    setShippingMethod: (method) => set({ shippingMethod: method }),
    setShippingTotal: (total: number) => set({ shippingTotal: total }),
    setPaymentMethod: (method) => set({ paymentMethod: method }),

    updateSectionStatus: (section, status) =>
        set((state) => ({
            status: {
                ...state.status,
                [section]: status
            }
        })),

    updateSectionErrors: (section, errors) =>
        set((state) => ({
            errors: {
                ...state.errors,
                [section]: errors
            }
        })),

    updateFieldError: (section, field, error) =>
        set((state) => ({
            errors: {
                ...state.errors,
                [section]: {
                    ...state.errors[section as keyof ValidationErrors],
                    [field]: error
                }
            }
        })),

    clearFieldError: (section, field) =>
        set((state) => ({
            errors: {
                ...state.errors,
                [section]: {
                    ...state.errors[section as keyof ValidationErrors],
                    [field]: ''
                }
            }
        }))
}))
