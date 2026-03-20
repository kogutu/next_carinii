'use client'

import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { ValidationErrors, SectionStatus } from '@/hooks/useCheckoutValidation'

interface ValidationSummaryProps {
    errors: ValidationErrors
    status: SectionStatus
    billingTouched?: boolean
    shippingTouched?: boolean
    sameAddress?: boolean
}

export default function ValidationSummary({
    errors,
    status,
    billingTouched = false,
    shippingTouched = false,
    sameAddress = true
}: ValidationSummaryProps) {

    console.log(errors)
    const allErrors = [
        ...Object.entries(errors.billing).map(([field, message]) => ({
            field,
            message,
            section: 'Dane rozliczeniowe'
        })),
        ...((!sameAddress && shippingTouched) ? Object.entries(errors.shipping).map(([field, message]) => ({
            field,
            message,
            section: 'Adres dostawy'
        })) : []),
        ...(errors.shippingMethod ? [{ field: 'shippingMethod', message: errors.shippingMethod, section: 'Wysyłka' }] : []),
        ...(errors.paymentMethod ? [{ field: 'paymentMethod', message: errors.paymentMethod, section: 'Płatność' }] : []),
        ...(errors.terms ? [{ field: 'terms', message: errors.terms, section: 'Zgody' }] : [])
    ]

    console.log(allErrors)
    // Show placeholder when billing not touched
    if (!billingTouched && (!shippingTouched || sameAddress)) {
        console.log(allErrors)

        return (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
                <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-semibold text-blue-900">Uzupełnij dane rozliczeniowe</p>
                        <p className="text-sm text-blue-800">Zacznij wypełniać formularz aby zobaczyć szczegółowe wymagania</p>
                    </div>
                </div>
            </div>
        )
    }

    if (allErrors.length === 0) {
        return (
            <div className="bg-[#f8f4f1] border-2 border-[#441c49] rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[#441c49]" />
                    <div>
                        <p className="font-semibold text-[#441c49]">Wszystko wygląda dobrze!</p>
                        <p className="text-sm text-gray-700">Możesz teraz złożyć zamówienie</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white border-2 border-red-300 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-semibold text-red-600">Uzupełnij wymagane pola</p>
                    <p className="text-sm text-gray-700">
                        Znaleźliśmy {allErrors.length} {allErrors.length === 1 ? 'błąd' : 'błędy'}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                {allErrors.map((error, idx) => (
                    <div
                        key={idx}
                        className="flex items-start gap-3 bg-red-50 p-3 rounded border border-red-200"
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-gray-900">{error.section}</p>
                            <p className="text-gray-700">{error.message}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
