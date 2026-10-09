import { formatPhone, formatPostcode } from '@/hooks/useMaskedInput'

// Dane kontaktowe i adres dostawy zebrane w oknie Apple Pay / Google Pay, sprowadzone do postaci używanej przez zamówienie.
export type WalletContact = {
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

// Magento wymaga nazwiska — gdy portfel poda jeden człon, używamy myślnika
const splitName = (fullName: string): { firstName: string; lastName: string } => {
    const [first = '', ...rest] = fullName.trim().split(/\s+/)
    return { firstName: first, lastName: rest.join(' ') || '-' }
}

// „+48 600 100 200”, „48600100200”, „600100200” → „600 100 200”
export const normalizePhone = (value: string | undefined): string => {
    const digits = (value ?? '').replace(/\D/g, '')
    const national = digits.length > 9 ? digits.slice(-9) : digits
    return formatPhone(national)
}

export const normalizePostcode = (value: string | undefined): string => formatPostcode(value ?? '')

type AppleContact = {
    givenName?: string
    familyName?: string
    emailAddress?: string
    phoneNumber?: string
    addressLines?: string[]
    postalCode?: string
    locality?: string
    countryCode?: string
}

export const contactFromApple = (contact: AppleContact): WalletContact => ({
    firstName: (contact.givenName ?? '').trim(),
    lastName: (contact.familyName ?? '').trim() || '-',
    email: (contact.emailAddress ?? '').trim(),
    phoneCode: '+48',
    phone: normalizePhone(contact.phoneNumber),
    street: (contact.addressLines ?? []).join(' ').trim(),
    postcode: normalizePostcode(contact.postalCode),
    city: (contact.locality ?? '').trim(),
    country: (contact.countryCode ?? 'PL').toUpperCase(),
})

type GoogleAddress = {
    name?: string
    address1?: string
    address2?: string
    address3?: string
    postalCode?: string
    locality?: string
    countryCode?: string
    phoneNumber?: string
}

export const contactFromGoogle = (email: string | undefined, address: GoogleAddress): WalletContact => ({
    ...splitName(address.name ?? ''),
    email: (email ?? '').trim(),
    phoneCode: '+48',
    phone: normalizePhone(address.phoneNumber),
    street: [address.address1, address.address2, address.address3].filter(Boolean).join(' ').trim(),
    postcode: normalizePostcode(address.postalCode),
    city: (address.locality ?? '').trim(),
    country: (address.countryCode ?? 'PL').toUpperCase(),
})

// Zamówienie wymaga kompletu danych — brak czegokolwiek to błąd po stronie portfela, nie tworzymy zamówienia „na pół”.
export const missingContactFields = (contact: WalletContact): string[] => {
    const required: Array<[keyof WalletContact, string]> = [
        ['firstName', 'imię'],
        ['email', 'e-mail'],
        ['phone', 'telefon'],
        ['street', 'adres'],
        ['postcode', 'kod pocztowy'],
        ['city', 'miasto'],
    ]
    return required.filter(([field]) => !contact[field]).map(([, label]) => label)
}
