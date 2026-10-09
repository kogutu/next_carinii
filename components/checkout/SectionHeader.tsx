'use client'

import { AlertCircle, CheckCircle, Circle } from 'lucide-react'

type SectionHeaderProps = {
    title: string
    description?: string
    hasErrors?: boolean
    complete?: boolean
}

export default function SectionHeader({
    title,
    description,
    hasErrors = false,
    complete = false,
}: SectionHeaderProps) {
    return (
        <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
                {hasErrors ? (
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                ) : complete ? (
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                ) : (
                    <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            </div>
            {description && (
                <p className="text-sm text-gray-600 ml-8">{description}</p>
            )}
        </div>
    )
}
