'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Check, Minus, Plus } from 'lucide-react'
import FormInput, { FormSelect } from '@/components/checkout/FormInput'
import SectionHeader from '@/components/checkout/SectionHeader'
import PayButton from '@/components/payments/PayButton'
import ConsentFields, { EMPTY_CONSENT, type ConsentState } from '@/components/consent/ConsentFields'
import { recordConsent } from '@/lib/consentClient'
import { CopyOrderNumber } from '@/components/success/CopyOrderNumber'
import { ENTER, ENTER_DELAY, EYEBROW, SurfaceCard } from '@/components/ui/surface'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import PhotoUploader from './PhotoUploader'
import WithdrawalButton from '@/components/withdrawal/WithdrawalButton'
import { RETURN_ADDRESS } from '@/lib/withdrawal'
import { REASONS, RESOLUTIONS, type ReturnOrder, type ReturnType } from './returnOptions'
import { sizeLabel } from '@/lib/sizeLabel'

type SubmitResult = {
    ref: string
    type: ReturnType
    orderNumber: string
    itemCount: number
    photoCount: number
    outOfWindow: boolean
    email: string
}

// Ten formularz służy reklamacjom. Rezygnacja z zakupu (zwrot) to odstąpienie od umowy — osobna funkcja „Odstąp od umowy tutaj” (lib/withdrawal.ts).
const FORM_TYPE = 'reklamacja' as const satisfies ReturnType

const ACCOUNT_PATTERN = /^(PL)?\d{26}$/i
const PLACEHOLDER = { value: '', label: 'Wybierz…' }

const formatDate = (value: string): string => {
    const date = new Date(value.replace(' ', 'T'))
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
}

type ReturnRequestFormProps = {
    initialOrder?: string
}

export default function ReturnRequestForm({ initialOrder = '' }: ReturnRequestFormProps) {
    const { data: session, status: sessionStatus } = useSession()

    const [orderNumber, setOrderNumber] = useState(initialOrder)
    const [email, setEmail] = useState('')
    const [order, setOrder] = useState<ReturnOrder | null>(null)
    const [lookup, setLookup] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' })

    const [selected, setSelected] = useState<Record<number, number>>({})
    const [reason, setReason] = useState('')
    const [resolution, setResolution] = useState('')
    const [description, setDescription] = useState('')
    const [bankAccount, setBankAccount] = useState('')
    const [photos, setPhotos] = useState<{ tokens: string[]; busy: boolean }>({ tokens: [], busy: false })
    const [consent, setConsent] = useState<ConsentState>(EMPTY_CONSENT)

    const [submitAttempted, setSubmitAttempted] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [result, setResult] = useState<SubmitResult | null>(null)

    const autoLookupDone = useRef(false)

    const runLookup = async (number: string, mail: string) => {
        setLookup({ loading: true, error: '' })
        setOrder(null)
        try {
            const response = await fetch('/api/returns/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: number.trim(), email: mail.trim() }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setLookup({ loading: false, error: json?.message ?? 'Nie udało się sprawdzić zamówienia. Spróbuj ponownie.' })
                return
            }
            setOrder(json.data)
            setSelected({})
            setLookup({ loading: false, error: '' })
        } catch {
            setLookup({ loading: false, error: 'Nie udało się sprawdzić zamówienia. Sprawdź połączenie i spróbuj ponownie.' })
        }
    }

    // zalogowany klient: e-mail z konta, a numer z linku (?order=) sprawdzamy od razu
    useEffect(() => {
        if (sessionStatus !== 'authenticated' || !session?.user?.email) return
        setEmail((current) => current || session.user?.email || '')
        if (initialOrder && !autoLookupDone.current) {
            autoLookupDone.current = true
            runLookup(initialOrder, session.user.email)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStatus, session?.user?.email])

    const toggleItem = (itemId: number, available: number) =>
        setSelected((current) => {
            const next = { ...current }
            if (next[itemId]) delete next[itemId]
            else next[itemId] = Math.min(1, available)
            return next
        })

    const changeQty = (itemId: number, available: number, delta: number) =>
        setSelected((current) => ({ ...current, [itemId]: Math.min(available, Math.max(1, (current[itemId] ?? 1) + delta)) }))

    const errors = useMemo(() => {
        const found: Record<string, string> = {}
        if (Object.keys(selected).length === 0) found.items = 'Wybierz co najmniej jeden produkt.'
        if (!reason) found.reason = 'Wybierz powód.'
        if (!resolution) found.resolution = 'Wybierz preferowane rozwiązanie.'
        if (description.trim().length < 10) found.description = 'Opisz wadę (co najmniej 10 znaków).'
        if (bankAccount.trim() && !ACCOUNT_PATTERN.test(bankAccount.replace(/\s+/g, ''))) found.bankAccount = 'Numer konta powinien mieć 26 cyfr.'
        if (!consent.terms) found.terms = 'Aby wysłać zgłoszenie, zaakceptuj regulamin sklepu.'
        return found
    }, [selected, reason, resolution, description, bankAccount, consent.terms])

    const handleSubmit = async () => {
        setSubmitAttempted(true)
        if (!order || Object.keys(errors).length > 0 || photos.busy) return

        setSubmitting(true)
        setSubmitError('')
        try {
            const response = await fetch('/api/returns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: order.orderNumber,
                    email,
                    type: FORM_TYPE,
                    items: Object.entries(selected).map(([itemId, qty]) => ({ itemId: Number(itemId), qty })),
                    reason,
                    resolution,
                    description,
                    bankAccount,
                    photos: photos.tokens,
                }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setSubmitError(json?.message ?? 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie.')
                return
            }
            recordConsent({ source: 'returns', email, terms: true, marketing: consent.marketing, context: { ref: String(json.data?.ref ?? ''), order: order.orderNumber } })
            setResult(json.data)
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch {
            setSubmitError('Nie udało się wysłać zgłoszenia. Sprawdź połączenie i spróbuj ponownie.')
        } finally {
            setSubmitting(false)
        }
    }

    const showError = (field: string) => (submitAttempted ? errors[field] : undefined)

    // ---------- gotowe zgłoszenie ----------
    if (result) {
        return (
            <SurfaceCard className={cn(ENTER, 'mx-auto max-w-2xl text-center sm:p-10')}>
                <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-6" strokeWidth={3} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground">Zgłoszenie przyjęte</h2>
                <p className="mt-2 text-pretty text-muted-foreground">
                    {result.type === 'zwrot' ? 'Zwrot' : 'Reklamację'} do zamówienia {result.orderNumber} przyjęliśmy do obsługi.
                    Potwierdzenie wysłaliśmy na <span className="font-medium text-foreground">{result.email}</span>.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                    <div className="text-left">
                        <p className={EYEBROW}>Numer zgłoszenia</p>
                        <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{result.ref}</p>
                    </div>
                    <CopyOrderNumber value={result.ref} />
                </div>

                <ul className="mx-auto mt-8 max-w-sm space-y-2 text-left text-sm text-muted-foreground">
                    <li>Odpowiemy na to zgłoszenie e-mailem.</li>
                    <li>Podaj numer zgłoszenia w korespondencji i na paczce, jeśli będziesz odsyłać produkt.</li>
                    {result.type === 'zwrot' && <li>Adres do odesłania: {RETURN_ADDRESS}.</li>}
                    {result.outOfWindow && <li>Od odbioru minął ustawowy termin 14 dni — rozpatrzymy zgłoszenie indywidualnie.</li>}
                </ul>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    {session?.user && (
                        <Link href="/klient/panel/zwroty-reklamacje" className="surface-card inline-flex h-11 items-center justify-center rounded-xl bg-background px-6 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                            Moje zgłoszenia
                        </Link>
                    )}
                    <Link href="/" className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                        Wróć do sklepu
                    </Link>
                </div>
            </SurfaceCard>
        )
    }

    const reasonOptions = [PLACEHOLDER, ...REASONS[FORM_TYPE]]
    const resolutionOptions = [PLACEHOLDER, ...RESOLUTIONS[FORM_TYPE]]

    return (
        <div className="space-y-6">
            {/* 1. zamówienie */}
            <SurfaceCard className={cn(ENTER, ENTER_DELAY[1])}>
                <SectionHeader step={1} title="Zamówienie" complete={Boolean(order)} />
                <form
                    className="grid gap-4 sm:grid-cols-2"
                    onSubmit={(event) => {
                        event.preventDefault()
                        runLookup(orderNumber, email)
                    }}
                >
                    <FormInput name="returns-order" label="Numer zamówienia" value={orderNumber} onChange={setOrderNumber} autoComplete="off" hint={<span className="text-muted-foreground">Np. CAR-261009-7K3QXM, z wiadomości z potwierdzeniem.</span>} />
                    <FormInput name="returns-email" label="E-mail z zamówienia" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} />
                    <div className="sm:col-span-2">
                        <PayButton type="submit" align="center" isLoading={lookup.loading} loadingLabel="Sprawdzam…" disabled={!orderNumber.trim() || !email.trim()} className="sm:w-auto sm:px-8">
                            Sprawdź zamówienie
                        </PayButton>
                    </div>
                </form>
                {lookup.error && (
                    <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {lookup.error}
                    </p>
                )}
            </SurfaceCard>

            {order && !order.eligible && (
                <SurfaceCard className={cn(ENTER, 'flex items-start gap-3 sm:p-6')}>
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                    <div>
                        <p className="font-semibold text-foreground">Nie można zgłosić online</p>
                        <p className="mt-1 text-pretty text-sm text-muted-foreground">{order.ineligibleReason}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Pomożemy: <a className="text-foreground underline underline-offset-4" href="mailto:sklep@carinii.com.pl">sklep@carinii.com.pl</a>
                        </p>
                    </div>
                </SurfaceCard>
            )}

            {order?.eligible && (
                <>
                    {/* 2. produkty */}
                    <SurfaceCard className={ENTER}>
                        <SectionHeader step={2} title="Co zgłaszasz?" complete={Object.keys(selected).length > 0} hasErrors={Boolean(showError('items'))} />
                        <p className="-mt-3 mb-5 text-sm text-muted-foreground">
                            Zamówienie {order.orderNumber} z {formatDate(order.createdAt)}
                            {order.firstName ? `, ${order.firstName}` : ''}.
                        </p>

                        <div className="rounded-xl bg-muted/60 px-4 py-3 text-pretty text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">Reklamacja</p>
                            <p className="mt-0.5">Produkt ma wadę lub jest niezgodny z zamówieniem.</p>
                            <p className="mt-2">
                                Rezygnujesz z zakupu? To odstąpienie od umowy, które złożysz tutaj: <WithdrawalButton orderNumber={order.orderNumber} variant="link" />
                            </p>
                        </div>

                        <ul className="mt-5 divide-y divide-border">
                            {order.items.map((item) => {
                                const checked = Boolean(selected[item.itemId])
                                const unavailable = item.qtyAvailable < 1
                                return (
                                    <li key={item.itemId} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <label className={cn('flex min-w-0 flex-1 items-center gap-4', unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                                                <input type="checkbox" checked={checked} disabled={unavailable} onChange={() => toggleItem(item.itemId, item.qtyAvailable)} className="size-5 shrink-0 accent-black" aria-label={`Wybierz: ${item.name}`} />
                                                {item.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={item.image} alt="" className="h-20 w-16 shrink-0 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                                                ) : (
                                                    <span className="h-20 w-16 shrink-0 rounded-lg bg-muted" aria-hidden="true" />
                                                )}
                                                <span className="min-w-0">
                                                    <span className="line-clamp-2 text-balance text-sm font-medium text-foreground">{item.name.split('CARINII--')[0]}</span>
                                                    <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                                                        {item.size && <>Rozmiar {sizeLabel(item.sku, item.size)} · </>}
                                                        {formatPrice(item.price)}
                                                    </span>
                                                    {unavailable && <span className="mt-1 block text-xs text-warning">Zgłoszone wcześniej</span>}
                                                </span>
                                            </label>

                                            {checked && item.qtyAvailable > 1 && (
                                                <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Ilość">
                                                    <button type="button" onClick={() => changeQty(item.itemId, item.qtyAvailable, -1)} disabled={selected[item.itemId] <= 1} aria-label="Zmniejsz ilość" className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 disabled:opacity-50">
                                                        <Minus className="size-3.5" aria-hidden="true" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm tabular-nums">{selected[item.itemId]}</span>
                                                    <button type="button" onClick={() => changeQty(item.itemId, item.qtyAvailable, 1)} disabled={selected[item.itemId] >= item.qtyAvailable} aria-label="Zwiększ ilość" className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 disabled:opacity-50">
                                                        <Plus className="size-3.5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                        {showError('items') && <p role="alert" className="mt-3 text-xs text-destructive">{errors.items}</p>}

                        {order.existing.length > 0 && (
                            <p className="mt-5 text-pretty text-xs text-muted-foreground">
                                Dotychczasowe zgłoszenia do tego zamówienia: {order.existing.map((entry) => `${entry.ref} (${entry.type === 'zwrot' ? 'zwrot' : 'reklamacja'})`).join(', ')}.
                            </p>
                        )}
                    </SurfaceCard>

                    {/* 3. szczegóły */}
                    <SurfaceCard className={ENTER}>
                        <SectionHeader step={3} title="Szczegóły" complete={!errors.reason && !errors.resolution && !errors.description} hasErrors={Boolean(showError('reason') || showError('resolution') || showError('description'))} />
                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormSelect name="returns-reason" label="Powód" value={reason} onChange={setReason} options={reasonOptions} error={showError('reason')} />
                                <FormSelect name="returns-resolution" label="Preferowane rozwiązanie" value={resolution} onChange={setResolution} options={resolutionOptions} error={showError('resolution')} />
                            </div>

                            <div>
                                <label htmlFor="returns-description" className="mb-1.5 block text-sm font-medium text-foreground">
                                    Opis wady *
                                </label>
                                <textarea
                                    id="returns-description"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    maxLength={3000}
                                    rows={5}
                                    placeholder="Co się stało? Kiedy zauważyłeś wadę? Jak produkt był używany?"
                                    aria-invalid={Boolean(showError('description'))}
                                    className={cn(
                                        'w-full rounded-xl border bg-background px-3 py-3 text-base text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-foreground',
                                        showError('description') ? 'border-destructive' : 'border-hborder/50',
                                    )}
                                />
                                {showError('description') && <p role="alert" className="mt-1.5 text-xs text-destructive">{errors.description}</p>}
                            </div>

                            <FormInput
                                name="returns-account"
                                label="Numer konta do zwrotu (opcjonalnie)"
                                required={false}
                                inputMode="numeric"
                                autoComplete="off"
                                value={bankAccount}
                                onChange={setBankAccount}
                                error={showError('bankAccount')}
                                hint={<span className="text-muted-foreground">Jeśli chcesz, aby środki trafiły na konkretny rachunek (26 cyfr).</span>}
                            />
                        </div>
                    </SurfaceCard>

                    {/* 4. zdjęcia */}
                    <SurfaceCard className={ENTER}>
                        <SectionHeader
                            step={4}
                            title="Zdjęcia"
                            complete={photos.tokens.length > 0}
                            description="Dodaj zdjęcia wady: zbliżenie i cały produkt. Bardzo przyspieszy to rozpatrzenie reklamacji."
                        />
                        <PhotoUploader disabled={submitting} onChange={(tokens, busy) => setPhotos({ tokens, busy })} />
                    </SurfaceCard>

                    <div className={ENTER}>
                        <ConsentFields
                            idPrefix="returns"
                            channels="email"
                            className="mb-4"
                            value={consent}
                            onChange={setConsent}
                            termsError={showError('terms')}
                            disabled={submitting}
                        />
                        {submitAttempted && Object.keys(errors).length > 0 && (
                            <p role="alert" className="mb-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                Uzupełnij zaznaczone pola, aby wysłać zgłoszenie.
                            </p>
                        )}
                        {submitError && (
                            <p role="alert" className="mb-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {submitError}
                            </p>
                        )}
                        <PayButton align="center" isLoading={submitting} loadingLabel="Wysyłanie…" disabled={photos.busy} onClick={handleSubmit} className="h-12 text-base sm:w-auto sm:px-10">
                            {photos.busy ? 'Wysyłam zdjęcia…' : 'Wyślij zgłoszenie'}
                        </PayButton>
                        <p className="mt-3 text-pretty text-xs text-muted-foreground">
                            Wysyłając zgłoszenie, zgadzasz się na przetwarzanie danych w celu jego obsługi. Szczegóły w{' '}
                            <Link href="/polityka-prywatnosci" className="underline underline-offset-4">polityce prywatności</Link>.
                        </p>
                    </div>
                </>
            )}
        </div>
    )
}
