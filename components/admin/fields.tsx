'use client'

import { useId, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Proste pola formularza panelu /admin (bez dodatkowych bibliotek).

export const INPUT =
    'h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50'

type FieldProps = {
    label: string
    hint?: string
    children: (id: string) => ReactNode
    className?: string
}

export function Field({ label, hint, children, className }: FieldProps) {
    const id = useId()
    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
                {label}
            </label>
            {children(id)}
            {hint && <p className="mt-1 text-pretty text-xs text-muted-foreground">{hint}</p>}
        </div>
    )
}

type TextFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
    hint?: string
    maxLength?: number
    placeholder?: string
    className?: string
}

export function TextField({ label, value, onChange, hint, maxLength, placeholder, className }: TextFieldProps) {
    return (
        <Field label={label} hint={hint} className={className}>
            {(id) => <input id={id} type="text" value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={INPUT} />}
        </Field>
    )
}

export function TextAreaField({ label, value, onChange, hint, maxLength, rows = 3, className }: TextFieldProps & { rows?: number }) {
    return (
        <Field label={label} hint={hint} className={className}>
            {(id) => (
                <textarea
                    id={id}
                    value={value}
                    rows={rows}
                    maxLength={maxLength}
                    onChange={(event) => onChange(event.target.value)}
                    className={cn(INPUT, 'h-auto py-2')}
                />
            )}
        </Field>
    )
}

type NumberFieldProps = {
    label: string
    value: number
    onChange: (value: number) => void
    min: number
    max: number
    hint?: string
    className?: string
}

export function NumberField({ label, value, onChange, min, max, hint, className }: NumberFieldProps) {
    return (
        <Field label={label} hint={hint} className={className}>
            {(id) => (
                <input
                    id={id}
                    type="number"
                    inputMode="numeric"
                    min={min}
                    max={max}
                    value={Number.isFinite(value) ? value : ''}
                    onChange={(event) => onChange(Number(event.target.value))}
                    className={INPUT}
                />
            )}
        </Field>
    )
}

type ColorFieldProps = {
    label: string
    value: string
    onChange: (value: string) => void
}

const HEX = /^#[0-9a-fA-F]{6}$/

// Wybór koloru: próbnik + pole z kodem (np. #1c1917)
export function ColorField({ label, value, onChange }: ColorFieldProps) {
    return (
        <Field label={label}>
            {(id) => (
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        aria-label={`${label} (próbnik)`}
                        value={HEX.test(value) ? value : '#000000'}
                        onChange={(event) => onChange(event.target.value)}
                        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-border bg-background p-1"
                    />
                    <input id={id} type="text" value={value} maxLength={7} onChange={(event) => onChange(event.target.value)} className={cn(INPUT, 'font-mono')} />
                </div>
            )}
        </Field>
    )
}

// ISO (UTC) <-> wartość pola datetime-local w strefie czasowej osoby korzystającej z panelu
export const isoToLocalInput = (iso: string | null): string => {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    const offsetMs = date.getTimezoneOffset() * 60_000
    return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export const localInputToIso = (value: string): string | null => {
    if (!value) return null
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

type DateTimeFieldProps = {
    label: string
    value: string | null
    onChange: (value: string | null) => void
    hint?: string
    className?: string
}

export function DateTimeField({ label, value, onChange, hint, className }: DateTimeFieldProps) {
    return (
        <Field label={label} hint={hint} className={className}>
            {(id) => (
                <div className="flex items-center gap-2">
                    <input id={id} type="datetime-local" value={isoToLocalInput(value)} onChange={(event) => onChange(localInputToIso(event.target.value))} className={INPUT} />
                    {value && (
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="shrink-0 rounded-lg px-2 py-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                        >
                            wyczyść
                        </button>
                    )}
                </div>
            )}
        </Field>
    )
}

type ToggleFieldProps = {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
    hint?: string
}

export function ToggleField({ label, checked, onChange, hint }: ToggleFieldProps) {
    return (
        <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-0.5 size-5 shrink-0 accent-black" />
            <span>
                <span className="block text-sm font-medium text-foreground">{label}</span>
                {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
            </span>
        </label>
    )
}

type SectionProps = {
    title: string
    description?: string
    children: ReactNode
    actions?: ReactNode
    className?: string
}

export function Section({ title, description, children, actions, className }: SectionProps) {
    return (
        <section className={cn('rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
            <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
                    {description && <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">{description}</p>}
                </div>
                {actions}
            </header>
            {children}
        </section>
    )
}

export const BUTTON_PRIMARY =
    'inline-flex h-10 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-menuhover active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:active:scale-100'

export const BUTTON_OUTLINE =
    'inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-muted active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:active:scale-100'
