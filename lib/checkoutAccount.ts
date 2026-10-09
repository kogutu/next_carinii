import { formatNIP, formatPhone } from '@/hooks/useMaskedInput'
import type { CustomerFormData, InvoiceFormData } from '@/hooks/useCheckoutValidation'

// Kształt odpowiedzi /api/user/getuser (getUser.php) w zakresie, którego używa checkout
type AccountAddress = {
    firstName?: string
    lastName?: string
    street?: string
    city?: string
    postal?: string
    country?: string
    // tylko billingAddress
    customerType?: string
    companyName?: string
    nip?: string
}

export type AccountData = {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    billingAddress?: AccountAddress | null
    shippingAddress?: AccountAddress | null
}

export type AccountCheckoutPrefill = {
    customer: CustomerFormData
    // null = konto nie ma danych firmowych, nie zmieniamy stanu faktury
    invoice: InvoiceFormData | null
}

const PHONE_WITH_CODE = /^(\+\d{1,3})\s?(.+)$/

const parsePhone = (phone: string | undefined, fallbackCode: string) => {
    const match = phone?.match(PHONE_WITH_CODE)
    return match
        ? { phoneCode: match[1], phone: formatPhone(match[2]) }
        : { phoneCode: fallbackCode, phone: formatPhone(phone ?? '') }
}

const orKeep = (value: string | undefined, current: string) => (value?.trim() ? value.trim() : current)

// Dane konta uzupełniają tylko puste miejsca z konta — to, czego konto nie ma, zostaje z formularza.
export const mapAccountToCheckout = (
    account: AccountData,
    current: CustomerFormData,
): AccountCheckoutPrefill => {
    const billing = account.billingAddress ?? {}
    const shipping = account.shippingAddress ?? {}

    const isCompany = billing.customerType === 'company' || Boolean(billing.nip)
    // Adres firmy z konta nie jest adresem dostawy — nie podstawiamy go jako dostawy
    const delivery: AccountAddress = shipping.street ? shipping : isCompany ? {} : billing
    const phone = parsePhone(account.phone, current.phoneCode)

    const customer: CustomerFormData = {
        firstName: orKeep(delivery.firstName || account.firstName, current.firstName),
        lastName: orKeep(delivery.lastName || account.lastName, current.lastName),
        email: orKeep(account.email, current.email),
        phoneCode: phone.phoneCode,
        phone: orKeep(phone.phone, current.phone),
        street: orKeep(delivery.street, current.street),
        postcode: orKeep(delivery.postal, current.postcode),
        city: orKeep(delivery.city, current.city),
        country: orKeep(delivery.country, current.country),
    }

    const invoice: InvoiceFormData | null = isCompany
        ? {
            nip: formatNIP(billing.nip ?? ''),
            companyName: billing.companyName ?? '',
            street: billing.street ?? '',
            postcode: billing.postal ?? '',
            city: billing.city ?? '',
        }
        : null

    return { customer, invoice }
}
