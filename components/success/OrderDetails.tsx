
import { Mail, Phone, MapPin, Truck, CreditCard } from 'lucide-react'

interface OrderDetailsProps {
  orderData: {
    customer: {
      email: string
      firstName: string
      lastName: string
      phone: string
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
    shippingMethod: string
    shippingDescription: string
    paymentMethodIns: string
    paymentMethod: string
  }
}

export function OrderDetails({ orderData }: OrderDetailsProps) {
  const { customer, billingAddress, shippingAddress, shippingMethod, shippingDescription, paymentMethodIns, paymentMethod } = orderData

  const displayShippingAddress = shippingAddress || billingAddress

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Dane kupującego */}
      <div className="p-5 rounded-lg bg-white shadow-sm">
        <h3 className="font-semibold text-hgold mb-4 pb-3 border-b border-gray-200 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-hgold" />
          Dane kupującego
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-900 font-semibold">{billingAddress.firstName} {billingAddress.lastName}</p>
          </div>
          <div className="space-y-1 text-gray-600">
            <p>{billingAddress.street}</p>
            <p>{billingAddress.postcode} {billingAddress.city}</p>
            <p>Polska</p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-gray-700">
            <Phone className="h-4 w-4 text-gray-600" />
            <p>{billingAddress.phone}</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Mail className="h-4 w-4 text-gray-600" />
            <a href={`mailto:${customer.email}`} className="text-hgold hover:underline">{customer.email}</a>
          </div>
        </div>
      </div>

      {/* Adres dostawy */}
      <div className="p-5 rounded-lg bg-white shadow-sm">
        <h3 className="font-semibold text-hgold mb-4 pb-3 border-b border-gray-200 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-hgold" />
          Adres dostawy
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-gray-900 font-semibold">{displayShippingAddress.firstName} {displayShippingAddress.lastName}</p>
          </div>
          <div className="space-y-1 text-gray-600">
            <p>{displayShippingAddress.street}</p>
            <p>{displayShippingAddress.postcode} {displayShippingAddress.city}</p>
            <p>Polska</p>
          </div>
          <div className="flex items-center gap-2 pt-2 text-gray-700">
            <Phone className="h-4 w-4 text-gray-600" />
            <p>{displayShippingAddress.phone}</p>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Mail className="h-4 w-4 text-gray-600" />
            <a href={`mailto:${customer.email}`} className="text-hgold hover:underline">{customer.email}</a>
          </div>
        </div>
      </div>

      {/* Metody */}
      <div className="space-y-4">
        {/* Metoda dostawy */}
        <div className="p-5 rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold text-hgold mb-4 pb-3 border-b border-gray-200 flex items-center gap-2 text-sm ">


            <Truck className="h-4 w-4 text-hgold" />
            Metoda dostawy</h3>
          <p className="text-gray-900 text-sm ">{shippingDescription}</p>
        </div>

        {/* Metoda płatności */}
        <div className="p-5 rounded-lg bg-white shadow-sm">
          <h3 className="font-semibold text-hgold mb-4 pb-3 border-b border-gray-200 flex items-center gap-2 text-sm">

            <CreditCard className="h-4 w-4 text-hgold" />

            Metoda płatności</h3>
          <p className="text-gray-900 text-sm ">{paymentMethod}</p>
          <p className="text-gray-400 text-sm" >{paymentMethodIns}</p>
        </div>
      </div>
    </div>
  )
}
