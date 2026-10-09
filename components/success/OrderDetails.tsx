import type { ReactNode } from 'react'
import { Building2, CreditCard, FileText, Mail, MapPin, Phone, Truck } from 'lucide-react'

type Address = {
  firstName: string
  lastName: string
  street: string
  city: string
  postcode: string
  phone: string
}

interface OrderDetailsProps {
  orderData: {
    customer: {
      email: string
      firstName: string
      lastName: string
      phone: string
      nip?: string | null
      companyName?: string | null
    }
    billingAddress: Address
    shippingAddress?: Address
    shippingMethod: string
    shippingDescription: string
    paymentMethodIns?: string | null
    paymentMethod: string
    documentType?: 'receipt' | 'invoice'
  }
}

type DetailCardProps = {
  title: string
  icon: ReactNode
  children: ReactNode
}

const DetailCard = ({ title, icon, children }: DetailCardProps) => (
  <section className="surface-card rounded-2xl bg-card p-5">
    <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
      <span aria-hidden="true" className="[&>svg]:size-4">{icon}</span>
      {title}
    </h3>
    <div className="mt-4 space-y-1 text-sm text-muted-foreground">{children}</div>
  </section>
)

const AddressLines = ({ address }: { address: Address }) => (
  <>
    <p className="font-semibold text-foreground">{address.firstName} {address.lastName}</p>
    <p>{address.street}</p>
    <p>{address.postcode} {address.city}</p>
    <p>Polska</p>
  </>
)

export function OrderDetails({ orderData }: OrderDetailsProps) {
  const { customer, billingAddress, shippingAddress, shippingDescription, paymentMethodIns, paymentMethod, documentType } = orderData
  const deliveryAddress = shippingAddress ?? billingAddress
  const isInvoice = documentType === 'invoice' || Boolean(customer.nip)

  return (
    <section aria-labelledby="order-details-title">
      <h2 id="order-details-title" className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        Szczegóły zamówienia
      </h2>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailCard title="Dane kupującego" icon={<Mail />}>
          {isInvoice && customer.companyName && <p className="font-semibold text-foreground">{customer.companyName}</p>}
          {!(isInvoice && customer.companyName) && (
            <p className="font-semibold text-foreground">{billingAddress.firstName} {billingAddress.lastName}</p>
          )}
          <p>{billingAddress.street}</p>
          <p>{billingAddress.postcode} {billingAddress.city}</p>
          <p className="flex items-center gap-2 pt-3">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">{billingAddress.phone}</span>
          </p>
          <p className="flex items-center gap-2 break-all">
            <Mail className="size-4 shrink-0" aria-hidden="true" />
            <a href={`mailto:${customer.email}`} className="text-foreground underline underline-offset-4">{customer.email}</a>
          </p>
        </DetailCard>

        <DetailCard title="Adres dostawy" icon={<MapPin />}>
          <AddressLines address={deliveryAddress} />
        </DetailCard>

        <DetailCard title="Dostawa" icon={<Truck />}>
          <p className="font-semibold text-foreground">{shippingDescription}</p>
        </DetailCard>

        <DetailCard title="Płatność" icon={<CreditCard />}>
          <p className="font-semibold text-foreground">{paymentMethod}</p>
          {paymentMethodIns && <p className="text-pretty">{paymentMethodIns}</p>}
        </DetailCard>

        <DetailCard title="Dokument zakupu" icon={<FileText />}>
          <p className="font-semibold text-foreground">{isInvoice ? 'Faktura VAT' : 'Paragon'}</p>
          {isInvoice && customer.nip && (
            <p className="flex items-center gap-2">
              <Building2 className="size-4 shrink-0" aria-hidden="true" />
              <span>NIP <span className="tabular-nums">{customer.nip}</span></span>
            </p>
          )}
        </DetailCard>
      </div>
    </section>
  )
}
