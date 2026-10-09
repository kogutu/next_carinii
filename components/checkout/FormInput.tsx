'use client'

import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const FIELD_BASE =
    'w-full rounded-xl border bg-background px-3 pt-7 pb-3 text-base text-foreground transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-foreground'
const LABEL_BASE = 'absolute left-3 top-2 text-sm text-muted-foreground pointer-events-none'

type FieldShellProps = {
    error?: string
    hint?: ReactNode
    className?: string
    children: ReactNode
}

const FieldShell = ({ error, hint, className, children }: FieldShellProps) => (
    <div className={cn('relative', className)}>
        {children}
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        {!error && hint && <div className="mt-1.5 text-pretty text-xs">{hint}</div>}
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
                className={cn(FIELD_BASE, 'peer', error ? 'border-destructive' : 'border-hborder/50')}
            />
            <label
                htmlFor={id}
                className={cn(
                    LABEL_BASE,
                    'transition-all duration-200 motion-reduce:transition-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-sm peer-focus:text-foreground',
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
    // tekst pokazywany w zamkniętym polu (np. samo „+48”); domyślnie etykieta wybranej opcji
    display?: string
    autoComplete?: string
    onBlur?: () => void
    error?: string
    className?: string
}

// Zamknięte pole wygląda i ma wysokość jak FormInput; klikalny jest przezroczysty, natywny <select>
// rozciągnięty na całe pole, więc lista (z pełnymi nazwami) działa tak samo jak zawsze, także na telefonie.
export function FormSelect({
    name,
    label,
    value,
    onChange,
    onBlur,
    options,
    display,
    autoComplete,
    error,
    className,
}: FormSelectProps) {
    const id = `checkout-${name}`
    const shown = display ?? options.find((option) => option.value === value)?.label ?? ''

    return (
        <FieldShell error={error} className={className}>
            <div
                className={cn(
                    'relative flex w-full items-end justify-between gap-2 rounded-xl border bg-background px-3 pt-7 pb-3 text-base text-foreground transition-shadow focus-within:border-transparent focus-within:ring-2 focus-within:ring-foreground',
                    error ? 'border-destructive' : 'border-hborder/50',
                )}
            >
                <span className="block min-w-0 truncate leading-6">{shown}</span>
                <ChevronDown className="mb-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <select
                    id={id}
                    name={name}
                    value={value}
                    autoComplete={autoComplete}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    aria-invalid={!!error}
                    className="absolute inset-0 size-full cursor-pointer opacity-0"
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            <label htmlFor={id} className={LABEL_BASE}>
                {label} *
            </label>
        </FieldShell>
    )
}
