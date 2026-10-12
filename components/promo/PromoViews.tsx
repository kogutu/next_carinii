'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Check, Copy } from 'lucide-react'
import { fillTemplate, type CardBadge, type ProductBox, type TopBarConfig } from '@/lib/promoConfig'
import { cn } from '@/lib/utils'

// Widoczne elementy promocji. Używane i na stronie, i w podglądzie w panelu /admin, więc wyglądają tak samo.

const pad = (n: number) => String(n).padStart(2, '0')

const copyText = async (value: string): Promise<boolean> => {
    try {
        await navigator.clipboard.writeText(value)
        return true
    } catch {
        return false
    }
}

// ───────────────────────── pasek na górze ─────────────────────────

type TopBarViewProps = {
    bar: TopBarConfig
    // w podglądzie w panelu licznik pokazujemy zawsze (także przed datą „licznik od”)
    forceCounter?: boolean
}

function Digit({ value, bg, color }: { value: string; bg: string; color: string }) {
    return (
        <span
            style={{ backgroundColor: bg, color }}
            className="inline-flex h-[22px] w-[18px] items-center justify-center rounded-sm text-[11px] font-bold leading-none tabular-nums sm:h-[26px] sm:w-[22px] sm:text-[13px]"
        >
            {value}
        </span>
    )
}

export function TopBarView({ bar, forceCounter = false }: TopBarViewProps) {
    const [now, setNow] = useState<number | null>(null)
    const [copied, setCopied] = useState(false)

    const endMs = bar.endsAt ? Date.parse(bar.endsAt) : null
    const counterFromMs = Date.parse(bar.counterFrom ?? bar.startsAt ?? '') || 0
    const counterExpected = bar.counterEnabled && endMs !== null

    useEffect(() => {
        if (!counterExpected) return
        setNow(Date.now())
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [counterExpected])

    const handleCopy = async () => {
        if (await copyText(bar.code)) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    // tekst z {code} w środku: kod jest przyciskiem kopiującym
    const [before, ...rest] = bar.text.split('{code}')
    const after = rest.join('{code}')
    const hasCode = bar.text.includes('{code}')

    const counterVisible = counterExpected && (forceCounter || (now !== null && now >= counterFromMs))
    const diff = counterExpected && endMs !== null ? Math.max(0, endMs - (now ?? Date.now())) : 0
    const days = Math.floor(diff / 86_400_000)
    const hours = Math.floor((diff % 86_400_000) / 3_600_000)
    const minutes = Math.floor((diff % 3_600_000) / 60_000)
    const seconds = Math.floor((diff % 60_000) / 1000)

    return (
        <div style={{ backgroundColor: bar.bg, color: bar.color }} className="px-4 py-2 text-center">
            <div className="text-[12px] uppercase tracking-widest sm:text-[14px]">
                {before}
                {hasCode && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        style={{ borderColor: 'currentColor' }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded border px-1.5 py-0.5 font-bold opacity-95 transition-opacity hover:opacity-100"
                        title="Kliknij, aby skopiować kod"
                        translate="no"
                    >
                        {bar.code}
                        {copied ? <Check className="size-3 sm:size-3.5" aria-hidden="true" /> : <Copy className="size-3 sm:size-3.5" aria-hidden="true" />}
                        {copied && <span className="text-[10px] font-normal normal-case tracking-normal sm:text-[11px]">skopiowano!</span>}
                    </button>
                )}
                {after}
            </div>

            {/* rezerwujemy miejsce na licznik, żeby pasek nie skakał po załadowaniu */}
            {counterExpected && (
                <div className="mt-1.5 flex min-h-[22px] items-center justify-center gap-[3px] sm:min-h-[26px] sm:gap-1">
                    {counterVisible && (
                        <>
                            {days > 0 && (
                                <>
                                    <Digit value={pad(days)[0]} bg={bar.counterBg} color={bar.counterColor} />
                                    <Digit value={pad(days)[1] ?? ''} bg={bar.counterBg} color={bar.counterColor} />
                                    <span className="mx-1 text-[10px] opacity-70 sm:text-[11px]">dni</span>
                                </>
                            )}
                            <Digit value={pad(hours)[0]} bg={bar.counterBg} color={bar.counterColor} />
                            <Digit value={pad(hours)[1]} bg={bar.counterBg} color={bar.counterColor} />
                            <span className="mx-[1px] font-bold opacity-60 sm:mx-[2px]">:</span>
                            <Digit value={pad(minutes)[0]} bg={bar.counterBg} color={bar.counterColor} />
                            <Digit value={pad(minutes)[1]} bg={bar.counterBg} color={bar.counterColor} />
                            <span className="mx-[1px] font-bold opacity-60 sm:mx-[2px]">:</span>
                            <Digit value={pad(seconds)[0]} bg={bar.counterBg} color={bar.counterColor} />
                            <Digit value={pad(seconds)[1]} bg={bar.counterBg} color={bar.counterColor} />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

// ───────────────────────── plakietka na liście produktów ─────────────────────────

type CardBadgeViewProps = {
    badge: CardBadge
    code: string
    percent: number
    className?: string
}

// „-30%” (pierwsza linia, pogrubiona) i „z kodem: KOD” — kliknięcie kopiuje kod
export function CardBadgeView({ badge, code, percent, className }: CardBadgeViewProps) {
    const [copied, setCopied] = useState(false)
    const lines = fillTemplate(badge.text, { code: '\u0000', percent }).split('\n')

    const handleCopy = async (event: React.MouseEvent) => {
        // plakietka leży na karcie-linku — kopiujemy kod, nie przechodzimy do produktu
        event.preventDefault()
        event.stopPropagation()
        if (await copyText(code)) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const renderLine = (line: string, index: number): ReactNode => {
        const parts = line.split('\u0000')
        return (
            <span key={index} className={cn('block', index === 0 ? 'text-xs font-bold' : 'text-xs')}>
                {parts.map((part, partIndex) => (
                    <span key={partIndex}>
                        {part}
                        {partIndex < parts.length - 1 && (
                            <strong translate="no">{code}</strong>
                        )}
                    </span>
                ))}
            </span>
        )
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            style={{ backgroundColor: badge.bg, color: badge.color }}
            className={cn('flex w-full cursor-pointer flex-col items-center justify-center rounded-md px-2 py-2 text-center transition-opacity hover:opacity-90', className)}
        >
            {copied ? <span className="text-xs font-medium">Skopiowano kod!</span> : lines.map(renderLine)}
        </button>
    )
}

// ───────────────────────── boks na karcie produktu ─────────────────────────

type ProductBoxViewProps = {
    box: ProductBox
    code: string
    percent: number
}

export function ProductBoxView({ box, code, percent }: ProductBoxViewProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        if (await copyText(code)) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div style={{ backgroundColor: box.bg, color: box.color }} className="inline-block rounded-lg px-4 py-3 text-[11px] leading-tight">
            {box.heading && (
                <span style={{ color: box.accent }} className="block text-[11px] font-medium uppercase tracking-wider">
                    {box.heading}
                </span>
            )}
            {box.lead && <span className="mt-1 block">{box.lead}</span>}
            <span className="mt-1 block text-2xl font-extrabold tracking-[2px]">-{percent}%</span>
            <span className="mt-1 flex flex-wrap items-baseline gap-x-1.5">
                {box.suffix && <span>{box.suffix}</span>}
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label={`Skopiuj kod ${code}`}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-lg font-extrabold tracking-[4px]"
                    translate="no"
                >
                    {code}
                    {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4 opacity-70" aria-hidden="true" />}
                </button>
            </span>
            {box.footer && (
                <span style={{ color: box.accent }} className="mt-1.5 block text-[11px] font-medium">
                    {box.footer}
                </span>
            )}
        </div>
    )
}
