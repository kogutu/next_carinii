'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { AlertTriangle, Check, Minus, Plus } from 'lucide-react'
import FormInput, { FormSelect } from '@/components/checkout/FormInput'
import SectionHeader from '@/components/checkout/SectionHeader'
import PayButton from '@/components/payments/PayButton'
import { formatOrderDate, type PanelOrder } from '@/components/panel/panelOrders'
import type { ReturnOrder } from '@/components/returns/returnOptions'
import { CopyOrderNumber } from '@/components/success/CopyOrderNumber'
import { ENTER, ENTER_DELAY, EYEBROW, SurfaceCard } from '@/components/ui/surface'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import { CONFIRM_LABEL, RETURN_ADDRESS, WITHDRAW_DAYS, type WithdrawalResult } from '@/lib/withdrawal'

type Step = 'form' | 'review' | 'done'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ACCOUNT_PATTERN = /^(PL)?\d{26}$/i
const PICKER_PLACEHOLDER = { value: '', label: 'Wybierz zamówienie…' }

// „Nadaj paczkę przez Wygodne Zwroty” pokazujemy dopiero po skonfigurowaniu integracji (docs/wygodne-zwroty.md)
const SHIPMENT_ENABLED = process.env.NEXT_PUBLIC_WZ_RETURNS === 'on'

const SECONDARY_BUTTON =
    'inline-flex h-12 items-center justify-center rounded-xl bg-background px-6 text-sm font-semibold text-foreground surface-card transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

type WithdrawalFormProps = {
    initialOrder?: string
}

// Funkcja odstąpienia od umowy: krok 1 (imię i nazwisko, zamówienie, e-mail) -> krok 2 (przegląd i „Potwierdź odstąpienie od umowy”).
// Bez logowania (gość podaje numer zamówienia i e-mail), bez podawania przyczyny. Zalogowany wybiera zamówienie z listy.
export default function WithdrawalForm({ initialOrder = '' }: WithdrawalFormProps) {
    const { data: session, status: sessionStatus } = useSession()
    const accountEmail = sessionStatus === 'authenticated' ? (session?.user?.email ?? '') : ''

    const [step, setStep] = useState<Step>('form')

    const [fullName, setFullName] = useState('')
    const [orderNumber, setOrderNumber] = useState(initialOrder)
    const [email, setEmail] = useState('')
    // zalogowany klient może zamiast listy własnych zamówień wpisać numer (np. zamówienie złożone bez logowania)
    const [manualOrder, setManualOrder] = useState(false)
    const [accountOrders, setAccountOrders] = useState<PanelOrder[]>([])
    const [ordersLoaded, setOrdersLoaded] = useState(false)

    const [attempted, setAttempted] = useState(false)
    const [lookup, setLookup] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' })
    const [order, setOrder] = useState<ReturnOrder | null>(null)
    const [selected, setSelected] = useState<Record<number, number>>({})
    const [bankAccount, setBankAccount] = useState('')

    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [result, setResult] = useState<WithdrawalResult | null>(null)
    const [shipment, setShipment] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' })

    const stepRef = useRef<HTMLDivElement>(null)
    const firstRender = useRef(true)

    // zalogowany: e-mail z konta, imię i nazwisko z konta oraz lista własnych zamówień do wyboru
    useEffect(() => {
        if (sessionStatus !== 'authenticated') return
        let cancelled = false

        const load = async () => {
            try {
                const [ordersResponse, userResponse] = await Promise.all([
                    fetch('/api/user/orders?page=1&limit=50', { cache: 'no-store' }),
                    fetch('/api/user/getuser', { method: 'POST', cache: 'no-store' }),
                ])
                const ordersJson = await ordersResponse.json().catch(() => null)
                const userJson = await userResponse.json().catch(() => null)
                if (cancelled) return

                const orders: PanelOrder[] = ordersResponse.ok && ordersJson?.success ? (ordersJson.data?.orders ?? []) : []
                setAccountOrders(orders.filter((entry) => entry.state !== 'canceled' && entry.status !== 'canceled'))

                const name = `${userJson?.data?.firstName ?? ''} ${userJson?.data?.lastName ?? ''}`.trim()
                if (name) setFullName((current) => current || name)
            } catch {
                // bez listy zamówień zalogowany wpisuje numer ręcznie
            } finally {
                if (!cancelled) setOrdersLoaded(true)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [sessionStatus])

    // numer z linku (?order=), którego nie ma na liście konta -> ręczne wpisanie; e-mail konta podpowiadamy
    useEffect(() => {
        if (sessionStatus !== 'authenticated' || !ordersLoaded) return
        setEmail((current) => current || accountEmail)
        if (initialOrder && !accountOrders.some((entry) => entry.increment_id === initialOrder)) setManualOrder(true)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionStatus, ordersLoaded])

    // po zmianie kroku fokus trafia na początek nowego kroku (czytnik ekranu i klawiatura)
    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false
            return
        }
        stepRef.current?.focus()
        if (step === 'done') window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [step])

    const usePicker = sessionStatus === 'authenticated' && ordersLoaded && accountOrders.length > 0 && !manualOrder
    const effectiveEmail = usePicker ? accountEmail : email.trim()

    const pickerOptions = useMemo(
        () => [
            PICKER_PLACEHOLDER,
            ...accountOrders.map((entry) => ({
                value: entry.increment_id,
                label: `${entry.increment_id} · ${formatOrderDate(entry.created_at)}${entry.status_label ? ` · ${entry.status_label}` : ''}`,
            })),
        ],
        [accountOrders],
    )

    const formErrors = useMemo(() => {
        const found: Record<string, string> = {}
        if (fullName.trim().length < 3) found.fullName = 'Podaj imię i nazwisko.'
        if (!orderNumber.trim()) found.order = usePicker ? 'Wybierz zamówienie.' : 'Podaj numer zamówienia.'
        if (!usePicker && !EMAIL_PATTERN.test(email.trim())) found.email = 'Podaj adres e-mail użyty w zamówieniu.'
        return found
    }, [fullName, orderNumber, email, usePicker])

    const reviewErrors = useMemo(() => {
        const found: Record<string, string> = {}
        if (Object.keys(selected).length === 0) found.items = 'Wybierz co najmniej jeden produkt.'
        if (bankAccount.trim() && !ACCOUNT_PATTERN.test(bankAccount.replace(/\s+/g, ''))) found.bankAccount = 'Numer konta powinien mieć 26 cyfr.'
        return found
    }, [selected, bankAccount])

    const availableQty = (entry: ReturnOrder['items'][number]) => entry.qtyAvailable

    const handleContinue = async () => {
        setAttempted(true)
        if (Object.keys(formErrors).length > 0) return

        setLookup({ loading: true, error: '' })
        try {
            const response = await fetch('/api/returns/lookup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: orderNumber.trim(), email: effectiveEmail, purpose: 'withdrawal' }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setLookup({ loading: false, error: json?.message ?? 'Nie udało się sprawdzić zamówienia. Spróbuj ponownie.' })
                return
            }

            const found: ReturnOrder = json.data
            setOrder(found)
            // domyślnie całe zamówienie: wszystkie dostępne pozycje w pełnej ilości (odznaczenie = odstąpienie częściowe)
            setSelected(Object.fromEntries(found.items.filter((entry) => availableQty(entry) > 0).map((entry) => [entry.itemId, availableQty(entry)])))
            setLookup({ loading: false, error: '' })
            setSubmitError('')
            setStep('review')
        } catch {
            setLookup({ loading: false, error: 'Nie udało się sprawdzić zamówienia. Sprawdź połączenie i spróbuj ponownie.' })
        }
    }

    const toggleItem = (itemId: number, available: number) =>
        setSelected((current) => {
            const next = { ...current }
            if (next[itemId]) delete next[itemId]
            else next[itemId] = available
            return next
        })

    const changeQty = (itemId: number, available: number, delta: number) =>
        setSelected((current) => ({ ...current, [itemId]: Math.min(available, Math.max(1, (current[itemId] ?? available) + delta)) }))

    const isFullScope = (current: ReturnOrder): boolean =>
        current.items.every((entry) => availableQty(entry) < 1 || selected[entry.itemId] === availableQty(entry))

    const handleConfirm = async () => {
        setAttempted(true)
        if (!order || Object.keys(reviewErrors).length > 0) return

        setSubmitting(true)
        setSubmitError('')
        try {
            const response = await fetch('/api/withdrawal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: order.orderNumber,
                    email: effectiveEmail,
                    fullName: fullName.trim(),
                    // całe zamówienie = bez listy pozycji
                    items: isFullScope(order) ? [] : Object.entries(selected).map(([itemId, qty]) => ({ itemId: Number(itemId), qty })),
                    bankAccount: order.isCod ? bankAccount : '',
                }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success) {
                setSubmitError(json?.message ?? 'Nie udało się złożyć oświadczenia. Spróbuj ponownie.')
                return
            }
            setResult(json.data)
            setStep('done')
        } catch {
            setSubmitError('Nie udało się złożyć oświadczenia. Sprawdź połączenie i spróbuj ponownie.')
        } finally {
            setSubmitting(false)
        }
    }

    const startShipment = async () => {
        if (!result) return
        setShipment({ loading: true, error: '' })
        try {
            const response = await fetch('/api/withdrawal/shipment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: result.orderNumber, ref: result.ref, email: effectiveEmail }),
            })
            const json = await response.json().catch(() => null)
            if (!response.ok || !json?.success || !json?.data?.redirectUrl) {
                setShipment({ loading: false, error: json?.message ?? 'Nie udało się otworzyć formularza nadania. Spróbuj ponownie.' })
                return
            }
            // przycisk zostaje w stanie „ładowanie” do czasu przejścia na stronę Wygodnych Zwrotów
            window.location.assign(json.data.redirectUrl)
        } catch {
            setShipment({ loading: false, error: 'Nie udało się otworzyć formularza nadania. Sprawdź połączenie i spróbuj ponownie.' })
        }
    }

    const showError = (field: string) => (attempted ? formErrors[field] : undefined)

    // ---------- krok 3: oświadczenie złożone ----------
    if (step === 'done' && result) {
        return (
            <div ref={stepRef} tabIndex={-1} className="outline-none">
                <SurfaceCard className={cn(ENTER, 'mx-auto max-w-2xl text-center sm:p-10')}>
                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-6" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-foreground">
                        {result.alreadySubmitted ? 'Oświadczenie zostało już złożone' : 'Oświadczenie o odstąpieniu przyjęte'}
                    </h2>
                    <p className="mt-2 text-pretty text-muted-foreground">
                        {result.alreadySubmitted
                            ? `Do zamówienia ${result.orderNumber} oświadczenie zostało już złożone, więc nie tworzymy kolejnego.`
                            : `Otrzymaliśmy Twoje oświadczenie o odstąpieniu od umowy (zamówienie ${result.orderNumber}).`}
                    </p>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
                        <div className="text-left">
                            <p className={EYEBROW}>Numer potwierdzenia</p>
                            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{result.ref}</p>
                        </div>
                        <CopyOrderNumber value={result.ref} />
                    </div>

                    {result.withdrawnAtLocal && (
                        <p className="mt-4 text-sm text-foreground">
                            Data i godzina złożenia: <span className="font-semibold tabular-nums">{result.withdrawnAtLocal}</span>
                        </p>
                    )}

                    {!result.alreadySubmitted &&
                        (result.ackSent === false ? (
                            <p role="status" className="mx-auto mt-5 flex max-w-md items-start gap-2 rounded-xl bg-warning-soft px-4 py-3 text-left text-sm text-warning">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                Nie udało się wysłać potwierdzenia e-mailem. Oświadczenie jest zapisane, a potwierdzenie wyślemy ręcznie. Zachowaj numer {result.ref}.
                            </p>
                        ) : (
                            <p role="status" className="mt-4 text-pretty text-sm text-muted-foreground">
                                Potwierdzenie z treścią oświadczenia oraz datą i godziną wysłaliśmy na <span className="font-medium text-foreground">{result.email}</span>.
                            </p>
                        ))}

                    {result.outOfWindow && (
                        <p className="mx-auto mt-4 max-w-md text-pretty text-left text-sm text-muted-foreground">
                            Od odbioru zamówienia minęło orientacyjnie ponad {WITHDRAW_DAYS} dni. Oświadczenie przyjęliśmy, a jego skuteczność oceni nasza obsługa.
                        </p>
                    )}

                    <ul className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm text-muted-foreground">
                        <li>Odeślij towar najpóźniej w ciągu {WITHDRAW_DAYS} dni od złożenia oświadczenia na adres: {result.returnAddress || RETURN_ADDRESS}.</li>
                        <li>Podaj numer {result.ref} na paczce lub w korespondencji.</li>
                        <li>Płatność zwrócimy nie później niż w ciągu {WITHDRAW_DAYS} dni od otrzymania oświadczenia, tą samą metodą, której użyto przy zakupie.</li>
                    </ul>

                    {/* logistyka zwrotu: kod nadania w punkcie, bez etykiety (Wygodne Zwroty, Partner API) — włączana flagą po skonfigurowaniu kluczy */}
                    {SHIPMENT_ENABLED && (
                        <div className="mx-auto mt-8 max-w-md rounded-xl bg-muted/60 p-4 text-left">
                            <p className="text-sm font-semibold text-foreground">Nadaj paczkę bez drukowania etykiety</p>
                            <p className="mt-1 text-pretty text-sm text-muted-foreground">
                                Wybierz punkt nadania (np. Paczkomat, punkt DPD, DHL lub GLS) w formularzu Wygodnych Zwrotów. Koszt nadania przesyłki pokaże formularz. Możesz też odesłać paczkę samodzielnie na adres powyżej.
                            </p>
                            <PayButton align="center" isLoading={shipment.loading} loadingLabel="Otwieram formularz…" onClick={startShipment} className="mt-4">
                                Nadaj paczkę przez Wygodne Zwroty
                            </PayButton>
                            {shipment.error && (
                                <p role="alert" className="mt-3 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {shipment.error}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        {sessionStatus === 'authenticated' && (
                            <Link href="/klient/panel/zwroty-reklamacje" className={SECONDARY_BUTTON}>
                                Moje zgłoszenia
                            </Link>
                        )}
                        <Link href="/" className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                            Wróć do sklepu
                        </Link>
                    </div>
                </SurfaceCard>
            </div>
        )
    }

    // ---------- krok 2: przegląd i potwierdzenie ----------
    if (step === 'review' && order) {
        const available = order.items.filter((entry) => availableQty(entry) > 0)
        const full = isFullScope(order)

        return (
            <div ref={stepRef} tabIndex={-1} className="space-y-6 outline-none">
                {!order.eligible ? (
                    <SurfaceCard className={cn(ENTER, 'flex items-start gap-3 sm:p-6')}>
                        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden="true" />
                        <div>
                            <p className="font-semibold text-foreground">Nie można złożyć oświadczenia online</p>
                            <p className="mt-1 text-pretty text-sm text-muted-foreground">{order.ineligibleReason}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Pomożemy: <a className="text-foreground underline underline-offset-4" href="mailto:sklep@carinii.com.pl">sklep@carinii.com.pl</a>
                            </p>
                            <button type="button" onClick={() => setStep('form')} className="mt-4 text-sm font-medium text-foreground underline underline-offset-4">
                                Wróć i popraw dane
                            </button>
                        </div>
                    </SurfaceCard>
                ) : (
                    <SurfaceCard className={ENTER}>
                        <SectionHeader step={2} title="Sprawdź i potwierdź" description="Nie musisz podawać przyczyny odstąpienia." />

                        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Imię i nazwisko</dt>
                                <dd className="font-medium text-foreground">{fullName.trim()}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Zamówienie</dt>
                                <dd className="font-medium tabular-nums text-foreground">
                                    {order.orderNumber} <span className="font-normal text-muted-foreground">z {formatOrderDate(order.createdAt)}</span>
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-muted-foreground">Potwierdzenie wyślemy na</dt>
                                <dd className="font-medium text-foreground">{effectiveEmail}</dd>
                            </div>
                        </dl>

                        {!order.withinReturnWindow && (
                            <p className="mt-5 flex items-start gap-2 rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
                                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                                Od odbioru zamówienia minęło orientacyjnie ponad {order.returnWindowDays} dni. Możesz złożyć oświadczenie — jego skuteczność oceni nasza obsługa.
                            </p>
                        )}

                        <h3 className="mt-8 text-sm font-semibold text-foreground">Produkty objęte oświadczeniem</h3>
                        <p className="mt-1 text-pretty text-xs text-muted-foreground">Domyślnie całe zamówienie. Odznacz produkty, od których nie odstępujesz.</p>

                        <ul className="mt-4 divide-y divide-border">
                            {order.items.map((entry) => {
                                const max = availableQty(entry)
                                const checked = Boolean(selected[entry.itemId])
                                const unavailable = max < 1
                                return (
                                    <li key={entry.itemId} className="py-4 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <label className={cn('flex min-w-0 flex-1 items-center gap-4', unavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
                                                <input type="checkbox" checked={checked} disabled={unavailable} onChange={() => toggleItem(entry.itemId, max)} className="size-5 shrink-0 accent-black" aria-label={`Odstępuję od: ${entry.name}`} />
                                                {entry.image ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={entry.image} alt="" className="h-20 w-16 shrink-0 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                                                ) : (
                                                    <span className="h-20 w-16 shrink-0 rounded-lg bg-muted" aria-hidden="true" />
                                                )}
                                                <span className="min-w-0">
                                                    <span className="line-clamp-2 text-balance text-sm font-medium text-foreground">{entry.name.split('CARINII--')[0]}</span>
                                                    <span className="mt-1 block text-xs tabular-nums text-muted-foreground">
                                                        {entry.size && <>Rozmiar {entry.size} · </>}
                                                        {formatPrice(entry.price)}
                                                    </span>
                                                    {unavailable && <span className="mt-1 block text-xs text-warning">Objęte wcześniejszym zgłoszeniem</span>}
                                                </span>
                                            </label>

                                            {checked && max > 1 && (
                                                <div className="flex shrink-0 items-center gap-1" role="group" aria-label="Ilość">
                                                    <button type="button" onClick={() => changeQty(entry.itemId, max, -1)} disabled={selected[entry.itemId] <= 1} aria-label="Zmniejsz ilość" className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 disabled:opacity-50">
                                                        <Minus className="size-3.5" aria-hidden="true" />
                                                    </button>
                                                    <span className="w-6 text-center text-sm tabular-nums">{selected[entry.itemId]}</span>
                                                    <button type="button" onClick={() => changeQty(entry.itemId, max, 1)} disabled={selected[entry.itemId] >= max} aria-label="Zwiększ ilość" className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 disabled:opacity-50">
                                                        <Plus className="size-3.5" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                        {attempted && reviewErrors.items && <p role="alert" className="mt-3 text-xs text-destructive">{reviewErrors.items}</p>}

                        {order.isCod && (
                            <FormInput
                                name="withdraw-account"
                                label="Numer konta do zwrotu (opcjonalnie)"
                                required={false}
                                inputMode="numeric"
                                autoComplete="off"
                                className="mt-6"
                                value={bankAccount}
                                onChange={setBankAccount}
                                error={attempted ? reviewErrors.bankAccount : undefined}
                                hint={<span className="text-muted-foreground">Przy płatności za pobraniem zwrot trafi na ten rachunek (26 cyfr).</span>}
                            />
                        )}

                        <div className="mt-8 rounded-xl bg-muted/60 p-4">
                            <p className={EYEBROW}>Treść oświadczenia</p>
                            <p className="mt-2 text-pretty text-sm text-foreground">
                                Niniejszym odstępuję od umowy sprzedaży zawartej na odległość (zamówienie nr {order.orderNumber}) w zakresie:{' '}
                                {full ? 'całego zamówienia' : 'wybranych produktów'}.
                            </p>
                        </div>

                        {submitError && (
                            <p role="alert" className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                {submitError}
                            </p>
                        )}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                            <button type="button" onClick={() => setStep('form')} disabled={submitting} className={SECONDARY_BUTTON}>
                                Wstecz
                            </button>
                            <PayButton align="center" isLoading={submitting} loadingLabel="Wysyłanie…" disabled={available.length === 0} onClick={handleConfirm} className="h-12 text-base sm:w-auto sm:px-10">
                                {CONFIRM_LABEL}
                            </PayButton>
                        </div>
                        <p className="mt-3 text-pretty text-xs text-muted-foreground">
                            Po potwierdzeniu wyślemy na Twój adres e-mail potwierdzenie z treścią oświadczenia oraz datą i godziną jego złożenia.
                        </p>
                    </SurfaceCard>
                )}
            </div>
        )
    }

    // ---------- krok 1: dane oświadczenia ----------
    return (
        <div ref={stepRef} tabIndex={-1} className="space-y-6 outline-none">
            <SurfaceCard className={cn(ENTER, ENTER_DELAY[1])}>
                <SectionHeader
                    step={1}
                    title="Oświadczenie o odstąpieniu od umowy"
                    description={`Masz ${WITHDRAW_DAYS} dni na odstąpienie od umowy bez podawania przyczyny. Nie musisz mieć konta.`}
                />

                {sessionStatus === 'authenticated' && (
                    <p className="-mt-2 mb-5 text-sm text-muted-foreground">
                        Jesteś zalogowany jako <span className="font-medium text-foreground">{accountEmail}</span>.
                    </p>
                )}

                <form
                    className="grid gap-4 sm:grid-cols-2"
                    noValidate
                    onSubmit={(event) => {
                        event.preventDefault()
                        handleContinue()
                    }}
                >
                    <FormInput name="withdraw-name" label="Imię i nazwisko" autoComplete="name" value={fullName} onChange={setFullName} error={showError('fullName')} className="sm:col-span-2" />

                    {usePicker ? (
                        <div className="sm:col-span-2">
                            <FormSelect name="withdraw-order-select" label="Zamówienie" value={orderNumber} onChange={setOrderNumber} options={pickerOptions} error={showError('order')} />
                            <button
                                type="button"
                                onClick={() => {
                                    setManualOrder(true)
                                    setOrderNumber('')
                                    setEmail((current) => current || accountEmail)
                                }}
                                className="mt-2 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                            >
                                Nie ma tu mojego zamówienia — wpiszę numer zamówienia i e-mail
                            </button>
                        </div>
                    ) : (
                        <>
                            <FormInput
                                name="withdraw-order"
                                label="Numer zamówienia"
                                autoComplete="off"
                                value={orderNumber}
                                onChange={setOrderNumber}
                                error={showError('order')}
                                hint={<span className="text-muted-foreground">Np. CAR-261009-7K3QXM, z wiadomości z potwierdzeniem zamówienia.</span>}
                            />
                            <FormInput name="withdraw-email" label="E-mail z zamówienia" type="email" inputMode="email" autoComplete="email" value={email} onChange={setEmail} error={showError('email')} />
                        </>
                    )}

                    <div className="sm:col-span-2">
                        <PayButton type="submit" align="center" isLoading={lookup.loading} loadingLabel="Sprawdzam…" className="h-12 text-base sm:w-auto sm:px-10">
                            Dalej
                        </PayButton>
                    </div>
                </form>

                {lookup.error && (
                    <p role="alert" className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {lookup.error}
                    </p>
                )}
            </SurfaceCard>

            {sessionStatus !== 'authenticated' && sessionStatus !== 'loading' && (
                <p className={cn(ENTER, 'text-pretty text-xs text-muted-foreground')}>
                    Masz konto?{' '}
                    <button type="button" onClick={() => window.dispatchEvent(new Event('open-account-modal'))} className="underline underline-offset-4 hover:text-foreground">
                        Zaloguj się
                    </button>
                    , a wybierzesz zamówienie z listy.
                </p>
            )}
        </div>
    )
}
