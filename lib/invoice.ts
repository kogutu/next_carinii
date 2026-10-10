import { normalizeNip } from '@/lib/nip'
import { countryIso } from '@/lib/countries'
import type { CustomerFormData, InvoiceFormData } from '@/hooks/useCheckoutValidation'

export type InvoiceBuyer = {
    // pusty NIP = faktura na osobę prywatną
    nip: string
    companyName: string
    street: string
    postcode: string
    city: string
    country: string
}

export const hasCompanyNip = (invoice: InvoiceFormData): boolean => normalizeNip(invoice.nip).length > 0

// Nabywca na fakturze: firma z NIP (dane z GUS/formularza) albo osoba prywatna,
// czyli „nazwa firmy” = imię i nazwisko, a adres = adres dostawy.
export const resolveInvoiceBuyer = (customer: CustomerFormData, invoice: InvoiceFormData): InvoiceBuyer =>
    invoice.type === 'company' && hasCompanyNip(invoice)
        ? {
            nip: invoice.nip,
            companyName: invoice.companyName,
            street: invoice.street,
            postcode: invoice.postcode,
            city: invoice.city,
            country: 'PL',
        }
        : {
            nip: '',
            companyName: `${customer.firstName} ${customer.lastName}`.trim(),
            street: customer.street,
            postcode: customer.postcode,
            city: customer.city,
            country: countryIso(customer.country),
        }
