'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

interface FormInputProps {
    label: string
    name: string
    type?: string
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
    error?: string
    required?: boolean
    disabled?: boolean
    options?: { value: string; label: string }[]
    as?: 'input' | 'select'
}

export default function FormInput({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    required = false,
    disabled = false,
    options = [],
    as = 'input'
}: FormInputProps) {
    const isInvalid = !!error

    return (
        <div className="mb-4">
            <Label htmlFor={name} className="text-gray-700 font-medium mb-2 block">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {as === 'select' ? (
                <select
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#441c49] transition-colors ${isInvalid ? 'border-red-500' : 'border-gray-200'
                        } ${disabled ? 'bg-gray-100' : 'bg-white'}`}
                >
                    <option value="">Wybierz...</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            ) : (
                <Input
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    className={`${isInvalid ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-[#441c49]'}`}
                />
            )}
            {error && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    )
}
