import { EYEBROW } from '@/components/ui/surface'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'

type SummaryItem = {
  name: string
  sku: string
  quantity: number
  image?: string
  price: number
}

interface OrderSummaryDetailsProps {
  items: SummaryItem[]
  subtotal: number
  shipping: number
  discount?: number
  couponCode?: string | null
  shippingDescription?: string
  total: number
}

// Rozmiar zakodowany w SKU wariantu, np. „…-MO1roz_38” → „38”
const sizeFromSku = (sku: string): string | null => sku.match(/roz_(\d+(?:[.,]\d+)?)$/i)?.[1] ?? null

type SummaryRowProps = {
  label: string
  value: string
  tone?: 'default' | 'success'
}

const SummaryRow = ({ label, value, tone = 'default' }: SummaryRowProps) => (
  <div className="flex items-baseline justify-between gap-4 text-sm">
    <dt className="text-muted-foreground">{label}</dt>
    <dd className={cn('tabular-nums text-foreground', tone === 'success' && 'text-success')}>{value}</dd>
  </div>
)

export function OrderSummaryDetails({
  items,
  subtotal,
  shipping,
  discount = 0,
  couponCode,
  shippingDescription,
  total,
}: OrderSummaryDetailsProps) {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <section aria-labelledby="summary-title" className="surface-card rounded-2xl bg-card p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 id="summary-title" className={EYEBROW}>
          Twoje zamówienie
        </h2>
        <p className="text-xs tabular-nums text-muted-foreground">{itemCount} szt.</p>
      </div>

      <ul className="mt-5 divide-y divide-border">
        {items.map((item) => {
          const size = sizeFromSku(item.sku)
          return (
            <li key={`${item.sku}-${item.name}`} className="flex gap-4 py-4 first:pt-0">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  loading="lazy"
                  className="h-24 w-20 shrink-0 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10"
                />
              ) : (
                <div className="h-24 w-20 shrink-0 rounded-lg bg-muted" aria-hidden="true" />
              )}
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <p className="line-clamp-3 text-balance text-sm font-medium text-foreground">{item.name}</p>
                  <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                    {size && <>Rozmiar {size} · </>}
                    Ilość: {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      <dl className="mt-2 space-y-3 border-t border-border pt-5">
        <SummaryRow label="Produkty" value={formatPrice(subtotal)} />
        <SummaryRow
          label={shippingDescription ? `Dostawa (${shippingDescription})` : 'Dostawa'}
          value={shipping > 0 ? formatPrice(shipping) : 'Gratis'}
        />
        {discount > 0 && (
          <SummaryRow
            label={couponCode ? `Rabat (${couponCode})` : 'Rabat'}
            value={`−${formatPrice(discount)}`}
            tone="success"
          />
        )}
        <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <dt className="text-base font-semibold text-foreground">Razem</dt>
          <dd className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">{formatPrice(total)}</dd>
        </div>
        <p className="text-right text-xs text-muted-foreground">Cena zawiera podatek VAT</p>
      </dl>
    </section>
  )
}
