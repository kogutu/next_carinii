'use client'

import { useEffect } from 'react'
import { Check, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react'
import { useCheckoutValidationStore } from './checkoutValidationStore'

export default function FloatingValidationPanel() {
    const {
        errors,
        status,
        billingTouched,
        shippingTouched,
        sameAddress,
        isExpanded,
        expandedSection,
        setIsExpanded,
        setExpandedSection
    } = useCheckoutValidationStore()

    // Auto-collapse po 5 sekundach braku interakcji
    useEffect(() => {
        if (isExpanded) {
            const timer = setTimeout(() => {
                setIsExpanded(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [isExpanded, setIsExpanded])

    // Zdefiniuj wszystkie sekcje
    const sections = [
        {
            id: 'billing',
            label: 'Dane rozliczeniowe',
            status: status.billing,
            errors: Object.entries(errors.billing || {}).filter(([_, message]) => message).map(([field, message]) => ({
                field,
                message
            })),
            show: billingTouched
        },
        {
            id: 'shipping',
            label: 'Adres dostawy',
            status: status.shipping,
            errors: Object.entries(errors.shipping || {}).filter(([_, message]) => message).map(([field, message]) => ({
                field,
                message
            })),
            show: !sameAddress && shippingTouched
        },
        {
            id: 'shippingMethod',
            label: 'Sposób wysyłki',
            status: status.shippingMethod,
            errors: errors.shippingMethod ? [{ field: 'shippingMethod', message: errors.shippingMethod }] : [],
            show: true
        },
        {
            id: 'paymentMethod',
            label: 'Metoda płatności',
            status: status.paymentMethod,
            errors: errors.paymentMethod ? [{ field: 'paymentMethod', message: errors.paymentMethod }] : [],
            show: true
        },
        {
            id: 'terms',
            label: 'Zgody i warunki',
            status: status.terms,
            errors: errors.terms ? [{ field: 'terms', message: errors.terms }] : [],
            show: true
        }
    ].filter(s => s.show)

    // Liczenie błędów i ukończonych sekcji
    const totalErrors = sections.reduce((sum, s) => sum + s.errors.length, 0)
    const completedSections = sections.filter(s => s.status === 'complete').length
    const allComplete = totalErrors === 0 && completedSections === sections.length

    // Nie pokazuj panelu zanim nie będą edytowane dane
    if (!billingTouched) {
        return null
    }

    if (!sections.filter(e => e.status == 'incomplete').length) return "";

    return (

        <div className="fixed md:relative left-0 bottom-0 md:bottom-auto z-40 w-full w-full mb-1">
            <div className={`bg-white rounded-lg shadow-lg border transition-all duration-300 overflow-hidden ${allComplete ? 'border-green-300 shadow-green-100' : totalErrors > 0 ? 'border-red-300 shadow-red-100' : 'border-gray-200'
                }`}>
                {/* Header / Compact View */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-full px-4 py-3.5  items-center justify-between hover:bg-gray-50/50 transition-colors` + (totalErrors > 0 ? ' flex' : ' hidden')}
                >
                    <div className="flex items-center gap-3 text-left min-w-0">
                        {allComplete ? (
                            <>
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-green-700 text-sm">Wszystko gotowe!</p>
                                    <p className="text-xs text-gray-500">{completedSections}/{sections.length} sekcji</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <div className="min-w-0">
                                    <p className="font-semibold text-red-700 text-sm">Uzupełnij pola</p>
                                    <p className="text-xs text-gray-500">{totalErrors} błąd{totalErrors !== 1 ? 'ów' : ''}</p>
                                </div>
                            </>
                        )}
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0 ml-2" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0 ml-2" />
                    )}
                </button>
                {/* Compact List - zawsze widoczna */}

                <div className="px-4 py-2 border-t border-gray-100 space-y-1.5">
                    {sections.filter(e => e.status == 'incomplete').map(section => (
                        <div
                            key={section.id}
                            className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded text-xs transition-colors font-medium ${section.status === 'complete'
                                ? 'bg-green-50 text-green-700'
                                : section.errors.length > 0
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-gray-50 text-gray-600'
                                }`}
                        >
                            <span className="truncate">{section.label}</span>
                            {section.status === 'complete' ? (
                                <Check className="w-4 h-4 flex-shrink-0" />
                            ) : section.errors.length > 0 ? (
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            ) : (
                                <div className="w-3 h-3 rounded-full border border-gray-300 flex-shrink-0" />
                            )}
                        </div>
                    ))}



                </div>

                {/* Expanded Details */}
                {isExpanded && totalErrors > 0 && (
                    <div className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white max-h-96 overflow-y-auto">
                        {sections
                            .filter(s => s.errors.length > 0)
                            .map((section, sectionIdx) => (
                                <div key={section.id} className={`${sectionIdx > 0 ? 'border-t border-gray-100' : ''}`}>
                                    <button
                                        onClick={() =>
                                            setExpandedSection(expandedSection === section.id ? null : section.id)
                                        }
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-100/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2.5 text-left">
                                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            <p className="font-semibold text-gray-900 text-sm">{section.label}</p>
                                        </div>
                                        {expandedSection === section.id ? (
                                            <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                        ) : (
                                            <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                        )}
                                    </button>

                                    {expandedSection === section.id && (
                                        <div className="px-4 pb-3 space-y-2 bg-white/50">
                                            {section.errors.map((error, idx) => (
                                                <div
                                                    key={idx}
                                                    className="bg-white rounded p-3 border border-red-200 text-xs shadow-sm"
                                                >
                                                    <p className="font-medium text-gray-900">{error.message}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
