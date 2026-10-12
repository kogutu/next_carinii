'use client'

import { useCallback, useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import PromoTab from './PromoTab'
import { BUTTON_OUTLINE, BUTTON_PRIMARY } from './fields'

type Session = { status: 'loading' } | { status: 'disabled' } | { status: 'login' } | { status: 'ready' }

const TABS = [
    { id: 'home', label: 'Home' },
    { id: 'promo', label: 'Promo' },
] as const

type TabId = (typeof TABS)[number]['id']

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const submit = async (event: React.FormEvent) => {
        event.preventDefault()
        setBusy(true)
        setError('')
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setError(json?.message ?? 'Nie udało się zalogować.')
                return
            }
            setPassword('')
            onSuccess()
        } catch {
            setError('Brak połączenia z serwerem.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <form onSubmit={submit} className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold tracking-tight">Logowanie do panelu</h2>
            <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium">
                    Hasło
                </label>
                <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
            <button type="submit" disabled={busy || !password} className={cn(BUTTON_PRIMARY, 'w-full')}>
                {busy ? 'Loguję…' : 'Zaloguj'}
            </button>
        </form>
    )
}

export default function AdminApp() {
    const [session, setSession] = useState<Session>({ status: 'loading' })
    const [tab, setTab] = useState<TabId>('promo')

    const refresh = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/login', { cache: 'no-store' })
            const json = await response.json()
            if (!json.configured) setSession({ status: 'disabled' })
            else setSession({ status: json.authenticated ? 'ready' : 'login' })
        } catch {
            setSession({ status: 'login' })
        }
    }, [])

    useEffect(() => {
        refresh()
    }, [refresh])

    const logout = async () => {
        await fetch('/api/admin/login', { method: 'DELETE' }).catch(() => undefined)
        setSession({ status: 'login' })
    }

    const unauthorized = useCallback(() => setSession({ status: 'login' }), [])

    if (session.status === 'loading') return <p className="py-10 text-sm text-muted-foreground">Wczytuję…</p>

    if (session.status === 'disabled') {
        return (
            <div className="mx-auto mt-10 max-w-lg rounded-2xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold">Panel jest wyłączony</h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground">
                    Aby go włączyć, ustaw na serwerze zmienną środowiskową <code className="rounded bg-muted px-1.5 py-0.5">ADMIN_PASSWORD</code> (hasło do panelu), a na Vercelu zrób ponowne wdrożenie.
                </p>
            </div>
        )
    }

    if (session.status === 'login') return <LoginForm onSuccess={refresh} />

    return (
        <div>
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-border">
                <div role="tablist" aria-label="Sekcje panelu" className="flex gap-1">
                    {TABS.map((entry) => (
                        <button
                            key={entry.id}
                            type="button"
                            role="tab"
                            aria-selected={tab === entry.id}
                            onClick={() => setTab(entry.id)}
                            className={cn(
                                '-mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                                tab === entry.id ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground',
                            )}
                        >
                            {entry.label}
                        </button>
                    ))}
                </div>
                <button type="button" onClick={logout} className={cn(BUTTON_OUTLINE, 'mb-2 gap-2')}>
                    <LogOut className="size-4" aria-hidden="true" />
                    Wyloguj
                </button>
            </div>

            {tab === 'home' && (
                <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                    <p className="text-lg font-semibold tracking-tight">Home — w budowie</p>
                    <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-muted-foreground">
                        Tutaj pojawi się edycja strony głównej: banery, wideo i sekcje. Na razie ustawia się je w pliku <code className="rounded bg-muted px-1.5 py-0.5">data/home.json</code>.
                    </p>
                </div>
            )}
            {tab === 'promo' && <PromoTab onUnauthorized={unauthorized} />}
        </div>
    )
}
