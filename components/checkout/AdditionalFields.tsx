'use client'

import { useState, useEffect } from 'react'
import SectionHeader from './SectionHeader'
import { useCartStore } from '@/stores/cartZustand'
import { formatPostcode } from '@/hooks/useMaskedInput'

interface AdditionalFieldsData {
    certificateNumber: string
    certificateDate: string
    certificateAuthority: string
    pesel: string
}

interface AdditionalFieldsProps {
    onValidationChange?: (data: AdditionalFieldsData, isValid: boolean) => void
    onTouched?: () => void
    isTouched?: boolean
}

const formatPesel = (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 11)
}

const validatePesel = (pesel: string): boolean => {
    const clean = pesel.replace(/\D/g, '')
    if (clean.length !== 11) return false

    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3]
    let sum = 0
    for (let i = 0; i < 10; i++) {
        sum += parseInt(clean[i]) * weights[i]
    }
    const control = (10 - (sum % 10)) % 10
    return control === parseInt(clean[10])
}

export default function AdditionalFields({ onValidationChange, onTouched, isTouched = false }: AdditionalFieldsProps) {
    const { fieldsAdditional } = useCartStore()

    const [agroExpanded, setAgroExpanded] = useState(false)
    const [groszekExpanded, setGroszekExpanded] = useState(false)


    const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

    const showAgro = fieldsAdditional.includes('agro')
    const showGroszek = fieldsAdditional.includes('groszek')

    var fields: any = {
    };
    if (showAgro) {
        fields.certificateNumber = "";
        fields.certificateDate = "";
        fields.certificateAuthority = "";
    }
    if (showGroszek) {
        fields.pesel = "";
    }
    console.clear();
    console.log(fields);

    const [form, setForm] = useState<AdditionalFieldsData>(fields)

    // Validation
    useEffect(() => {
        const errors: Record<string, string> = {}

        if (showAgro) {
            if (!form.certificateNumber || !form.certificateNumber.trim()) {
                errors.certificateNumber = 'Numer zaświadczenia jest wymagany'
            }
            if (!form.certificateDate) {
                errors.certificateDate = 'Data wydania jest wymagana'
            }
            if (!form.certificateAuthority || !form.certificateAuthority.trim()) {
                errors.certificateAuthority = 'Organ wydający jest wymagany'
            }
        }

        if (showGroszek) {
            if (!form.pesel.trim()) {
                errors.pesel = 'PESEL jest wymagany'
            } else if (!validatePesel(form.pesel)) {
                errors.pesel = 'Nieprawidłowy numer PESEL'
            }
        }

        if (isTouched) {
            setLocalErrors(errors)
        }

        if (onValidationChange) {
            onValidationChange(form, isTouched ? Object.keys(errors).length === 0 : false)
        }
    }, [form, isTouched, showAgro, showGroszek, onValidationChange])

    if (!showAgro && !showGroszek) return null

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Dodatkowe informacje"
                hasErrors={Object.keys(localErrors).length > 0}
            />

            {/* ── AGRO: Środki ochrony roślin ── */}
            {showAgro && (
                <div className="space-y-4">
                    <div className="bg-[#f8f4f1] p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#441c49] text-white text-xs flex items-center justify-center font-bold">
                                i
                            </span>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium text-gray-900 mb-1">
                                    Zaświadczenie o szkoleniu — środki ochrony roślin
                                </p>
                                {agroExpanded ? (
                                    <>
                                        <p className="mb-2">
                                            Zgodnie z Ustawą o ochronie roślin (art.&nbsp;37 i&nbsp;nast.) oraz rozporządzeniami
                                            Ministerstwa Rolnictwa i&nbsp;Rozwoju Wsi, sprzedaż środków ochrony roślin
                                            (herbicydów, insektycydów, fungicydów itp.) jest dozwolona wyłącznie osobom
                                            posiadającym odpowiednie uprawnienia.
                                        </p>
                                        <p className="mb-2">Dlatego przy każdej sprzedaży jesteśmy zobowiązani pobrać od Klienta:</p>
                                        <ul className="list-disc list-inside mb-2 space-y-1">
                                            <li>Numer zaświadczenia o ukończeniu szkolenia w zakresie stosowania środków ochrony roślin,</li>
                                            <li>Datę wydania zaświadczenia,</li>
                                            <li>Organ wydający zaświadczenie (np.&nbsp;odpowiedni Ośrodek Doradztwa Rolniczego).</li>
                                        </ul>
                                        <p className="mb-1">
                                            Dane te są rejestrowane i mogą być kontrolowane przez Inspekcję Ochrony Roślin
                                            i&nbsp;Nasiennictwa.
                                        </p>
                                        <p>
                                            Sprzedaż bez ważnego zaświadczenia jest nielegalna i grozi wysokimi karami zarówno
                                            dla sprzedawcy, jak i kupującego.
                                        </p>
                                    </>
                                ) : (
                                    <p>
                                        Sprzedaż środków ochrony roślin wymaga podania danych zaświadczenia o szkoleniu.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setAgroExpanded(!agroExpanded)}
                                    className="text-[#441c49] font-medium text-xs mt-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
                                >
                                    {agroExpanded ? 'Zwiń' : 'Dlaczego? Czytaj więcej'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Numer zaświadczenia */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder=" "
                            value={form.certificateNumber}
                            onChange={(e) => {
                                onTouched?.()
                                setForm({ ...form, certificateNumber: e.target.value })
                            }}
                            className="w-full px-3 pt-7 py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                        />
                        <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                            Numer zaświadczenia o ukończeniu szkolenia *
                        </label>
                        {localErrors.certificateNumber && (
                            <p className="text-xs text-red-500 mt-1">{localErrors.certificateNumber}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Data wydania */}
                        <div className="relative">
                            <input
                                type="date"
                                value={form.certificateDate}
                                onChange={(e) => {
                                    onTouched?.()
                                    setForm({ ...form, certificateDate: e.target.value })
                                }}
                                className="w-full px-3 pt-7 py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                            />
                            <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none">
                                Data wydania *
                            </label>
                            {localErrors.certificateDate && (
                                <p className="text-xs text-red-500 mt-1">{localErrors.certificateDate}</p>
                            )}
                        </div>

                        {/* Organ wydający */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder=" "
                                value={form.certificateAuthority}
                                onChange={(e) => {
                                    onTouched?.()
                                    setForm({ ...form, certificateAuthority: e.target.value })
                                }}
                                className="w-full px-3 pt-7 py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                            />
                            <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                                Organ wydający *
                            </label>
                            {localErrors.certificateAuthority && (
                                <p className="text-xs text-red-500 mt-1">{localErrors.certificateAuthority}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── GROSZEK: PESEL ── */}
            {showGroszek && (
                <div className="space-y-4">
                    <div className="bg-[#f8f4f1] p-4 rounded-lg">
                        <div className="flex items-start gap-2">
                            <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-[#441c49] text-white text-xs flex items-center justify-center font-bold">
                                i
                            </span>
                            <div className="text-sm text-gray-700">
                                <p className="font-medium text-gray-900 mb-1">
                                    Numer PESEL — ekogroszek i paliwa stałe
                                </p>
                                {groszekExpanded ? (
                                    <>
                                        <p className="mb-2">
                                            Zgodnie z obowiązującymi przepisami prawa (m.in. ustawa o podatku akcyzowym
                                            oraz rozporządzenia Ministra Klimatu i&nbsp;Środowiska) przy sprzedaży ekogroszku
                                            i&nbsp;innych paliw stałych przeznaczonych do ogrzewania domów jesteśmy zobowiązani
                                            do pobrania numeru PESEL od kupującego.
                                        </p>
                                        <p className="mb-2">Dane te są niezbędne do:</p>
                                        <ul className="list-disc list-inside mb-2 space-y-1">
                                            <li>prawidłowego rozliczenia i raportowania sprzedaży do odpowiednich urzędów,</li>
                                            <li>przeciwdziałania szarej strefie i nielegalnemu obrotowi paliwami,</li>
                                            <li>spełnienia wymogów kontroli jakości paliw i ochrony powietrza.</li>
                                        </ul>
                                        <p>
                                            Podanie PESEL jest obowiązkowe przy zakupie ekogroszku. Bez tych danych
                                            nie możemy zrealizować sprzedaży.
                                        </p>
                                    </>
                                ) : (
                                    <p>
                                        Przy zakupie ekogroszku wymagane jest podanie numeru PESEL.
                                    </p>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setGroszekExpanded(!groszekExpanded)}
                                    className="text-[#441c49] font-medium text-xs mt-2 underline underline-offset-2 hover:opacity-80 transition-opacity"
                                >
                                    {groszekExpanded ? 'Zwiń' : 'Dlaczego? Czytaj więcej'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PESEL */}
                    <div className="relative">
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder=" "
                            value={form.pesel}
                            onChange={(e) => {
                                onTouched?.()
                                setForm({ ...form, pesel: formatPesel(e.target.value) })
                            }}
                            className="w-full px-3 pt-7 py-3 border border-gray-300 rounded-md peer focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                        />
                        <label className="absolute left-3 top-2 text-sm text-gray-400 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]">
                            PESEL *
                        </label>
                        {localErrors.pesel && (
                            <p className="text-xs text-red-500 mt-1">{localErrors.pesel}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">11 cyfr</p>
                    </div>
                </div>
            )}
        </div>
    )
}