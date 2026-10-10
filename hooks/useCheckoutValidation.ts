import { isValidNip } from '@/lib/nip'
import { DEFAULT_COUNTRY } from '@/lib/countries'

export type CustomerFormData = {
    firstName: string
    lastName: string
    email: string
    phoneCode: string
    phone: string
    street: string
    postcode: string
    city: string
    country: string
}

// Nabywca faktury: firma (z NIP) albo osoba prywatna (bez NIP, dane z formularza dostawy)
export type InvoiceBuyerType = 'company' | 'private'

export type InvoiceFormData = {
    type: InvoiceBuyerType
    nip: string
    companyName: string
    street: string
    postcode: string
    city: string
}

export type InpostPoint = {
    name?: string
    address?: any
    img?: string
}

export type CheckoutData = {
    customer: CustomerFormData
    // null = zamówienie bez faktury (paragon)
    invoice: InvoiceFormData | null
    shippingMethod: string
    paymentMethod: string
    agreeToTerms: boolean
    agreeToNewsletter: boolean
    inpost: InpostPoint
}

export type FieldErrors = Record<string, string>

export type CheckoutErrors = {
    customer: FieldErrors
    invoice: FieldErrors
    shippingMethod: string
    paymentMethod: string
    terms: string
}

export const INPOST_PARCEL_LOCKER = 'inpostparcels_inpostparcels'

export const EMPTY_CUSTOMER: CustomerFormData = {
    firstName: '',
    lastName: '',
    email: '',
    phoneCode: '+48',
    phone: '',
    street: '',
    postcode: '',
    city: '',
    country: DEFAULT_COUNTRY,
}

export const EMPTY_INVOICE: InvoiceFormData = {
    type: 'company',
    nip: '',
    companyName: '',
    street: '',
    postcode: '',
    city: '',
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\d{9,}$/
const POSTCODE_REGEX = /^\d{2}-\d{3}$/

const validatePostcode = (postcode: string, country: string): string | undefined => {
    if (!postcode.trim()) return 'Kod pocztowy jest wymagany'
    if (country === DEFAULT_COUNTRY && !POSTCODE_REGEX.test(postcode)) {
        return 'Kod pocztowy musi mieć format: XX-XXX'
    }
}

export const validateCustomer = (data: CustomerFormData): FieldErrors => {
    const errors: FieldErrors = {}

    if (!data.firstName.trim()) errors.firstName = 'Imię jest wymagane'
    if (!data.lastName.trim()) errors.lastName = 'Nazwisko jest wymagane'

    if (!data.email.trim()) errors.email = 'Email jest wymagany'
    else if (!EMAIL_REGEX.test(data.email.trim())) errors.email = 'Podaj prawidłowy adres email'

    if (!data.phone.trim()) errors.phone = 'Telefon jest wymagany'
    else if (!PHONE_REGEX.test(data.phone.replace(/[\s-]/g, ''))) {
        errors.phone = 'Telefon musi zawierać co najmniej 9 cyfr'
    }

    if (!data.street.trim()) errors.street = 'Ulica i numer są wymagane'

    const postcodeError = validatePostcode(data.postcode, data.country)
    if (postcodeError) errors.postcode = postcodeError

    if (!data.city.trim()) errors.city = 'Miasto jest wymagane'

    return errors
}

export const validateInvoice = (data: InvoiceFormData): FieldErrors => {
    const errors: FieldErrors = {}

    // osoba prywatna nie ma NIP — fakturę wystawiamy na dane z formularza dostawy, nic więcej nie sprawdzamy
    if (data.type === 'private') return errors

    if (!data.nip.trim()) {
        errors.nip = 'Podaj NIP firmy'
        return errors
    }

    if (!isValidNip(data.nip)) {
        errors.nip = 'Nieprawidłowy numer NIP'
        return errors
    }

    if (!data.companyName.trim()) errors.companyName = 'Nazwa firmy jest wymagana'
    if (!data.street.trim()) errors.street = 'Ulica i numer są wymagane'

    const postcodeError = validatePostcode(data.postcode, DEFAULT_COUNTRY)
    if (postcodeError) errors.postcode = postcodeError

    if (!data.city.trim()) errors.city = 'Miasto jest wymagane'

    return errors
}

export const validateCheckout = (data: CheckoutData): CheckoutErrors => ({
    customer: validateCustomer(data.customer),
    invoice: data.invoice ? validateInvoice(data.invoice) : {},
    shippingMethod: !data.shippingMethod
        ? 'Wybierz sposób wysyłki'
        : data.shippingMethod === INPOST_PARCEL_LOCKER && !data.inpost.name
            ? 'Wybierz paczkomat'
            : '',
    paymentMethod: data.paymentMethod ? '' : 'Wybierz metodę płatności',
    terms: data.agreeToTerms ? '' : 'Musisz zaakceptować regulamin',
})

export const countCheckoutErrors = (errors: CheckoutErrors): number =>
    Object.keys(errors.customer).length +
    Object.keys(errors.invoice).length +
    [errors.shippingMethod, errors.paymentMethod, errors.terms].filter(Boolean).length
