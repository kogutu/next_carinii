'use client'

import { useState } from 'react'
import FormInput, { FormSelect } from './FormInput'
import { COUNTRIES, DEFAULT_COUNTRY } from '@/lib/countries'
import { formatPhone, formatPostcode } from '@/hooks/useMaskedInput'
import type { CustomerFormData, FieldErrors } from '@/hooks/useCheckoutValidation'

const COUNTRY_OPTIONS = COUNTRIES.map(({ name }) => ({ value: name, label: name }))
const PHONE_CODE_OPTIONS = COUNTRIES.map(({ phoneCode, name }) => ({
    value: phoneCode,
    label: `${phoneCode} ${name}`,
}))

// Kierunkowy podąża za krajem, dopóki użytkownik nie ustawił go ręcznie na inny
const phoneCodeAfterCountryChange = (current: CustomerFormData, nextCountry: string): string => {
    const currentCountry = COUNTRIES.find(({ name }) => name === current.country)
    const nextCode = COUNTRIES.find(({ name }) => name === nextCountry)?.phoneCode
    return nextCode && currentCountry?.phoneCode === current.phoneCode ? nextCode : current.phoneCode
}

type CustomerFormProps = {
    value: CustomerFormData
    onChange: (value: CustomerFormData) => void
    errors: FieldErrors
    // po próbie złożenia zamówienia pokazujemy wszystkie błędy naraz
    showAllErrors: boolean
}

export default function CustomerForm({ value, onChange, errors, showAllErrors }: CustomerFormProps) {
    // Błąd pola pojawia się dopiero po opuszczeniu pola (blur) albo po próbie złożenia zamówienia
    const [touched, setTouched] = useState<Record<string, boolean>>({})

    const update = (patch: Partial<CustomerFormData>) => onChange({ ...value, ...patch })
    const touch = (field: string) => () => setTouched((prev) => ({ ...prev, [field]: true }))
    const errorFor = (field: string) => (showAllErrors || touched[field] ? errors[field] : undefined)

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                    name="firstName"
                    label="Imię"
                    autoComplete="given-name"
                    value={value.firstName}
                    onChange={(firstName) => update({ firstName })}
                    onBlur={touch('firstName')}
                    error={errorFor('firstName')}
                />
                <FormInput
                    name="lastName"
                    label="Nazwisko"
                    autoComplete="family-name"
                    value={value.lastName}
                    onChange={(lastName) => update({ lastName })}
                    onBlur={touch('lastName')}
                    error={errorFor('lastName')}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                    name="email"
                    label="Email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={value.email}
                    onChange={(email) => update({ email })}
                    onBlur={touch('email')}
                    error={errorFor('email')}
                />
                <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-2">
                    <FormSelect
                        name="phoneCode"
                        label="Kierunkowy"
                        autoComplete="tel-country-code"
                        display={value.phoneCode}
                        value={value.phoneCode}
                        onChange={(phoneCode) => update({ phoneCode })}
                        options={PHONE_CODE_OPTIONS}
                    />
                    <FormInput
                        name="phone"
                        label="Telefon"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        value={value.phone}
                        onChange={(phone) => update({ phone: formatPhone(phone) })}
                        onBlur={touch('phone')}
                        error={errorFor('phone')}
                    />
                </div>
            </div>

            <FormInput
                name="street"
                label="Ulica i numer"
                autoComplete="address-line1"
                value={value.street}
                onChange={(street) => update({ street })}
                onBlur={touch('street')}
                error={errorFor('street')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormInput
                    name="postcode"
                    label="Kod pocztowy"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={value.postcode}
                    onChange={(postcode) =>
                        update({ postcode: value.country === DEFAULT_COUNTRY ? formatPostcode(postcode) : postcode })
                    }
                    onBlur={touch('postcode')}
                    error={errorFor('postcode')}
                />
                <FormInput
                    name="city"
                    label="Miasto"
                    autoComplete="address-level2"
                    value={value.city}
                    onChange={(city) => update({ city })}
                    onBlur={touch('city')}
                    error={errorFor('city')}
                />
                <FormSelect
                    name="country"
                    label="Kraj"
                    autoComplete="country-name"
                    value={value.country}
                    onChange={(country) => update({ country, phoneCode: phoneCodeAfterCountryChange(value, country) })}
                    options={COUNTRY_OPTIONS}
                />
            </div>
        </div>
    )
}
