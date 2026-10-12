'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Copy, Trash2 } from 'lucide-react'
import type { Campaign, PriceMode } from '@/lib/promoConfig'
import { CardBadgeView, ProductBoxView } from '@/components/promo/PromoViews'
import { cn } from '@/lib/utils'
import CategoryPicker, { type PickerCategory } from './CategoryPicker'
import { BUTTON_OUTLINE, ColorField, DateTimeField, Field, NumberField, TextAreaField, TextField, ToggleField } from './fields'

type CampaignEditorProps = {
    campaign: Campaign
    categories: PickerCategory[]
    index: number
    total: number
    onChange: (campaign: Campaign) => void
    onMove: (direction: -1 | 1) => void
    onDuplicate: () => void
    onDelete: () => void
}

const PRICE_MODES: { value: PriceMode; label: string; hint: string }[] = [
    { value: 'all', label: 'Wszystkie produkty', hint: 'z przeceną i bez' },
    { value: 'sale', label: 'Tylko przecenione', hint: 'mają cenę promocyjną' },
    { value: 'regular', label: 'Tylko nieprzecenione', hint: 'w regularnej cenie' },
]

const dateLabel = (iso: string | null): string => (iso ? new Date(iso).toLocaleString('pl-PL', { dateStyle: 'short', timeStyle: 'short' }) : '…')

// Jedna kampania: kogo obejmuje (ceny + kategorie), kod i rabat oraz wygląd plakietki na liście i boksu na karcie produktu
export default function CampaignEditor({ campaign, categories, index, total, onChange, onMove, onDuplicate, onDelete }: CampaignEditorProps) {
    const [open, setOpen] = useState(false)

    const update = (patch: Partial<Campaign>) => onChange({ ...campaign, ...patch })
    const updateCard = (patch: Partial<Campaign['card']>) => update({ card: { ...campaign.card, ...patch } })
    const updateBox = (patch: Partial<Campaign['productBox']>) => update({ productBox: { ...campaign.productBox, ...patch } })

    const scope = [
        PRICE_MODES.find((mode) => mode.value === campaign.target.priceMode)?.label,
        campaign.target.categories.length === 0 ? 'wszystkie kategorie' : `${campaign.target.categories.length} kat.`,
    ].join(' · ')

    return (
        <div className="rounded-xl border border-border bg-background">
            <div className="flex flex-wrap items-center gap-3 p-4">
                <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={open}>
                    <span
                        className={cn('inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium', campaign.enabled ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground')}
                    >
                        {campaign.enabled ? 'włączona' : 'wyłączona'}
                    </span>
                    <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                            {campaign.name} <span className="font-mono text-muted-foreground">({campaign.code}, -{campaign.percent}%)</span>
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                            {scope} · {dateLabel(campaign.startsAt)} → {dateLabel(campaign.endsAt)}
                        </span>
                    </span>
                    {open ? <ChevronUp className="ml-auto size-4 shrink-0" aria-hidden="true" /> : <ChevronDown className="ml-auto size-4 shrink-0" aria-hidden="true" />}
                </button>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Przesuń wyżej" className={cn(BUTTON_OUTLINE, 'h-9 px-2.5')}>
                        <ChevronUp className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Przesuń niżej" className={cn(BUTTON_OUTLINE, 'h-9 px-2.5')}>
                        <ChevronDown className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={onDuplicate} aria-label="Duplikuj kampanię" className={cn(BUTTON_OUTLINE, 'h-9 px-2.5')}>
                        <Copy className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={onDelete} aria-label="Usuń kampanię" className={cn(BUTTON_OUTLINE, 'h-9 px-2.5 text-destructive')}>
                        <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>

            {open && (
                <div className="space-y-8 border-t border-border p-4 sm:p-5">
                    {/* podstawy */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <TextField label="Nazwa kampanii (tylko w panelu)" value={campaign.name} onChange={(name) => update({ name })} maxLength={80} className="sm:col-span-2" />
                        <TextField label="Kod rabatowy" value={campaign.code} onChange={(code) => update({ code: code.toUpperCase() })} maxLength={30} hint="Litery, cyfry, - i _. Kod musi istnieć w Magento — sklep go tam sprawdza." />
                        <NumberField label="Rabat (%) pokazywany na plakietkach" value={campaign.percent} onChange={(percent) => update({ percent })} min={1} max={99} />
                        <DateTimeField label="Od kiedy" value={campaign.startsAt} onChange={(startsAt) => update({ startsAt })} hint="Puste = od razu." />
                        <DateTimeField label="Do kiedy" value={campaign.endsAt} onChange={(endsAt) => update({ endsAt })} hint="Puste = bez końca." />
                        <div className="sm:col-span-2">
                            <ToggleField label="Kampania włączona" checked={campaign.enabled} onChange={(enabled) => update({ enabled })} hint="Wyłączona nie pokazuje się nigdzie, nawet w podanych datach." />
                        </div>
                    </div>

                    {/* kogo obejmuje */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Które produkty</h3>
                        <fieldset>
                            <legend className="mb-2 text-sm font-medium text-foreground">Ceny</legend>
                            <div className="flex flex-wrap gap-2">
                                {PRICE_MODES.map((mode) => (
                                    <label
                                        key={mode.value}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                                            campaign.target.priceMode === mode.value ? 'border-foreground bg-muted' : 'border-border hover:bg-muted/60',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name={`price-mode-${campaign.id}`}
                                            checked={campaign.target.priceMode === mode.value}
                                            onChange={() => update({ target: { ...campaign.target, priceMode: mode.value } })}
                                            className="accent-black"
                                        />
                                        <span>
                                            {mode.label} <span className="text-xs text-muted-foreground">({mode.hint})</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <Field label="Kategorie" hint="Ustawienie dotyczy i plakietek na liście produktów, i boksu na karcie produktu.">
                            {() => <CategoryPicker categories={categories} value={campaign.target.categories} onChange={(selected) => update({ target: { ...campaign.target, categories: selected } })} />}
                        </Field>
                    </div>

                    {/* plakietka na liście */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Plakietka na liście produktów</h3>
                            <ToggleField label="Pokazuj" checked={campaign.card.enabled} onChange={(enabled) => updateCard({ enabled })} />
                        </div>
                        <div className="grid items-start gap-4 sm:grid-cols-[1fr_16rem]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextAreaField
                                    label="Tekst"
                                    value={campaign.card.text}
                                    onChange={(text) => updateCard({ text })}
                                    maxLength={160}
                                    rows={2}
                                    hint="Wstawki: {percent} (rabat) i {code} (kod). Pierwsza linia jest pogrubiona."
                                    className="sm:col-span-2"
                                />
                                <ColorField label="Tło" value={campaign.card.bg} onChange={(bg) => updateCard({ bg })} />
                                <ColorField label="Tekst (kolor)" value={campaign.card.color} onChange={(color) => updateCard({ color })} />
                            </div>
                            <div>
                                <p className="mb-1.5 text-sm font-medium text-foreground">Podgląd</p>
                                <div className="w-full max-w-64 rounded-lg border border-dashed border-border p-3">
                                    <CardBadgeView badge={campaign.card} code={campaign.code} percent={campaign.percent} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* boks na karcie produktu */}
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Boks na karcie produktu</h3>
                            <ToggleField label="Pokazuj" checked={campaign.productBox.enabled} onChange={(enabled) => updateBox({ enabled })} />
                        </div>
                        <div className="grid items-start gap-4 sm:grid-cols-[1fr_16rem]">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <TextField label="Nagłówek" value={campaign.productBox.heading} onChange={(heading) => updateBox({ heading })} maxLength={80} />
                                <TextField label="Linia wstępna" value={campaign.productBox.lead} onChange={(lead) => updateBox({ lead })} maxLength={80} />
                                <TextField label="Tekst przed kodem" value={campaign.productBox.suffix} onChange={(suffix) => updateBox({ suffix })} maxLength={80} hint="Np. „taniej z kodem:”. Rabat i kod są dodawane automatycznie." />
                                <TextField label="Stopka" value={campaign.productBox.footer} onChange={(footer) => updateBox({ footer })} maxLength={120} />
                                <ColorField label="Tło" value={campaign.productBox.bg} onChange={(bg) => updateBox({ bg })} />
                                <ColorField label="Tekst (kolor)" value={campaign.productBox.color} onChange={(color) => updateBox({ color })} />
                                <ColorField label="Kolor akcentu (nagłówek i stopka)" value={campaign.productBox.accent} onChange={(accent) => updateBox({ accent })} />
                            </div>
                            <div>
                                <p className="mb-1.5 text-sm font-medium text-foreground">Podgląd</p>
                                <div className="rounded-lg border border-dashed border-border p-3">
                                    <ProductBoxView box={campaign.productBox} code={campaign.code} percent={campaign.percent} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
