

import { AlertCircle, Banknote, Building2, CheckCircle2, CreditCard, Wallet } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '../ui/button'
import { useEffect, useState } from 'react'
import { paymentConfig } from '@/lib/payments/config'
import { getPaymentMethod, getPaymentMethods, type PaymentMethodDef } from '@/lib/payments/methods'
import { methodIcons } from '../checkout/PaymentMethod'
import TpayPaymentPanel, { isTpayHandledCode } from '../tpay/TpayPaymentPanel'
import { BlikButton } from '../p24/buttons/BlikButton'
import { GooglePayButton } from '../p24/buttons/GooglePayButton'
import { Przelewy24Button } from '../p24/buttons/Przelewy24Button'

import { setLogPayment } from '@/lib/p24/payment_calbacks'
import logger from '@/lib/logger'
import { PayPoButton } from '../payu/paybutton'



export function SuccessStatus({ status, orderData, setOrderData, paymentMethod, paymentMethodCode, customerEmail, sessionId }: any) {
  const isPaid = status;
  // lista do zmiany płatności wg .env; bieżąca metoda zamówienia może być już wyłączona, więc szukamy jej wśród wszystkich
  const paymentMethods = getPaymentMethods()
  const selected = getPaymentMethod(paymentMethodCode)
  const [payment, setPayment] = useState<any>(selected ?? {})
  const [open, setOpen] = useState(false);
  const [paymentReturn, setPaymentReturn] = useState<'success' | 'error' | null>(null)

  // console.clear();

  //logger.success("paymentMethod", [paymentMethods, selected],);


  const router = useRouter()
  const o = orderData;
  const amount = Number(o.grandTotal ?? o.total)

  const handlePaid = () => setOrderData((prev: any) => ({ ...prev, pay: true }))

  // Powrót z panelu Tpay (karta / Tpay / PayPo): ?payment=tpay&result=success|error.
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
    const log = { "act": "change", "from": paymentMethod, "to": next.code };

    const response = await fetch('/api/payments/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oid: orderData.incrementId, log: log })
    })



    setPayment(next);

  }

  const savePayment = async () => {
    setOpen(false);
    const url = `/api/magento/payment/change`;
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ oid: orderData.incrementId, payment: payment.code })
    })
    setOrderData((prev: any) => ({
      ...prev,
      ... {
        'paymentMethod': payment.title,
        'paymentMethodIns': payment.description,
        'paymentMethodCode': payment.code,
      }
    }));


    return 'f'
  }

  const btn_changepayment = () => {
    return (
      <Drawer open={open} onOpenChange={setOpen}>

        <button onClick={() => { setOpen(true) }}
          className="rounded-md ml-2 text-gray-500 text-xs font-semibold transition-all duration-200  cursor-pointer "
        >
          Metoda płatności: <span className="font-semibold inline-block mr-3">{paymentMethod}</span>
          <span className="inline-flex items-center gap-x-1.5 py-1.5 px-3 rounded-full text-xs font-medium  bg-yellow-200 hover:bg-yellow-300  text-foreground-inverse"> Zmień metodę płatności</span>
        </button>


        <DrawerContent>
          <div className="mx-auto w-full max-w-md">
            <DrawerHeader>
              <DrawerTitle>Zmień płatność</DrawerTitle>
              <DrawerDescription>Jeszcze masz czas by zmienić formę płatności.</DrawerDescription>
            </DrawerHeader>
            <div>
              {paymentMethods.map((method) => (
                <label
                  key={method.code}
                  className={`block border-2 p-4 mb-2 rounded-lg cursor-pointer transition-colors ${payment.code === method.code
                    ? 'border-[#441c49] bg-[#f8f4f1]'
                    : 'border-gray-200 hover:border-[#441c49] hover:bg-[#f8f4f1]'
                    }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      type="radio"
                      name="payment"
                      checked={payment.code === method.code}
                      onChange={() => handleChangePayment(method)}
                      className="w-4 h-4 accent-[#441c49]"
                    />
                    {methodIcons[method.code] ?? <CreditCard className="w-5 h-5 text-[#441c49]" />}
                    <p className="font-semibold text-[#441c49]">{method.title}</p>
                    {payment.description && payment.code === method.code && (
                      <div className="ml-6  w-full text-sm text-gray-600 whitespace-pre-line px-1 mt-2">
                        {payment.description}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
            <DrawerFooter>
              <div className="flex gap-2">
                <Button className="w-[78%]" onClick={savePayment} >zapisz</Button>
                <DrawerClose >
                  <span className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[>svg]:px-3">Anuluj</span>
                </DrawerClose></div>
            </DrawerFooter>
          </div>

        </DrawerContent>
      </Drawer >
    )
  }

  return (
    <div className=" rounded-lg border bg-gray-50 border-gray-100 p-6 sm:p-8 space-y-6">
      {/* Payment Status Section */}
      <div className="pb-6 border-b border-gray-100">
        <div className="flex items-start gap-4">
          {isPaid ? (
            <CheckCircle2 className="h-5 w-5 text-gray-600 flex-shrink-0 mt-1" />
          ) : (
            <AlertCircle className="h-5 w-5 text-gray-600 flex-shrink-0 mt-1" />
          )}
          <div className="flex-1">
            {/* <P24PaymentForm /> */}

            <p className="text-gray-800 text-sm mb-2 ">
              Twoje zamówienie <b>#{o.incrementId}</b> zostało przyjęte do naszego systemu<br /><b> Obecny status:</b>
              {isPaid ? (
                <span className="ml-2 mt-2 py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium bg-green-100 text-green-800 rounded-full dark:bg-green-500/20 dark:text-red-400">
                  <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                  OPŁACONE
                </span>


              ) :

                (


                  <span className="ml-2 mt-2 py-1 px-2 inline-flex items-center gap-x-1 text-xs font-medium bg-red-100 text-red-800 rounded-full dark:bg-red-500/20 dark:text-red-400">
                    <svg className="shrink-0 size-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    NIEOPŁACONE
                  </span>


                )
              }



            </p>
            {paymentReturn === 'success' && !isPaid && (
              <p role="status" className="mt-4 text-sm text-gray-700">
                Dziękujemy! Sprawdzamy status Twojej płatności — to może potrwać chwilę.
              </p>
            )}
            {paymentReturn === 'error' && !isPaid && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                Płatność nie została zakończona. Możesz spróbować ponownie lub zmienić metodę płatności.
              </p>
            )}
            {!isPaid && (
              <div className='mt-6'>
                {paymentMethodCode == "dialcom_przelewy" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <Przelewy24Button checkoutData={o} sessionId={sessionId}></Przelewy24Button>
                  </div>
                )}
                {paymentMethodCode == "devbackblik" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <BlikButton checkoutData={o} sessionId={sessionId} />
                  </div>
                )}
                {paymentMethodCode == "carinii_sklep" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <GooglePayButton checkoutData={o} sessionId={sessionId} />
                  </div>
                )}
                {paymentMethodCode == "purchaseorder" && paymentConfig.paypo === 'payu' && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <PayPoButton checkoutData={o} sessionId={sessionId} />
                  </div>
                )}
                {isTpayHandledCode(paymentMethodCode) && (
                  <div className="space-y-3">
                    <b className='text-gray-500 text-sm'>OPŁAĆ ZAMÓWIENIE:</b>
                    <TpayPaymentPanel code={paymentMethodCode} oid={o.incrementId} amount={amount} onPaid={handlePaid} />
                  </div>
                )}
                {paymentMethodCode == "checkmo" && (
                  <p className="text-gray-500 text-sm">Wybrałeś sposób płatności przy odbiorze towaru w naszej siedzibie (gotówka). <br />
                    W celu sprawnego odbioru towaru bardzo prosimy o wcześniejszą informację przed przybyciem. <br />
                    O dalszych etapach realizacji zamówienia będa Państwo informowani drogą mailową.
                  </p>

                )}

                {paymentMethodCode == "cashondelivery" && (
                  <p className="text-gray-500 text-sm">Wybrałeś sposób płatności przy odbiorze towaru w naszej siedzibie (karta/gotówka). <br />
                    W celu sprawnego odbioru towaru bardzo prosimy o wcześniejszą informację przed przybyciem. <br />
                    O dalszych etapach realizacji zamówienia będa Państwo informowani drogą mailową.
                  </p>

                )}

                {paymentMethodCode == "banktransfer" && (
                  <p className="text-gray-500 text-sm" dangerouslySetInnerHTML={{ __html: selected?.html_desc ?? '' }} />

                )}
              </div>
            )}
            {!isPaid && (
              <div className='mt-8'>

                {btn_changepayment()}


              </div>
            )}
          </div>
        </div>
      </div>



      {/* Contact Info Section */}
      <div>
        <p className="text-gray-700 text-xs uppercase tracking-wide mb-2 font-semibold">Na email {customerEmail}

        </p>
        <p className="text-gray-600 text-xs leading-relaxed">
          wysłaliśmy potwierdzenie zamówienia. Kiedy zamówienie będzie gotowe do wysyłki, prześlemy Ci numer listu przewozowego.
        </p>
      </div>


    </div >
  )
}

