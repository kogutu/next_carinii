'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import { MAX_CAMPAIGNS, newCampaign, type Campaign, type PromoConfig, type TopBarConfig } from '@/lib/promoConfig'
import { TopBarView } from '@/components/promo/PromoViews'
import { cn } from '@/lib/utils'
import CampaignEditor from './CampaignEditor'
import type { PickerCategory } from './CategoryPicker'
import { BUTTON_OUTLINE, BUTTON_PRIMARY, ColorField, DateTimeField, NumberField, Section, TextAreaField, TextField, ToggleField } from './fields'

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' }

const localId = (): string => Math.random().toString(36).slice(2, 14)

// Zakładka Promo: pasek na górze strony + kampanie (plakietki na liście produktów i boks na karcie produktu)
export default function PromoTab({ onUnauthorized }: { onUnauthorized: () => void }) {
    const [load, setLoad] = useState<LoadState>({ status: 'loading' })
    const [config, setConfig] = useState<PromoConfig | null>(null)
    const [saved, setSaved] = useState<string>('')
    const [categories, setCategories] = useState<PickerCategory[]>([])
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

    const serialized = useMemo(() => JSON.stringify(config), [config])
    const dirty = config !== null && serialized !== saved

    useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const response = await fetch('/api/admin/promo', { cache: 'no-store' })
                if (response.status === 401) return onUnauthorized()
                const json = await response.json()
                if (cancelled) return
                if (!response.ok || !json.success) {
                    setLoad({ status: 'error', message: json.message ?? 'Nie udało się wczytać ustawień.' })
                    return
                }
                setConfig(json.config)
                setSaved(JSON.stringify(json.config))
                setCategories(json.categories ?? [])
                setLoad({ status: 'ready' })
            } catch {
                if (!cancelled) setLoad({ status: 'error', message: 'Brak połączenia z serwerem.' })
            }
        })()
        return () => {
            cancelled = true
        }
    }, [onUnauthorized])

    // przed zamknięciem karty z niezapisanymi zmianami przeglądarka zapyta
    useEffect(() => {
        if (!dirty) return
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault()
        }
        window.addEventListener('beforeunload', warn)
        return () => window.removeEventListener('beforeunload', warn)
    }, [dirty])

    const updateTopBar = (patch: Partial<TopBarConfig>) => setConfig((current) => (current ? { ...current, topBar: { ...current.topBar, ...patch } } : current))

    const updateCampaigns = useCallback((update: (campaigns: Campaign[]) => Campaign[]) => {
        setConfig((current) => (current ? { ...current, campaigns: update(current.campaigns) } : current))
    }, [])

    const save = async () => {
        if (!config) return
        setSaving(true)
        setMessage(null)
        try {
            const response = await fetch('/api/admin/promo', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            })
            if (response.status === 401) return onUnauthorized()
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setMessage({ type: 'error', text: json?.message ?? 'Nie udało się zapisać.' })
                return
            }
            setConfig(json.config)
            setSaved(JSON.stringify(json.config))
            setMessage({ type: 'ok', text: 'Zapisano. Zmiany są widoczne na stronie w ciągu minuty (odśwież stronę sklepu).' })
        } catch {
            setMessage({ type: 'error', text: 'Brak połączenia z serwerem. Spróbuj ponownie.' })
        } finally {
            setSaving(false)
        }
    }

    if (load.status === 'loading') return <p className="text-sm text-muted-foreground">Wczytuję ustawienia…</p>
    if (load.status === 'error' || !config) {
        return (
            <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {load.status === 'error' ? load.message : 'Brak danych.'}
            </p>
        )
    }

    const { topBar, campaigns } = config

    return (
        <div className="space-y-6 pb-24">
            {/* pasek na górze */}
            <Section
                title="Pasek na górze strony"
                description="Wąski pasek nad nagłówkiem sklepu z kodem rabatowym i opcjonalnym licznikiem odliczającym do końca promocji."
                actions={<ToggleField label="Pasek włączony" checked={topBar.enabled} onChange={(enabled) => updateTopBar({ enabled })} />}
            >
                <div className="grid gap-4 sm:grid-cols-2">
                    <TextAreaField
                        label="Tekst paska"
                        value={topBar.text}
                        onChange={(text) => updateTopBar({ text })}
                        maxLength={300}
                        rows={2}
                        hint="Wstawka {code} zamienia się w kod rabatowy (kliknięcie go kopiuje)."
                        className="sm:col-span-2"
                    />
                    <TextField label="Kod rabatowy" value={topBar.code} onChange={(code) => updateTopBar({ code: code.toUpperCase() })} maxLength={30} />
                    <div />
                    <DateTimeField label="Pasek widoczny od" value={topBar.startsAt} onChange={(startsAt) => updateTopBar({ startsAt })} hint="Puste = od razu." />
                    <DateTimeField label="Pasek widoczny do" value={topBar.endsAt} onChange={(endsAt) => updateTopBar({ endsAt })} hint="Puste = bez końca. Do tej daty odlicza licznik." />
                    <div className="sm:col-span-2">
                        <ToggleField label="Pokaż licznik" checked={topBar.counterEnabled} onChange={(counterEnabled) => updateTopBar({ counterEnabled })} hint="Licznik odlicza do daty „widoczny do” — bez niej się nie pokaże." />
                    </div>
                    <DateTimeField
                        label="Licznik widoczny od"
                        value={topBar.counterFrom}
                        onChange={(counterFrom) => updateTopBar({ counterFrom })}
                        hint="Przed tą datą pasek jest bez licznika. Puste = od początku paska."
                        className="sm:col-span-2"
                    />
                    <ColorField label="Tło paska" value={topBar.bg} onChange={(bg) => updateTopBar({ bg })} />
                    <ColorField label="Kolor tekstu" value={topBar.color} onChange={(color) => updateTopBar({ color })} />
                    <ColorField label="Tło cyfr licznika" value={topBar.counterBg} onChange={(counterBg) => updateTopBar({ counterBg })} />
                    <ColorField label="Kolor cyfr licznika" value={topBar.counterColor} onChange={(counterColor) => updateTopBar({ counterColor })} />
                </div>

                <div className="mt-6">
                    <p className="mb-2 text-sm font-medium text-foreground">Podgląd</p>
                    <div className="overflow-hidden rounded-lg border border-border">
                        <TopBarView bar={topBar} forceCounter />
                    </div>
                </div>
            </Section>

            {/* kampanie */}
            <Section
                title="Kampanie: plakietki i boks z kodem"
                description="Każda kampania ma kod, rabat, daty i zakres: wszystkie produkty, tylko przecenione albo nieprzecenione, ewentualnie wybrane kategorie. Ten sam zakres steruje plakietką na liście produktów i boksem na karcie produktu. Gdy produkt pasuje do kilku kampanii, widać je wszystkie, w kolejności z listy."
                actions={
                    <button
                        type="button"
                        onClick={() => updateCampaigns((list) => [...list, newCampaign(localId())])}
                        disabled={campaigns.length >= MAX_CAMPAIGNS}
                        className={cn(BUTTON_OUTLINE, 'gap-2')}
                    >
                        <Plus className="size-4" aria-hidden="true" />
                        Dodaj kampanię
                    </button>
                }
            >
                {campaigns.length === 0 ? (
                    <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Brak kampanii. Dodaj pierwszą, aby na stronie pojawiły się plakietki z kodem.</p>
                ) : (
                    <div className="space-y-3">
                        {campaigns.map((campaign, index) => (
                            <CampaignEditor
                                key={campaign.id}
                                campaign={campaign}
                                categories={categories}
                                index={index}
                                total={campaigns.length}
                                onChange={(next) => updateCampaigns((list) => list.map((entry) => (entry.id === campaign.id ? next : entry)))}
                                onMove={(direction) =>
                                    updateCampaigns((list) => {
                                        const target = index + direction
                                        if (target < 0 || target >= list.length) return list
                                        const copy = [...list]
                                        ;[copy[index], copy[target]] = [copy[target], copy[index]]
                                        return copy
                                    })
                                }
                                onDuplicate={() =>
                                    updateCampaigns((list) => {
                                        const copy = [...list]
                                        copy.splice(index + 1, 0, { ...campaign, id: localId(), name: `${campaign.name} (kopia)`, enabled: false })
                                        return copy
                                    })
                                }
                                onDelete={() => {
                                    if (window.confirm(`Usunąć kampanię „${campaign.name}”?`)) updateCampaigns((list) => list.filter((entry) => entry.id !== campaign.id))
                                }}
                            />
                        ))}
                    </div>
                )}
            </Section>

            {/* pasek zapisu przyklejony do dołu */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
                <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
                    <p role="status" className={cn('text-sm', message?.type === 'error' ? 'text-destructive' : message?.type === 'ok' ? 'text-success' : 'text-muted-foreground')}>
                        {message?.text ?? (dirty ? 'Masz niezapisane zmiany.' : 'Wszystkie zmiany zapisane.')}
                    </p>
                    <button type="button" onClick={save} disabled={saving || !dirty} className={BUTTON_PRIMARY}>
                        {saving ? 'Zapisuję…' : 'Zapisz zmiany'}
                    </button>
                </div>
            </div>
        </div>
    )
}
