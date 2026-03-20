'use client'

import { useState, useEffect, useRef } from 'react'
import FormInput from './FormInput'
import SectionHeader from './SectionHeader'
import { useCheckoutValidation, ShippingFormData, SectionStatus } from '@/lib/use-checkout-validation'
import { formatPostcode, formatPhone } from '@/hooks/useMaskedInput'

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

interface ShippingFormProps {
    onValidationChange?: (data: ShippingFormData, isValid: boolean) => void
    onTouched?: () => void
    status?: SectionStatus
    isTouched?: boolean
    initialShippingData?: ShippingFormData
}

export default function ShippingForm({ onValidationChange, onTouched, status, isTouched = false, initialShippingData }: ShippingFormProps) {
    const { validateShippingForm } = useCheckoutValidation()
    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        street: '',
        postcode: '',
        city: '',
        country: 'Polska',
        phone: '',
        phoneCode: '+48'
    })

    const hasInitialLoaded = useRef(false)

    useEffect(() => {
        if (initialShippingData && initialShippingData.firstName && !hasInitialLoaded.current) {
            setForm({
                firstName: initialShippingData.firstName || '',
                lastName: initialShippingData.lastName || '',
                street: initialShippingData.street || '',
                postcode: initialShippingData.postcode || '',
                city: initialShippingData.city || '',
                country: initialShippingData.country || 'Polska',
                phone: initialShippingData.phone || '',
                phoneCode: initialShippingData.phoneCode || '+48'
            })
            hasInitialLoaded.current = true
        }
    }, [initialShippingData])

    // Real-time validation
    useEffect(() => {
        const shippingData: ShippingFormData = form
        // Only validate and show errors if touched
        if (isTouched) {
            const validationErrors = validateShippingForm(shippingData)
            setLocalErrors(validationErrors)

            if (onValidationChange) {
                onValidationChange(shippingData, Object.keys(validationErrors).length === 0)
            }
        }
    }, [form, validateShippingForm, onValidationChange, isTouched])

    return (
        <div className="space-y-6">
            <SectionHeader
                title="2. Adres dostawy"

                hasErrors={Object.keys(localErrors).length > 0 ? true : false}
            />
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
                    <label className="absolute left-3 top-2 text-sm font-medium text-gray-600 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
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
                    <label className="absolute left-3 top-2 text-sm font-medium text-gray-600 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
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
                <label className="absolute left-3 top-2 text-sm font-medium text-gray-600 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                    Ulica i numer *
                </label>
                {localErrors.street && <p className="text-xs text-red-500 mt-1">{localErrors.street}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="relative">
                    <input
                        type="text"
                        placeholder=" "
                        value={form.postcode}
                        onChange={(e) => {
                            onTouched?.()
                            setForm({ ...form, postcode: formatPostcode(e.target.value) })
                        }}
                        className="w-full px-3 pt-7  py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                    />
                    <label className="absolute left-3 top-2 text-sm font-medium text-gray-600 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                        Kod pocztowy *
                    </label>
                    {localErrors.postcode && <p className="text-xs text-red-500 mt-1">{localErrors.postcode}</p>}
                    <p className="text-xs text-gray-500 mt-1">XX-XXX</p>
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
                    <label className="absolute left-3 top-2 text-sm font-medium text-gray-600 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
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
                        className="w-full  px-3 pt-7  py-4  border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#441c49] text-sm"
                    >
                        {COUNTRIES.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                    <label className="text-sm text-gray-400 block absolute top-2 left-3">Kraj *</label>
                    {localErrors.country && <p className="text-xs text-red-500">{localErrors.country}</p>}
                </div>
            </div>
        </div>
    )
}
