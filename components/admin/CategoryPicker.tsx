'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { PromoCategory } from '@/lib/promoConfig'
import { cn } from '@/lib/utils'

export type PickerCategory = { id: string; name: string; path: string; depth: number }

type CategoryPickerProps = {
    categories: PickerCategory[]
    value: PromoCategory[]
    onChange: (value: PromoCategory[]) => void
}

// Wielokrotny wybór kategorii z drzewa sklepu. Pusty wybór = „wszystkie kategorie”.
export default function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
    const [query, setQuery] = useState('')
    const selectedIds = useMemo(() => new Set(value.map((category) => category.id)), [value])
    // aktualne nazwy z drzewa sklepu (zapisana nazwa mogła się zmienić po zmianie nazwy kategorii)
    const names = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])

    const visible = useMemo(() => {
        const needle = query.trim().toLowerCase()
        if (!needle) return categories
        return categories.filter((category) => category.path.toLowerCase().includes(needle))
    }, [categories, query])

    const toggle = (category: PickerCategory) => {
        if (selectedIds.has(category.id)) {
            onChange(value.filter((entry) => entry.id !== category.id))
        } else {
            onChange([...value, { id: category.id, name: category.name }])
        }
    }

    return (
        <div className="space-y-3">
            <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                {value.length === 0 ? (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">Wszystkie kategorie</span>
                ) : (
                    <>
                        {value.map((category) => (
                            <span key={category.id} className="inline-flex items-center gap-1 rounded-full bg-primary py-1 pl-3 pr-1.5 text-xs text-primary-foreground">
                                {names.get(category.id) ?? category.name}
                                <button
                                    type="button"
                                    onClick={() => onChange(value.filter((entry) => entry.id !== category.id))}
                                    aria-label={`Usuń kategorię ${category.name}`}
                                    className="rounded-full p-0.5 hover:bg-white/20"
                                >
                                    <X className="size-3" aria-hidden="true" />
                                </button>
                            </span>
                        ))}
                        <button type="button" onClick={() => onChange([])} className="ml-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground">
                            wyczyść (wszystkie kategorie)
                        </button>
                    </>
                )}
            </div>

            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Szukaj kategorii…"
                    aria-label="Szukaj kategorii"
                    className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                {categories.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">Nie udało się pobrać listy kategorii. Odśwież stronę.</p>
                ) : visible.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground">Brak kategorii pasujących do „{query}”.</p>
                ) : (
                    <ul>
                        {visible.map((category) => {
                            const checked = selectedIds.has(category.id)
                            return (
                                <li key={category.id} className="border-b border-border last:border-b-0">
                                    <label
                                        className={cn('flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted', checked && 'bg-muted/60')}
                                        style={{ paddingLeft: `${12 + (query ? 0 : category.depth * 18)}px` }}
                                    >
                                        <input type="checkbox" checked={checked} onChange={() => toggle(category)} className="size-4 shrink-0 accent-black" />
                                        <span className="min-w-0 flex-1 truncate">{query ? category.path : category.name}</span>
                                    </label>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        </div>
    )
}
