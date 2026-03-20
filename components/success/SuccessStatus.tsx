

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
import { useCartStore } from '@/stores/cartZustand'
import { useState } from 'react'
import { P24 } from '@/lib/p24/przelewy24'
import { BlikButton } from '../p24/buttons/BlikButton'
import { GooglePayButton } from '../p24/buttons/GooglePayButton'
import { Przelewy24Button } from '../p24/buttons/Przelewy24Button'

import { setLogPayment } from '@/lib/p24/payment_calbacks'
import logger from '@/lib/logger'



export function SuccessStatus({ status, orderData, setOrderData, paymentMethod, paymentMethodCode, customerEmail, sessionId }: any) {
  const isPaid = status;
  const paymentMethods = useCartStore((state) => state.paymentMethods)
  const selected = paymentMethods.find(m => m.code === paymentMethodCode)
  const [payment, setPayment] = useState(selected ?? {})
  const [open, setOpen] = useState(false);

  console.clear();

  logger.success("paymentMethod", [paymentMethods, selected],);


  const router = useRouter()
  const o = orderData;


  const handleChangePayment = async (payment: string) => {
    const log = { "act": "change", "from": paymentMethod, "to": payment };

    const response = await fetch('/api/payments/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ oid: orderData.incrementId, log: log })
    })



    setPayment(payment);

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

  const methodIcons: Record<string, React.ReactNode> = {
    checkmo: <Banknote className="w-5 h-5 text-[#441c49]" />,
    dialcom_przelewy: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#D9001D" />
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold">P24</text>
      </svg>
    ),
    dialcom_blik: (<svg width="47px " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.64 64.18" > <linearGradient id="blik-a" x1="67.82" y1="63.051" x2="67.82" y2="1.128" gradientUnits="userSpaceOnUse"> <stop stopColor="#5a5a5a" offset="0" /> <stop stopColor="#484848" offset="0.146" /> <stop stopColor="#212121" offset="0.52" /> <stop stopColor="#080808" offset="0.817" /> <stop offset="1" /> </linearGradient> <linearGradient id="blik-o" x1="39.667" y1="19.898" x2="49.695" y2="9.87" gradientUnits="userSpaceOnUse"> <stop stopColor="#e52f08" offset="0" /> <stop stopColor="#e94f96" offset="1" /> </linearGradient> <filter id="blik-b" x="21.709" y="10.07" width="99.399" height="50.159" filterUnits="userSpaceOnUse"> <feOffset dx="2.379" dy="2.973" /> <feGaussianBlur result="blur" stdDeviation="0.743" /> <feFlood floodOpacity="0.949" /> <feComposite in2="blur" operator="in" result="result1" /> <feComposite in="SourceGraphic" in2="result1" /> </filter> <path fill="url(#blik-a)" d="M 127.725,0.827 H 7.915 A 7.083,7.083 0 0 0 0.828,7.906 v 48.368 a 7.082,7.082 0 0 0 7.087,7.078 h 119.81 a 7.082,7.082 0 0 0 7.086,-7.078 V 7.906 a 7.083,7.083 0 0 0 -7.086,-7.079 z" /> <path fill="url(#blik-o)" d="m 51.769,14.884 a 7.088,7.088 0 0 1 -7.088,7.088 7.088,7.088 0 0 1 -7.088,-7.088 7.088,7.088 0 0 1 7.088,-7.088 7.088,7.088 0 0 1 7.088,7.088 z" /> <path fill="#ffffff" filter="url(#blik-b)" d="m 106.28,55.03 h 10.206 L 104.224,39.193 115.343,25.585 h -9.257 L 95.167,39.278 v -29.2 H 87.242 V 55.03 h 7.925 L 95.161,39.316 Z M 72.294,25.58 h 7.923 V 55.025 H 72.294 Z M 57.34,10.069 h 7.923 V 55.025 H 57.34 Z M 36.741,25.286 a 14.968,14.968 0 0 0 -7.108,1.784 v -17 H 21.709 V 40.312 A 15.03,15.03 0 1 0 36.741,25.286 Z m 0,22.26 a 7.233,7.233 0 1 1 7.233,-7.234 7.231,7.231 0 0 1 -7.233,7.234 z" /> </svg>),
    dialcom_gpay: (<svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"> <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /> <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.6 19.1 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.6 6.3 14.7z" /> <path fill="#FBBC04" d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.4 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.6 41.4 15.2 46 24 46z" /> <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.7 7.5l6.5 5.5C40.6 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" /> </svg>),
    banktransfer: <Building2 className="w-5 h-5 text-[#441c49]" />,
    cashondelivery: <Wallet className="w-5 h-5 text-[#441c49]" />,
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
                  className={`block border-2 p-4 mb-2 rounded-lg cursor-pointer transition-colors ${payment === method.code
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
                    {selected?.description && selected.code === method.code && (
                      <div className="ml-6  w-full text-sm text-gray-600 whitespace-pre-line px-1 mt-2">
                        {selected.description}
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
            {!isPaid && (
              <div className='mt-6'>

                {paymentMethodCode == "dialcom_przelewy" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <Przelewy24Button checkoutData={o} sessionId={sessionId}></Przelewy24Button>
                  </div>
                )}
                {paymentMethodCode == "dialcom_blik" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <BlikButton checkoutData={o} sessionId={sessionId} />
                  </div>

                )}
                {paymentMethodCode == "dialcom_gpay" && (
                  <div>                <b className='text-gray-500 text-sm'>              OPŁAĆ ZAMÓWIENIE:</b>
                    <GooglePayButton checkoutData={o} sessionId={sessionId} />
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
                  <p className="text-gray-500 text-sm" dangerouslySetInnerHTML={{ __html: selected.html_desc }} />

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

