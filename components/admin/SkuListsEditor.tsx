'use client'

import { useMemo, useState } from 'react'
import { buildSkuPercentMap, normalizeSku, type SkuTier } from '@/lib/promoConfig'
import { formatSkuLists, parseSkuLists } from '@/lib/promoSkuLists'
import { cn } from '@/lib/utils'
import { BUTTON_OUTLINE, BUTTON_PRIMARY, Field, INPUT } from './fields'

type SkuListsEditorProps = {
    tiers: SkuTier[]
    // rabat podstawowy kampanii: dostają go produkty spoza list
    percent: number
    onApply: (result: { tiers: SkuTier[]; defaultPercent: number | null }) => void
    onClear: () => void
}

const plural = (count: number): string => (count === 1 ? 'produkt' : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20) ? 'produkty' : 'produktów')

// Rabaty per produkt: wklejasz kod ze starego sklepu (var p40 = ["SKU", ...]; var p30 = [...]), a panel zamienia go na rabaty
export default function SkuListsEditor({ tiers, percent, onApply, onClear }: SkuListsEditorProps) {
    const [text, setText] = useState('')
    const [applied, setApplied] = useState<string | null>(null)
    const [lookup, setLookup] = useState('')

    const parsed = useMemo(() => (text.trim() ? parseSkuLists(text) : null), [text])
    const savedMap = useMemo(() => buildSkuPercentMap(tiers), [tiers])
    const savedCount = savedMap.size

    const lookupSku = normalizeSku(lookup)
    const lookupResult = lookupSku ? (savedMap.get(lookupSku) ?? null) : undefined

    const apply = () => {
        if (!parsed || parsed.tiers.length === 0) return
        onApply({ tiers: parsed.tiers, defaultPercent: parsed.defaultPercent })
        setApplied(
            `Zastosowano ${parsed.skuCount} ${plural(parsed.skuCount)}${parsed.defaultPercent ? `, rabat podstawowy ${parsed.defaultPercent}%` : ''}. Zapisz zmiany na dole strony.`,
        )
        setText('')
    }

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Rabat per produkt (opcjonalnie)</h3>
                <p className="mt-1 max-w-2xl text-pretty text-sm text-muted-foreground">
                    Wklej kod z listami SKU, np. <code className="font-mono text-xs">var p40 = [&quot;B10743-O17-000-000-MO1&quot;, …]</code>. Nazwa listy to rabat (p40 = -40%), kod rabatowy zostaje wspólny. Produkty spoza
                    list dostają rabat podstawowy kampanii ({percent}%). Reszta wklejonego kodu jest pomijana.
                </p>
            </div>

            <Field label="Wklej kod" hint="Nowe listy zastępują dotychczasowe. Jeśli SKU jest na kilku listach, obowiązuje niższy rabat.">
                {(id) => (
                    <textarea
                        id={id}
                        value={text}
                        rows={6}
                        spellCheck={false}
                        placeholder={'var p40 = ["B10743-O17-000-000-MO1", "B10557-T82-000-000-SC1"];\nvar p30 = ["B10747-T89-000-000-MO1"];\nvar p = 20;'}
                        onChange={(event) => {
                            setText(event.target.value)
                            setApplied(null)
                        }}
                        className={cn(INPUT, 'h-auto py-2 font-mono text-xs')}
                    />
                )}
            </Field>

            {parsed && (
                <div className="rounded-xl border border-border bg-background p-4 text-sm">
                    {parsed.tiers.length === 0 ? (
                        <p role="status" className="text-warning">
                            Nie znalazłem żadnej listy w formacie <code className="font-mono text-xs">var p40 = [&quot;SKU&quot;, …]</code>. Sprawdź, czy wkleiłeś cały kod.
                        </p>
                    ) : (
                        <div className="space-y-2" role="status">
                            <p className="font-medium text-foreground">
                                Rozpoznano {parsed.skuCount} {plural(parsed.skuCount)} na {parsed.lists.length} {parsed.lists.length === 1 ? 'liście' : 'listach'}:
                            </p>
                            <ul className="flex flex-wrap gap-2">
                                {parsed.lists.map((list) => (
                                    <li key={list.name} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                                        <span className="font-mono font-semibold">{list.name}</span> → -{list.percent}%: {list.unique}
                                        {list.entries > list.unique + list.invalid && <span className="text-muted-foreground"> (scalono {list.entries - list.unique - list.invalid} powtórzeń)</span>}
                                    </li>
                                ))}
                            </ul>
                            {parsed.defaultPercent && <p className="text-muted-foreground">Rabat podstawowy z kodu (var p = {parsed.defaultPercent}): {parsed.defaultPercent}% — ustawię go w kampanii.</p>}
                            {parsed.conflicts.length > 0 && (
                                <p className="text-warning">
                                    {parsed.conflicts.length} {plural(parsed.conflicts.length)} jest na kilku listach z różnym rabatem — obowiązuje niższy ({parsed.conflicts.slice(0, 3).join(', ')}
                                    {parsed.conflicts.length > 3 ? ', …' : ''}).
                                </p>
                            )}
                            {parsed.lists.some((list) => list.invalid > 0) && (
                                <p className="text-warning">Pominąłem {parsed.lists.reduce((sum, list) => sum + list.invalid, 0)} wpisów, które nie wyglądają na SKU.</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={apply} disabled={!parsed || parsed.tiers.length === 0} className={BUTTON_PRIMARY}>
                    Zastosuj listy
                </button>
                {applied && (
                    <p role="status" className="text-sm text-success">
                        {applied}
                    </p>
                )}
            </div>

            {savedCount > 0 && (
                <div className="space-y-3 rounded-xl bg-muted/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                            Zapisane listy: {savedCount} {plural(savedCount)} z własnym rabatem
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('Usunąć wszystkie listy SKU z tej kampanii? Produkty dostaną rabat podstawowy.')) {
                                    onClear()
                                    setApplied(null)
                                }
                            }}
                            className={cn(BUTTON_OUTLINE, 'h-9 px-3 text-destructive')}
                        >
                            Usuń listy
                        </button>
                    </div>
                    <ul className="flex flex-wrap gap-2">
                        {tiers.map((tier) => (
                            <li key={tier.percent} className="rounded-full bg-background px-3 py-1 text-xs text-foreground">
                                -{tier.percent}%: <span className="font-semibold">{tier.skus.length}</span>
                            </li>
                        ))}
                    </ul>

                    <Field label="Sprawdź SKU" hint="Wpisz SKU produktu, aby zobaczyć, jaki rabat dostanie.">
                        {(id) => <input id={id} type="text" value={lookup} onChange={(event) => setLookup(event.target.value)} placeholder="np. B10747-H20-000-000-MO1" className={cn(INPUT, 'font-mono')} />}
                    </Field>
                    {lookupResult !== undefined && (
                        <p role="status" className="text-sm text-foreground">
                            {lookupResult !== null ? (
                                <>
                                    <span className="font-mono">{lookupSku}</span> → <strong>-{lookupResult}%</strong> (z listy)
                                </>
                            ) : (
                                <>
                                    <span className="font-mono">{lookupSku}</span> nie ma na listach → <strong>-{percent}%</strong> (rabat podstawowy)
                                </>
                            )}
                        </p>
                    )}

                    <details className="text-sm">
                        <summary className="cursor-pointer text-muted-foreground underline underline-offset-4 hover:text-foreground">Pokaż zapisane listy jako kod</summary>
                        <textarea readOnly rows={8} value={formatSkuLists(tiers)} onFocus={(event) => event.currentTarget.select()} className={cn(INPUT, 'mt-2 h-auto py-2 font-mono text-xs')} />
                    </details>
                </div>
            )}
        </div>
    )
}
