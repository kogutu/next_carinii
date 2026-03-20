'use client'

import { useState } from 'react'
import { Package } from 'lucide-react'
import { SuccessHeader } from './SuccessHeader'
import { SuccessStatus } from './SuccessStatus'
import { OrderDetails } from './OrderDetails'
import { OrderSummaryDetails } from './OrderSummaryDetails'

interface OrderData {
  orderId: string
  pay: boolean
  paymenta_data: any
  incrementId: string
  status: 'paid' | 'unpaid' | 'pending'
  paymentMethod: string
  paymentMethodCode: string
  shippingMethod: string
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
  }>
  subtotal: number
  shipping: number
  total: number
}

export function SuccessPageContent({ orderData: initialData, sessionid }: { orderData: OrderData, sessionid: string }) {
  const [orderData, setOrderData] = useState<OrderData>(initialData)
  const [sessionId] = useState(() => sessionid);

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6">

      <div className="max-w-5xl mx-auto">
        <SuccessHeader oid={orderData.incrementId} />

        <div className="space-y-6">
          <SuccessStatus
            orderData={orderData}
            sessionId={sessionId}
            setOrderData={setOrderData}
            status={orderData.pay}
            paymentMethod={orderData.paymentMethod}
            paymentMethodCode={orderData.paymentMethodCode}
            customerEmail={orderData.customer.email}
          />
        </div>

        <div className="mt-12 pt-10 border-t border-gray-200">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            Szczegóły zamówienia
          </h2>

          <div className="mt-6 space-y-2 text-sm">
            <p className="text-gray-700">
              Nr zamówienia: <span className="font-semibold text-gray-900">{orderData.incrementId}</span>
            </p>
            <p className="text-gray-700">
              Dokument zakupu: <span className="font-semibold text-gray-900">Paragon</span>
            </p>
          </div>

          <div className="mt-8">
            <OrderDetails orderData={orderData} />
          </div>

          <OrderSummaryDetails
            items={orderData.items}
            subtotal={orderData.subtotal}
            shipping={orderData.shipping}
            total={orderData.total}
          />
        </div>
      </div>
    </div>
  )
}