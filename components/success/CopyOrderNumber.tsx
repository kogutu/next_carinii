'use client'

import { useEffect, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

const ICON_BASE = 'absolute size-4 transition-[opacity,transform,filter] duration-200 ease-out motion-reduce:transition-none'
const ICON_HIDDEN = 'scale-25 opacity-0 blur-xs'
const ICON_SHOWN = 'scale-100 opacity-100 blur-0'

// Kopiuje numer zamówienia; ikona płynnie zmienia się z „kopiuj” na „gotowe”.
export function CopyOrderNumber({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // schowek zablokowany (np. http) — numer i tak jest widoczny na stronie
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="surface-card inline-flex h-11 items-center gap-2 rounded-full bg-background px-4 text-sm font-medium text-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-muted active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
    >
      <span className="relative size-4" aria-hidden="true">
        <Copy className={cn(ICON_BASE, copied ? ICON_HIDDEN : ICON_SHOWN)} />
        <Check className={cn(ICON_BASE, copied ? ICON_SHOWN : ICON_HIDDEN)} />
      </span>
      <span aria-live="polite">{copied ? 'Skopiowano' : 'Kopiuj numer'}</span>
    </button>
  )
}
