import { useCartStore } from '@/stores/cartZustand'
import { create } from 'zustand'
import type { CheckoutErrors } from '@/hooks/useCheckoutValidation'

type CheckoutValidationStore = {
    errors: CheckoutErrors
    // true po pierwszej próbie złożenia zamówienia — wtedy pokazujemy wszystkie błędy
    submitAttempted: boolean

    setErrors: (errors: CheckoutErrors) => void
    setSubmitAttempted: (attempted: boolean) => void
}

export const NO_ERRORS: CheckoutErrors = {
    customer: {},
    invoice: {},
    shippingMethod: '',
    paymentMethod: '',
    terms: '',
}

// Metoda płatności ustawiona z koszyka (np. przycisk PayPo na karcie produktu) ma pierwszeństwo
export const getCartPaymentMethod = (): string => {
    const items = useCartStore.getState().items
    return items.reduce((method, item) => item.payment_method ?? method, 'banktransfer')
}

export const useCheckoutValidationStore = create<CheckoutValidationStore>((set) => ({
    errors: NO_ERRORS,
    submitAttempted: false,

    setErrors: (errors) => set({ errors }),
    setSubmitAttempted: (submitAttempted) => set({ submitAttempted }),
}))
