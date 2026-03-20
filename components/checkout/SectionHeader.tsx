'use client'

import { AlertCircle, CheckCircle } from 'lucide-react'

interface SectionHeaderProps {
    title: string
    description?: string
    hasErrors?: boolean
}

export default function SectionHeader({
    title,
    description,
    hasErrors = false
}: SectionHeaderProps) {
    return (
        <div className="mb-6 pb-4 border-b border-gray-200">

            <div className="flex items-center gap-3 mb-2">
                {(!hasErrors) && (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}
                {hasErrors && (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                )}
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {description && (
                <p className="text-sm text-gray-600 ml-8">{description}</p>
            )}
        </div>
    )
}
