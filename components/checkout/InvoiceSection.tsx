'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import FormInput from './FormInput'
import { formatNIP, formatPostcode } from '@/hooks/useMaskedInput'
import { useGusLookup, type GusCompany, type GusStatus } from '@/hooks/useGusLookup'
import type { CustomerFormData, FieldErrors, InvoiceBuyerType, InvoiceFormData } from '@/hooks/useCheckoutValidation'
import { isValidNip } from '@/lib/nip'
import { resolveInvoiceBuyer } from '@/lib/invoice'
import { cn } from '@/lib/utils'

const BUYER_TYPES: { value: InvoiceBuyerType; label: string }[] = [
    { value: 'company', label: 'Firma' },
    { value: 'private', label: 'Osoba prywatna' },
]

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
            <p className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin motion-reduce:animate-none" /> Pobieram dane z GUS…
            </p>
        )
    }
    if (status === 'found') {
        return (
            <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Dane firmy pobrane z GUS — sprawdź i popraw w razie potrzeby.
                </p>
                {inactive && (
                    <p className="flex items-center gap-1.5 text-warning">
                        <AlertTriangle className="w-3.5 h-3.5" /> W GUS firma ma zakończoną działalność.
                    </p>
                )}
            </div>
        )
    }
    if (status === 'not-found' || status === 'error') {
        return (
            <p className="flex items-center gap-1.5 text-warning">
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
            type: 'company',
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
    const showCompanyFields = isValidNip(value.nip)
    // Osoba prywatna nie ma NIP: faktura idzie na imię i nazwisko oraz adres z formularza dostawy.
    const privateBuyer = resolveInvoiceBuyer(customer, { ...value, type: 'private' })

    return (
        <div className="mt-6 border-t border-border pt-5">
            <label className="flex min-h-11 w-fit cursor-pointer items-center gap-3">
                <input
                    id="checkout-invoiceEnabled"
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => onEnabledChange(e.target.checked)}
                    className="size-5 cursor-pointer accent-black"
                />
                <span className="text-sm font-medium text-foreground">Chcę otrzymać fakturę VAT</span>
            </label>

            {enabled && (
                <div className="mt-4 space-y-4 rounded-xl bg-muted/60 p-4">
                    <div role="radiogroup" aria-label="Faktura dla" className="grid grid-cols-2 gap-2">
                        {BUYER_TYPES.map((option) => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 bg-background px-3 text-sm font-semibold text-foreground transition-colors motion-reduce:transition-none',
                                    value.type === option.value ? 'border-foreground' : 'border-border hover:border-foreground/50',
                                )}
                            >
                                <input
                                    type="radio"
                                    name="invoice-type"
                                    checked={value.type === option.value}
                                    onChange={() => update({ type: option.value })}
                                    className="size-4 shrink-0 accent-black"
                                />
                                {option.label}
                            </label>
                        ))}
                    </div>

                    {value.type === 'private' ? (
                        <p className="text-pretty text-sm text-muted-foreground">
                            Fakturę wystawimy na: <span className="font-medium text-foreground">{privateBuyer.companyName || 'imię i nazwisko z formularza'}</span>
                            {privateBuyer.street && `, ${privateBuyer.street}, ${privateBuyer.postcode} ${privateBuyer.city}`}.
                            Nie musisz podawać NIP.
                        </p>
                    ) : (
                        <>
                            <FormInput
                                name="invoice-nip"
                                label="NIP"
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
                                        <span className="text-muted-foreground">Po wpisaniu NIP uzupełnimy dane firmy z GUS.</span>
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
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
