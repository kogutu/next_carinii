'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'

interface ValidationProgressProps {
    completed: number
    total: number
    percentage: number
}

export default function ValidationProgress({
    completed,
    total,
    percentage
}: ValidationProgressProps) {
    return (
        <div className="bg-white border border-hborder rounded-lg p-6 mb-8 sticky top-4 z-10">


            {/* Warunek wyświetlania komunikatu */}
            {percentage === 100 ? (
                <div className="flex items-center gap-2 text-green-600 mt-3">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-xs">
                        Poprawnie uzupełniono formularz - możesz przystąpić do złożenia zamówienia
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[#441c49]">Postęp uzupełniania</h3>
                        <span className="text-sm font-medium text-gray-600">
                            {completed}/{total}
                        </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className="bg-[#441c49] h-full rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${percentage}%` }}
                        />
                    </div></>
            )}
        </div>
    )
}