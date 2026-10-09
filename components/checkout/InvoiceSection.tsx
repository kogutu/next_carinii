'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import FormInput from './FormInput'
import { formatNIP, formatPostcode } from '@/hooks/useMaskedInput'
import { useGusLookup, type GusCompany, type GusStatus } from '@/hooks/useGusLookup'
import type { CustomerFormData, FieldErrors, InvoiceFormData } from '@/hooks/useCheckoutValidation'
import { isValidNip } from '@/lib/nip'
import { resolveInvoiceBuyer } from '@/lib/invoice'

type InvoiceSectionProps = {
    customer: CustomerFormData
    enabled: boolean
    onEnabledChange: (enabled: boolean) => void
    value: InvoiceFormData
    onChange: (value: InvoiceFormData) => void
    errors: FieldErrors
    showAllErrors: boolean
}

type GusMessageProps = {
    status: GusStatus
    inactive: boolean
}

const GusMessage = ({ status, inactive }: GusMessageProps) => {
    if (status === 'loading') {
        return (
            <p className="flex items-center gap-1.5 text-blue-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Pobieram dane z GUS…
            </p>
        )
    }
    if (status === 'found') {
        return (
            <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-green-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dane firmy pobrane z GUS — sprawdź i popraw w razie potrzeby.
                </p>
                {inactive && (
                    <p className="flex items-center gap-1.5 text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5" /> W GUS firma ma zakończoną działalność.
                    </p>
                )}
            </div>
        )
    }
    if (status === 'not-found' || status === 'error') {
        return (
            <p className="flex items-center gap-1.5 text-amber-700">
                <Info className="w-3.5 h-3.5" />
                {status === 'not-found'
                    ? 'Nie znaleziono firmy w GUS — uzupełnij dane ręcznie.'
                    : 'GUS jest chwilowo niedostępny — uzupełnij dane ręcznie.'}
            </p>
        )
    }
    return null
}

export default function InvoiceSection({
    customer,
    enabled,
    onEnabledChange,
    value,
    onChange,
    errors,
    showAllErrors,
}: InvoiceSectionProps) {
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const update = (patch: Partial<InvoiceFormData>) => onChange({ ...value, ...patch })
    const touch = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }))
    const errorFor = (field: string) => (showAllErrors || touched[field] ? errors[field] : undefined)

    const { status, inactive, lookup } = useGusLookup((company: GusCompany) =>
        onChange({
            nip: value.nip,
            companyName: company.companyName,
            street: company.street,
            postcode: company.postcode,
            city: company.city,
        }),
    )

    const handleNipChange = (raw: string) => {
        const nip = formatNIP(raw)
        update({ nip })
        lookup(nip)
    }

    // Pola firmy pokazujemy dopiero przy poprawnym NIP (przy awarii GUS wypełnia się je ręcznie).
    // Bez NIP faktura idzie na osobę prywatną — dane bierzemy z formularza dostawy.
    const showCompanyFields = isValidNip(value.nip)
    const privateBuyer = resolveInvoiceBuyer(customer, { ...value, nip: '' })

    return (
        <div className="mt-6 pt-5 border-t-2 border-[#f8f4f1]">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
                <input
                    id="checkout-invoiceEnabled"
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onEnabledChange(e.target.checked)}
                    className="w-5 h-5 accent-[#441c49] cursor-pointer"
                />
                <span className="font-medium text-sm">Chcę otrzymać fakturę VAT na firmę</span>
            </label>

            {enabled && (
                <div className="mt-4 space-y-4 bg-[#f8f4f1] p-4 rounded-lg">
                    <FormInput
                        name="invoice-nip"
                        label="NIP (dla firm)"
                        required={false}
                        inputMode="numeric"
                        autoComplete="off"
                        value={value.nip}
                        onChange={handleNipChange}
                        onBlur={touch('nip')}
                        error={errorFor('nip')}
                        hint={
                            value.nip.trim() ? (
                                <GusMessage status={status} inactive={inactive} />
                            ) : (
                                <span className="text-gray-500">
                                    Bez NIP wystawimy fakturę na: {privateBuyer.companyName || 'imię i nazwisko z formularza'}
                                    {privateBuyer.street && `, ${privateBuyer.street}, ${privateBuyer.postcode} ${privateBuyer.city}`}.
                                </span>
                            )
                        }
                    />

                    {showCompanyFields && (
                        <>
                            <FormInput
                                name="invoice-companyName"
                                label="Nazwa firmy"
                                autoComplete="organization"
                                value={value.companyName}
                                onChange={(companyName) => update({ companyName })}
                                onBlur={touch('companyName')}
                                error={errorFor('companyName')}
                            />
                            <FormInput
                                name="invoice-street"
                                label="Ulica i numer"
                                autoComplete="off"
                                value={value.street}
                                onChange={(street) => update({ street })}
                                onBlur={touch('street')}
                                error={errorFor('street')}
                            />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    name="invoice-postcode"
                                    label="Kod pocztowy"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={value.postcode}
                                    onChange={(postcode) => update({ postcode: formatPostcode(postcode) })}
                                    onBlur={touch('postcode')}
                                    error={errorFor('postcode')}
                                />
                                <FormInput
                                    name="invoice-city"
                                    label="Miasto"
                                    autoComplete="off"
                                    value={value.city}
                                    onChange={(city) => update({ city })}
                                    onBlur={touch('city')}
                                    error={errorFor('city')}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
