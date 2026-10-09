'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

type SectionHeaderProps = {
    title: string
    // numer kroku pokazywany w kółku, dopóki sekcja nie jest kompletna
    step: number
    description?: string
    hasErrors?: boolean
    complete?: boolean
}

export default function SectionHeader({
    title,
    step,
    description,
    hasErrors = false,
    complete = false,
}: SectionHeaderProps) {
    return (
        <div className="mb-6 flex items-start gap-3">
            <span
                aria-hidden="true"
                className={cn(
                    'mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-200 motion-reduce:transition-none',
                    hasErrors && 'bg-destructive text-destructive-foreground',
                    !hasErrors && complete && 'bg-primary text-primary-foreground',
                    !hasErrors && !complete && 'bg-background text-foreground ring-2 ring-foreground',
                )}
            >
                {hasErrors ? '!' : complete ? <Check className="size-3.5" strokeWidth={3} /> : step}
            </span>
            <div className="min-w-0">
                <h2 className="text-balance text-xl font-semibold tracking-tight text-foreground">{title}</h2>
                {description && <p className="mt-1 text-pretty text-sm text-muted-foreground">{description}</p>}
            </div>
        </div>
    )
}
