import { normalizeNip } from '@/lib/nip'
import { countryIso } from '@/lib/countries'
import type { CustomerFormData, InvoiceFormData } from '@/hooks/useCheckoutValidation'

export type InvoiceBuyer = {
    // pusty NIP = faktura na osobę prywatną
    nip: string
    // imię i nazwisko do adresu rozliczeniowego (firma: osoba kontaktowa z dostawy)
    firstName: string
    lastName: string
    companyName: string
    street: string
    postcode: string
    city: string
    country: string
}

export const hasCompanyNip = (invoice: InvoiceFormData): boolean => normalizeNip(invoice.nip).length > 0

// Nabywca na fakturze: firma z NIP (dane z GUS/formularza) albo osoba prywatna z własnymi danymi
// rozliczeniowymi — wtedy „nazwa firmy” = imię i nazwisko.
export const resolveInvoiceBuyer = (customer: CustomerFormData, invoice: InvoiceFormData): InvoiceBuyer => {
    if (invoice.type === 'company' && hasCompanyNip(invoice)) {
        return {
            nip: invoice.nip,
            firstName: customer.firstName,
            lastName: customer.lastName,
            companyName: invoice.companyName,
            street: invoice.street,
            postcode: invoice.postcode,
            city: invoice.city,
            country: 'PL',
        }
    }

    const person = invoice.person
    return {
        nip: '',
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        companyName: `${person.firstName} ${person.lastName}`.trim(),
        street: person.street,
        postcode: person.postcode,
        city: person.city,
        country: countryIso(person.country),
    }
}
