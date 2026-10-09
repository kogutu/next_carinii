'use client'

import { ENTER } from '@/components/ui/surface'
import { useState } from 'react'
import Link from 'next/link'
import { Headset } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SuccessHeader } from './SuccessHeader'
import { SuccessStatus, paysOnDelivery } from './SuccessStatus'
import { OrderDetails } from './OrderDetails'
import { OrderSummaryDetails } from './OrderSummaryDetails'
import { SuccessNextSteps } from './SuccessNextSteps'

interface OrderData {
  orderId: string
  pay: boolean
  paymenta_data: any
  incrementId: string
  status: 'paid' | 'unpaid' | 'pending'
  paymentMethod: string
  paymentMethodCode: string
  // 'invoice' = klient prosi o fakturę (także na osobę prywatną, bez NIP)
  documentType?: 'receipt' | 'invoice'
  shippingMethod: string
  shippingDescription?: string
  customer: {
    email: string
    firstName: string
    lastName: string
    phone: string
    type: string
    nip?: string
    companyName?: string
  }
  billingAddress: {
    firstName: string
    lastName: string
    street: string
    city: string
    postcode: string
    phone: string
  }
  shippingAddress?: {
    firstName: string
    lastName: string
    street: string
    city: string
    postcode: string
    phone: string
  }
  items: Array<{
    name: string
    sku: string
    quantity: number
    price: number
    image?: string
  }>
  subtotal: number
  shipping: number
  discount?: number
  couponCode?: string | null
  grandTotal?: number
  total: number
}

export function SuccessPageContent({ orderData: initialData, sessionid }: { orderData: OrderData, sessionid: string }) {
  const [orderData, setOrderData] = useState<OrderData>(initialData)
  const [sessionId] = useState(() => sessionid)

  const { customer } = orderData
  const isPaid = Boolean(orderData.pay)

  return (
    <main className="bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className={ENTER}>
          <SuccessHeader
            incrementId={orderData.incrementId}
            firstName={customer.firstName}
            email={customer.email}
            isPaid={isPaid}
          />
        </div>

        <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-x-12 lg:gap-y-10">
          <div className={cn(ENTER, 'delay-100 lg:col-start-1 lg:row-start-1')}>
            <SuccessStatus
              orderData={orderData}
              sessionId={sessionId}
              setOrderData={setOrderData}
              status={isPaid}
              paymentMethod={orderData.paymentMethod}
              paymentMethodCode={orderData.paymentMethodCode}
              customerEmail={customer.email}
            />
          </div>

          <aside className={cn(ENTER, 'delay-200 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start')}>
            <OrderSummaryDetails
              items={orderData.items}
              subtotal={orderData.subtotal}
              shipping={orderData.shipping}
              discount={orderData.discount}
              couponCode={orderData.couponCode}
              shippingDescription={orderData.shippingDescription}
              total={Number(orderData.grandTotal ?? orderData.total)}
            />
          </aside>

          <div className={cn(ENTER, 'delay-300 space-y-10 lg:col-start-1 lg:row-start-2')}>
            <SuccessNextSteps
              email={customer.email}
              isPaid={isPaid}
              paysOnDelivery={paysOnDelivery(orderData.paymentMethodCode)}
            />
            <OrderDetails orderData={orderData as any} />

            <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-muted/60 p-5">
              <div className="flex items-start gap-3">
                <Headset className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Masz pytanie do zamówienia?</p>
                  <p className="mt-1 text-pretty text-sm text-muted-foreground">
                    Napisz na{' '}
                    <a href="mailto:sklep@carinii.com.pl" className="text-foreground underline underline-offset-4">sklep@carinii.com.pl</a>
                    {' '}i podaj numer {orderData.incrementId}.
                  </p>
                </div>
              </div>
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-menuhover active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100"
              >
                Wróć do sklepu
              </Link>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
