'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const FIELD_BASE =
    'w-full px-3 pt-7 pb-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent'
const LABEL_BASE = 'absolute left-3 top-2 text-sm text-gray-400 pointer-events-none'

type FieldShellProps = {
    error?: string
    hint?: ReactNode
    className?: string
    children: ReactNode
}

const FieldShell = ({ error, hint, className, children }: FieldShellProps) => (
    <div className={cn('relative', className)}>
        {children}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {!error && hint && <div className="text-xs mt-1">{hint}</div>}
    </div>
)

type FormInputProps = {
    name: string
    label: string
    value: string
    onChange: (value: string) => void
    onBlur?: () => void
    error?: string
    hint?: ReactNode
    type?: 'text' | 'email' | 'tel'
    inputMode?: 'text' | 'numeric' | 'tel' | 'email'
    autoComplete?: string
    required?: boolean
    className?: string
}

export default function FormInput({
    name,
    label,
    value,
    onChange,
    onBlur,
    error,
    hint,
    type = 'text',
    inputMode,
    autoComplete,
    required = true,
    className,
}: FormInputProps) {
    const id = `checkout-${name}`

    return (
        <FieldShell error={error} hint={hint} className={className}>
            <input
                id={id}
                name={name}
                type={type}
                inputMode={inputMode}
                autoComplete={autoComplete}
                placeholder=" "
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                aria-invalid={!!error}
                className={cn(FIELD_BASE, 'peer', error ? 'border-red-400' : 'border-gray-300')}
            />
            <label
                htmlFor={id}
                className={cn(
                    LABEL_BASE,
                    'transition-all duration-200 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-[#441c49]',
                )}
            >
                {label}
                {required && ' *'}
            </label>
        </FieldShell>
    )
}

type FormSelectProps = {
    name: string
    label: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    autoComplete?: string
    onBlur?: () => void
    error?: string
    className?: string
}

export function FormSelect({
    name,
    label,
    value,
    onChange,
    onBlur,
    options,
    autoComplete,
    error,
    className,
}: FormSelectProps) {
    const id = `checkout-${name}`

    return (
        <FieldShell error={error} className={className}>
            <select
                id={id}
                name={name}
                value={value}
                autoComplete={autoComplete}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className={cn(FIELD_BASE, 'pt-6 pb-2 text-sm bg-white', error ? 'border-red-400' : 'border-gray-300')}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <label htmlFor={id} className={LABEL_BASE}>
                {label} *
            </label>
        </FieldShell>
    )
}
