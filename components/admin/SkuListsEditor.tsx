'use client'

import { useMemo, useState } from 'react'
import { buildSkuPercentMap, normalizeSku, type SkuTier } from '@/lib/promoConfig'
import { formatSkuLists, parseSkuLists, type ParsedSkuLists } from '@/lib/promoSkuLists'
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
    // ostatnio zastosowane listy: po zastosowaniu pole się czyści, a raport zostaje jako potwierdzenie
    const [lastApplied, setLastApplied] = useState<ParsedSkuLists | null>(null)
    const [lookup, setLookup] = useState('')

    const parsed = useMemo(() => (text.trim() ? parseSkuLists(text) : null), [text])
    const savedMap = useMemo(() => buildSkuPercentMap(tiers), [tiers])
    const savedCount = savedMap.size

    const lookupSku = normalizeSku(lookup)
    const lookupResult = lookupSku ? (savedMap.get(lookupSku) ?? null) : undefined

    // raport: to, co jeszcze czeka w polu, albo to, co przed chwilą zastosowano
    const report = parsed ?? lastApplied
    const isApplied = parsed === null && lastApplied !== null

    const applyParsed = (result: ParsedSkuLists) => {
        if (result.tiers.length === 0) return
        onApply({ tiers: result.tiers, defaultPercent: result.defaultPercent })
        setLastApplied(result)
        setText('')
    }

    // Wklejenie kodu od razu zastępuje listy w kampanii: nie trzeba pamiętać o dodatkowym kliknięciu
    const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const result = parseSkuLists(event.clipboardData.getData('text'))
        if (result.tiers.length === 0) return
        event.preventDefault()
        applyParsed(result)
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
                            setLastApplied(null)
                        }}
                        onPaste={handlePaste}
                        // wpisany ręcznie kod też się stosuje, gdy przejdziesz dalej (np. klikniesz „Zapisz zmiany”)
                        onBlur={() => parsed && applyParsed(parsed)}
                        className={cn(INPUT, 'h-auto py-2 font-mono text-xs')}
                    />
                )}
            </Field>

            {report && (
                <div className={cn('rounded-xl border p-4 text-sm', isApplied ? 'border-success/40 bg-success/10' : 'border-border bg-background')}>
                    {report.tiers.length === 0 ? (
                        <p role="status" className="text-warning">
                            Nie znalazłem żadnej listy w formacie <code className="font-mono text-xs">var p40 = [&quot;SKU&quot;, …]</code>. Sprawdź, czy wkleiłeś cały kod.
                        </p>
                    ) : (
                        <div className="space-y-2" role="status">
                            <p className={cn('font-medium', isApplied ? 'text-success' : 'text-foreground')}>
                                {isApplied ? 'Zastosowano w kampanii' : 'Rozpoznano'} {report.skuCount} {plural(report.skuCount)} na {report.lists.length} {report.lists.length === 1 ? 'liście' : 'listach'}:
                            </p>
                            <ul className="flex flex-wrap gap-2">
                                {report.lists.map((list) => (
                                    <li key={list.name} className="rounded-full bg-muted px-3 py-1 text-xs text-foreground">
                                        <span className="font-mono font-semibold">{list.name}</span> → -{list.percent}%: {list.unique}
                                        {list.entries > list.unique + list.invalid && <span className="text-muted-foreground"> (scalono {list.entries - list.unique - list.invalid} powtórzeń)</span>}
                                    </li>
                                ))}
                            </ul>
                            {report.defaultPercent && (
                                <p className="text-muted-foreground">
                                    Rabat podstawowy z kodu (var p = {report.defaultPercent}): {report.defaultPercent}%{isApplied ? ' — ustawiony w kampanii.' : ' — ustawię go w kampanii.'}
                                </p>
                            )}
                            {report.conflicts.length > 0 && (
                                <p className="text-warning">
                                    {report.conflicts.length} {plural(report.conflicts.length)} jest na kilku listach z różnym rabatem — obowiązuje niższy ({report.conflicts.slice(0, 3).join(', ')}
                                    {report.conflicts.length > 3 ? ', …' : ''}).
                                </p>
                            )}
                            {report.lists.some((list) => list.invalid > 0) && (
                                <p className="text-warning">Pominąłem {report.lists.reduce((sum, list) => sum + list.invalid, 0)} wpisów, które nie wyglądają na SKU.</p>
                            )}
                            <p className={isApplied ? 'font-medium text-foreground' : 'text-warning'}>
                                {isApplied
                                    ? 'Żeby rabaty były widoczne w sklepie, kliknij „Zapisz zmiany” na dole strony.'
                                    : 'To jeszcze nie jest zastosowane — kliknij „Zastosuj listy” (albo wyjdź z pola).'}
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => parsed && applyParsed(parsed)} disabled={!parsed || parsed.tiers.length === 0} className={BUTTON_PRIMARY}>
                    Zastosuj listy
                </button>
            </div>

            {savedCount > 0 && (
                <div className="space-y-3 rounded-xl bg-muted/60 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                            Listy w kampanii: {savedCount} {plural(savedCount)} z własnym rabatem
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                if (window.confirm('Usunąć wszystkie listy SKU z tej kampanii? Produkty dostaną rabat podstawowy.')) {
                                    onClear()
                                    setLastApplied(null)
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
                        <summary className="cursor-pointer text-muted-foreground underline underline-offset-4 hover:text-foreground">Pokaż listy z kampanii jako kod</summary>
                        <textarea readOnly rows={8} value={formatSkuLists(tiers)} onFocus={(event) => event.currentTarget.select()} className={cn(INPUT, 'mt-2 h-auto py-2 font-mono text-xs')} />
                    </details>
                </div>
            )}
        </div>
    )
}
