'use client'

import { useState, useEffect, useRef } from 'react'
import FormInput from './FormInput'
import SectionHeader from './SectionHeader'

import { formatNIP, formatPostcode, formatPhone } from '@/hooks/useMaskedInput'
import { useDebouncedCallback } from '@/hooks/useDebounce'
import { BillingFormData, useCheckoutValidation } from '@/hooks/useCheckoutValidation'
import { SectionStatus } from './checkoutValidationStore'


const PHONE_CODES = [
    { code: '+48', country: 'Polska' },
    { code: '+44', country: 'Wielka Brytania' },
    { code: '+33', country: 'Francja' },
    { code: '+49', country: 'Niemcy' },
    { code: '+39', country: 'Włochy' },
    { code: '+34', country: 'Hiszpania' },
    { code: '+31', country: 'Holandia' },
    { code: '+43', country: 'Austria' },
    { code: '+41', country: 'Szwajcaria' },
    { code: '+46', country: 'Szwecja' },
    { code: '+47', country: 'Norwegia' },
    { code: '+45', country: 'Dania' },
    { code: '+358', country: 'Finlandia' },
    { code: '+353', country: 'Irlandia' },
    { code: '+30', country: 'Grecja' },
    { code: '+32', country: 'Belgia' },
    { code: '+352', country: 'Luksemburg' },
    { code: '+40', country: 'Rumunia' },
    { code: '+36', country: 'Węgry' },
    { code: '+42', country: 'Czechy' },
    { code: '+421', country: 'Słowacja' },
]

const COUNTRIES = ['Polska', 'Wielka Brytania', 'Francja', 'Niemcy', 'Włochy', 'Hiszpania', 'Holandia', 'Austria', 'Szwajcaria', 'Szwecja', 'Norwegia', 'Dania', 'Finlandia', 'Irlandia', 'Grecja', 'Belgia', 'Luksemburg', 'Rumunia', 'Węgry', 'Czechy', 'Słowacja']

type CustomerType = 'private' | 'company'
type DocumentType = 'receipt' | 'invoice'

interface BillingFormProps {
    onValidationChange?: (data: BillingFormData, isValid: boolean) => void
    onTouched?: () => void
    status?: SectionStatus
    errors?: Record<string, string>
    isTouched?: boolean
    initialBillingData?: BillingFormData
}

export default function BillingForm({ onValidationChange, onTouched, status, errors = {}, isTouched = false, initialBillingData }: BillingFormProps) {
    const { validateBillingForm } = useCheckoutValidation()
    const [type, setType] = useState<CustomerType>('private')
    const [documentType, setDocumentType] = useState<DocumentType>('receipt')
    const [nip, setNip] = useState('')
    const [loadingGus, setLoadingGus] = useState(false)
    const [sameAddress, setSameAddress] = useState(true)
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

    const [form, setForm] = useState({
        companyName: '',
        firstName: '',
        lastName: '',
        street: '',
        postcode: '',
        city: '',
        country: 'Polska',
        phone: '',
        phoneCode: '+48',
        email: ''
    })


    // SYNC Z DANYMI Z RODZICA - DODAJ TEN useEffect
    const hasInitialLoaded = useRef(false);

    useEffect(() => {
        if (initialBillingData && initialBillingData.firstName && !hasInitialLoaded.current) {
            console.log(initialBillingData)
            setType(initialBillingData.type)
            setDocumentType(initialBillingData.documentType || 'receipt')
            setNip(initialBillingData.nip || '')
            setSameAddress(initialBillingData.sameAddress)
            setForm({
                companyName: initialBillingData.companyName || '',
                firstName: initialBillingData.firstName || '',
                lastName: initialBillingData.lastName || '',
                street: initialBillingData.street || '',
                postcode: initialBillingData.postcode || '',
                city: initialBillingData.city || '',
                country: initialBillingData.country || 'Polska',
                phone: initialBillingData.phone || '',
                phoneCode: initialBillingData.phoneCode || '+48',
                email: initialBillingData.email || ''
            })
            hasInitialLoaded.current = true;
        }
    }, [initialBillingData])

    // Auto-set documentType when type changes
    useEffect(() => {
        if (type === 'company') {
            setDocumentType('invoice')
        } else {
            setDocumentType('receipt')
        }
    }, [type])


    // Real-time validation
    useEffect(() => {
        const billingData: BillingFormData = {
            type,
            ...form,
            nip,
            documentType,
            sameAddress
        }

        // Only validate and show errors if touched
        if (isTouched) {
            console.clear();

            const validationErrors = validateBillingForm(billingData)
            console.log(validationErrors)
            setLocalErrors(validationErrors)
        }

        console.log("+++++++++++++");
        console.log('isTouched', isTouched);

        console.log(isTouched ? Object.keys(validateBillingForm(billingData)).length === 0 : false)
        console.log(Object.keys(validateBillingForm(billingData)).length === 0)
        console.log(validateBillingForm(billingData))
        console.log("+++++++++++++");
        // ALWAYS send data to parent, even if not touched (for sameAddress changes)
        if (onValidationChange) {
            onValidationChange(billingData, isTouched ? Object.keys(validateBillingForm(billingData)).length === 0 : false)
        }
    }, [form, type, nip, documentType, sameAddress, validateBillingForm, onValidationChange, isTouched])

    // Wrap the fetch function with debounce
    const debouncedFetchGus = useDebouncedCallback(async (nipValue: string) => {

        if (!validateNIP(nipValue)) return

        setLoadingGus(true)

        const res = await fetch('/api/gus', {
            method: 'POST',
            body: JSON.stringify({ nip: nipValue })
        })

        const data = await res.json()
        console.log(data);
        if (!data.error) {
            setForm(prev => ({
                ...prev,
                companyName: data.Nazwa,
                firstName: data.firstname,
                lastName: data.lastname,
                street: data.street,
                city: data.Miejscowosc,
                postcode: data.KodPocztowy
            }))
        }

        setLoadingGus(false)
    }, 500) // 500ms delay

    // Handler for input changes
    const handleNipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = formatNIP(e.target.value)
        console.log(value)
        setNip(value)
        debouncedFetchGus(value) // This will be debounced
    }
    const validateNIP = (nip: string) => {
        // Usuń wszystkie znaki niebędące cyframi
        const cleanNIP = nip.replace(/\D/g, '');

        // Sprawdź czy ma dokładnie 10 cyfr
        if (cleanNIP.length !== 10) {
            return false;
        }

        // Wagi dla poszczególnych cyfr
        const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];

        // Konwertuj string na tablicę cyfr
        const digits = cleanNIP.split('').map(Number);

        // Oblicz sumę kontrolną
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += digits[i] * weights[i];
        }

        // Oblicz cyfrę kontrolną
        const controlDigit = sum % 11;

        // Sprawdź czy cyfra kontrolna jest poprawna
        // Jeśli wynik to 10, NIP jest nieprawidłowy
        if (controlDigit === 10) {
            return false;
        }

        return controlDigit === digits[9];
    }

    const validateNIPWithFormat = (nip: string) => {
        // Dozwolone formaty:
        // - 1234567890
        // - 123-45-67-890
        // - 123-456-78-90
        // - 123 456 78 90

        const cleanNIP = nip.replace(/[-\s]/g, '');

        if (!validateNIP(cleanNIP)) {
            return {
                isValid: false,
                formatted: null,
                error: 'Nieprawidłowy numer NIP'
            };
        }

        // Formatuj NIP (XXX-XXX-XX-XX)
        const formatted = cleanNIP.replace(
            /(\d{3})(\d{3})(\d{2})(\d{2})/,
            '$1-$2-$3-$4'
        );

        return {
            isValid: true,
            formatted: formatted,
            error: null
        };
    }


    return (
        <div className="space-y-6">

            <SectionHeader
                title="1. Dane rozliczeniowe"
                hasErrors={Object.keys(localErrors).length > 0 ? true : false}
            />


            <div className="grid md:grid-cols-2 gap-6 bg-[#f8f4f1] p-4 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        checked={type === 'private'}
                        onChange={() => setType('private')}
                        className="w-4 h-4 accent-[#441c49]"
                    />
                    <span className="font-medium">Osoba prywatna</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="radio"
                        checked={type === 'company'}
                        onChange={() => setType('company')}
                        className="w-4 h-4 accent-[#441c49]"
                    />
                    <span className="font-medium">Firma</span>
                </label>
            </div>

            {/* Document Type Selection */}

            <div className="grid md:grid-cols-1 gap-1 bg-[#f8f4f1] p-4 rounded-lg">
                <label htmlFor="" className="w-full text-gray-500">Rodzaj dokumentu:</label>
                <div className="grid md:grid-cols-2 gap-6 ">

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={documentType === 'receipt'}
                            onChange={() => setDocumentType('receipt')}
                            className="w-4 h-4 accent-[#441c49] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`font-medium `}>Paragon</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            checked={documentType === 'invoice'}
                            onChange={() => setDocumentType('invoice')}
                            className="w-4 h-4 accent-[#441c49] disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <span className={`font-medium `}>Faktura</span>
                    </label>
                </div>

            </div>

            {type === 'company' && (
                <>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder=" "
                            value={nip}

                            onChange={handleNipChange}
                            className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                        />
                        <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                            NIP *
                        </label>
                        {loadingGus && <p className="text-xs text-blue-500 mt-1">Pobieranie danych z GUS...</p>}
                        {localErrors.nip && <p className="text-xs text-red-500 mt-1">{localErrors.nip}</p>}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder=" "
                            value={form.companyName}
                            onChange={(e) => {
                                onTouched?.()
                                setForm({ ...form, companyName: e.target.value })
                            }}
                            className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                        />
                        <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                            Nazwa firmy *
                        </label>
                        {localErrors.companyName && <p className="text-xs text-red-500 mt-1">{localErrors.companyName}</p>}
                    </div>
                </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder=" "
                        value={form.firstName}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, firstName: e.target.value })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Imię *
                    </label>
                    {localErrors.firstName && <p className="text-xs text-red-500 mt-1">{localErrors.firstName}</p>}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder=" "
                        value={form.lastName}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, lastName: e.target.value })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Nazwisko *
                    </label>
                    {localErrors.lastName && <p className="text-xs text-red-500 mt-1">{localErrors.lastName}</p>}
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder=" "
                    value={form.street}
                    onChange={(e) => {
                        onTouched?.()
                        setForm({ ...form, street: e.target.value })
                    }}
                    className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                />
                <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                    Ulica i numer *
                </label>
                {localErrors.street && <p className="text-xs text-red-500 mt-1">{localErrors.street}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        inputMode="numeric"

                        placeholder=" "
                        value={form.postcode}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, postcode: formatPostcode(e.target.value) })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Kod pocztowy *
                    </label>
                    {localErrors.postcode && <p className="text-xs text-red-500 mt-1">{localErrors.postcode}</p>}
                    <p className="text-xs text-gray-500 mt-1">format: XX-XXX</p>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        placeholder=" "
                        value={form.city}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, city: e.target.value })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Miasto *
                    </label>
                    {localErrors.city && <p className="text-xs text-red-500 mt-1">{localErrors.city}</p>}
                </div>
                <div className="space-y-1 relative">
                    <select
                        value={form.country}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, country: e.target.value })
                        }}
                        className="w-full px-3 pt-7  py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#441c49] text-sm"
                    >
                        {COUNTRIES.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                    <label className="text-sm text-gray-400 block absolute top-2 left-3">Kraj *</label>
                    {localErrors.country && <p className="text-xs text-red-500">{localErrors.country}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1 relative">
                    <select
                        value={form.phoneCode}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, phoneCode: e.target.value })
                        }}
                        className="w-full px-3 pt-7  py-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#441c49] text-sm"
                    >
                        {PHONE_CODES.map(({ code, country }) => (
                            <option key={code} value={code}>{code} {country}</option>
                        ))}
                    </select>
                    <label className="text-sm text-gray-400 block absolute top-2 left-3">Kierunkowy *</label>
                    {localErrors.phoneCode && <p className="text-xs text-red-500">{localErrors.phoneCode}</p>}
                </div>

                <div className="sm:col-span-3 relative">
                    <input
                        type="text"
                        inputMode="numeric"
                        placeholder=" "
                        value={form.phone}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, phone: formatPhone(e.target.value) })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Telefon *
                    </label>
                    {localErrors.phone && <p className="text-xs text-red-500 mt-1">{localErrors.phone}</p>}

                </div>
            </div>

            <div className="relative">
                <input
                    type="email"
                    placeholder=" "
                    value={form.email}
                    onChange={(e) => {
                        onTouched?.()
                        setForm({ ...form, email: e.target.value })
                    }}
                    className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                />
                <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                    Email *
                </label>
                {localErrors.email && <p className="text-xs text-red-500 mt-1">{localErrors.email}</p>}
            </div>

            {/* Address Checkbox */}
            <div className="flex items-center gap-3 pt-4 border-t-2 border-[#f8f4f1]">
                <input
                    type="checkbox"
                    id="sameAddress"
                    checked={sameAddress}
                    onChange={() => setSameAddress(!sameAddress)}
                    className="w-5 h-5 accent-[#441c49] cursor-pointer"
                />
                <label htmlFor="sameAddress" className="cursor-pointer font-medium text-sm">
                    Mój adres rozliczeniowy oraz adres dostawy są takie same
                </label>
            </div>
        </div>
    )
}
