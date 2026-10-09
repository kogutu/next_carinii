import { CheckCircle2, CreditCard, Loader2 } from 'lucide-react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
import { paymentConfig } from '@/lib/payments/config'
import { getPaymentMethod, getPaymentMethods, type PaymentMethodDef } from '@/lib/payments/methods'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import { methodIcons } from '../checkout/PaymentMethod'
import TpayPaymentPanel, { isTpayHandledCode } from '../tpay/TpayPaymentPanel'
import { BlikButton } from '../p24/buttons/BlikButton'
import { GooglePayButton } from '../p24/buttons/GooglePayButton'
import { Przelewy24Button } from '../p24/buttons/Przelewy24Button'
import { PayPoButton } from '../payu/paybutton'

const PAY_ON_DELIVERY_CODES = ['checkmo', 'cashondelivery']

export const paysOnDelivery = (code: string): boolean => PAY_ON_DELIVERY_CODES.includes(code)

type StatusTone = 'success' | 'warning' | 'neutral'

const STATUS_TONE: Record<StatusTone, string> = {
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-muted text-muted-foreground',
}

const statusPill = (isPaid: boolean, code: string): { label: string; tone: StatusTone } => {
  if (isPaid) return { label: 'Opłacone', tone: 'success' }
  if (paysOnDelivery(code)) return { label: 'Płatność przy odbiorze', tone: 'neutral' }
  if (code === 'banktransfer') return { label: 'Czeka na przelew', tone: 'warning' }
  return { label: 'Czeka na płatność', tone: 'warning' }
}

export function SuccessStatus({ status, orderData, setOrderData, paymentMethod, paymentMethodCode, sessionId }: any) {
  const isPaid = status
  // lista do zmiany płatności wg .env; bieżąca metoda zamówienia może być już wyłączona, więc szukamy jej wśród wszystkich
  const paymentMethods = getPaymentMethods()
  const selected = getPaymentMethod(paymentMethodCode)
  const [payment, setPayment] = useState<any>(selected ?? {})
  const [open, setOpen] = useState(false)
  const [paymentReturn, setPaymentReturn] = useState<'success' | 'error' | null>(null)

  const o = orderData
  const amount = Number(o.grandTotal ?? o.total)
  const pill = statusPill(isPaid, paymentMethodCode)

  const handlePaid = () => setOrderData((prev: any) => ({ ...prev, pay: true }))

  // Powrót z bramki płatności (Tpay / P24): ?payment=tpay&result=success|error.
  // Wynik potwierdza webhook, więc przez chwilę dopytujemy sklep o status zamówienia.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnedFrom = params.get('payment')
    if (returnedFrom !== 'tpay' && returnedFrom !== 'p24') return

    const result = params.get('result') === 'error' ? 'error' : 'success'
    setPaymentReturn(result)
    if (result === 'error' || isPaid) return

    let attempts = 0
    const timer = setInterval(async () => {
      attempts += 1
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(o.incrementId)}`, { cache: 'no-store' })
        const fresh = await res.json()
        if (fresh?.pay) {
          setOrderData((prev: any) => ({ ...prev, pay: true }))
          clearInterval(timer)
        }
      } catch { }
      if (attempts >= 20) clearInterval(timer)
    }, 3000)

    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChangePayment = async (next: PaymentMethodDef) => {
    const log = { act: 'change', from: paymentMethod, to: next.code }

    await fetch('/api/payments/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oid: orderData.incrementId, log }),
    })

    setPayment(next)
  }

  const savePayment = async () => {
    setOpen(false)
    await fetch('/api/magento/payment/change', {
      method: 'POST',
      body: JSON.stringify({ oid: orderData.incrementId, payment: payment.code }),
    })
    setOrderData((prev: any) => ({
      ...prev,
      paymentMethod: payment.title,
      paymentMethodIns: payment.description,
      paymentMethodCode: payment.code,
    }))
  }

  const changePaymentDrawer = (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-md">
          <DrawerHeader>
            <DrawerTitle>Zmień płatność</DrawerTitle>
            <DrawerDescription>Jeszcze masz czas, by zmienić formę płatności.</DrawerDescription>
          </DrawerHeader>
          <div className="px-4">
            {paymentMethods.map((method) => (
              <label
                key={method.code}
                className={cn(
                  'mb-2 block cursor-pointer rounded-xl border-2 p-4 transition-colors',
                  payment.code === method.code ? 'border-foreground bg-muted' : 'border-border hover:border-foreground/60',
                )}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={payment.code === method.code}
                    onChange={() => handleChangePayment(method)}
                    className="size-4 accent-black"
                  />
                  {methodIcons[method.code] ?? <CreditCard className="size-5" aria-hidden="true" />}
                  <p className="font-semibold text-foreground">{method.title}</p>
                  {payment.description && payment.code === method.code && (
                    <div className="mt-2 w-full whitespace-pre-line px-1 text-sm text-muted-foreground">
                      {payment.description}
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
          <DrawerFooter>
            <div className="flex gap-2">
              <Button className="h-11 flex-1 rounded-xl" onClick={savePayment}>Zapisz</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="h-11 rounded-xl px-6">Anuluj</Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )

  const hint = 'text-pretty text-sm text-muted-foreground'

  const payControls = (
    <>
      {paymentMethodCode == 'dialcom_przelewy' && <Przelewy24Button checkoutData={o} sessionId={sessionId} />}
      {paymentMethodCode == 'devbackblik' && <BlikButton checkoutData={o} sessionId={sessionId} />}
      {paymentMethodCode == 'carinii_sklep' && <GooglePayButton checkoutData={o} sessionId={sessionId} />}
      {paymentMethodCode == 'purchaseorder' && paymentConfig.paypo === 'payu' && (
        <PayPoButton checkoutData={o} sessionId={sessionId} />
      )}
      {isTpayHandledCode(paymentMethodCode) && (
        <TpayPaymentPanel code={paymentMethodCode} oid={o.incrementId} amount={amount} onPaid={handlePaid} />
      )}
      {paymentMethodCode == 'checkmo' && (
        <p className={hint}>
          Wybrałeś płatność przy odbiorze w naszej siedzibie (gotówka). Prosimy o wcześniejszą informację przed
          przybyciem, żeby odbiór przebiegł sprawnie. O kolejnych etapach realizacji poinformujemy Cię e-mailem.
        </p>
      )}
      {paymentMethodCode == 'cashondelivery' && (
        <p className={hint}>
          Wybrałeś płatność przy odbiorze w naszej siedzibie (karta lub gotówka). Prosimy o wcześniejszą informację
          przed przybyciem, żeby odbiór przebiegł sprawnie. O kolejnych etapach realizacji poinformujemy Cię e-mailem.
        </p>
      )}
      {paymentMethodCode == 'banktransfer' && (
        <div className={hint} dangerouslySetInnerHTML={{ __html: selected?.html_desc ?? '' }} />
      )}
    </>
  )

  return (
    <section aria-labelledby="payment-title" className="surface-card rounded-2xl bg-card p-5 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="payment-title" className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Płatność
          </h2>
          <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground sm:text-4xl">
            {formatPrice(amount)}
          </p>
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-semibold',
            STATUS_TONE[pill.tone],
          )}
        >
          {pill.label}
        </span>
      </div>

      {isPaid ? (
        <div className="mt-6 flex items-start gap-3 rounded-xl bg-success-soft p-4 text-success">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="text-pretty text-sm font-medium">
            Płatność przyjęta — dziękujemy! Zamówienie przechodzi do realizacji.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {paymentReturn === 'success' && (
            <p role="status" className="flex items-center gap-2 rounded-xl bg-muted p-4 text-sm text-foreground">
              <Loader2 className="size-4 shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              Dziękujemy! Sprawdzamy status Twojej płatności — to może potrwać chwilę.
            </p>
          )}
          {paymentReturn === 'error' && (
            <p role="alert" className="rounded-xl bg-destructive/10 p-4 text-pretty text-sm text-destructive">
              Płatność nie została zakończona. Możesz spróbować ponownie lub zmienić metodę płatności.
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-muted/60 px-4 py-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Wybrana metoda</p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">{paymentMethod}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="-mr-2 inline-flex h-11 items-center rounded-lg px-2 text-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-hcar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Zmień metodę
            </button>
          </div>

          <div className="max-w-sm space-y-3">
            {!paysOnDelivery(paymentMethodCode) && paymentMethodCode !== 'banktransfer' && (
              <p className="text-sm font-medium text-foreground">Zapłać teraz</p>
            )}
            {payControls}
          </div>

          {changePaymentDrawer}
        </div>
      )}
    </section>
  )
}
