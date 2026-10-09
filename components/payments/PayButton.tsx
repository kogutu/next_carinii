'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const payButtonStyles = cva(
    'flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold select-none transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100',
    {
        variants: {
            tone: {
                dark: 'bg-primary text-primary-foreground hover:bg-menuhover',
                light: 'surface-card bg-background text-foreground hover:bg-muted',
            },
            align: {
                between: 'justify-between',
                center: 'justify-center',
            },
        },
        defaultVariants: { tone: 'dark', align: 'between' },
    },
)

type PayButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> &
    VariantProps<typeof payButtonStyles> & {
        // etykieta po lewej (lub na środku przy align="center")
        children: ReactNode
        // znaki płatności po prawej stronie
        logos?: ReactNode
        isLoading?: boolean
        loadingLabel?: string
    }

// Jeden wygląd przycisków płatności w całym sklepie: pełna szerokość, 48 px wysokości, logotypy metody.
export default function PayButton({
    children,
    logos,
    tone,
    align,
    isLoading = false,
    loadingLabel = 'Przekierowuję…',
    className,
    disabled,
    type = 'button',
    ...props
}: PayButtonProps) {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            aria-busy={isLoading || undefined}
            className={cn(payButtonStyles({ tone, align }), className)}
            {...props}
        >
            {isLoading ? (
                <span className="mx-auto flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {loadingLabel}
                </span>
            ) : (
                <>
                    <span className="flex items-center gap-2">{children}</span>
                    {logos && <span className="flex items-center gap-1.5">{logos}</span>}
                </>
            )}
        </button>
    )
}
