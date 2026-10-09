import Link from 'next/link'
import { ArrowUpRight, PackageCheck, RotateCcw } from 'lucide-react'
import { SurfaceCard } from '@/components/ui/surface'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import { canReportReturn, formatOrderDate, isAwaitingPayment, statusTone, type PanelOrder, type StatusTone } from './panelOrders'

const TONE_CLASSES: Record<StatusTone, string> = {
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    neutral: 'bg-muted text-muted-foreground',
}

const MAX_THUMBS = 4

const ACTION_CLASS =
    'inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-[transform,background-color] duration-150 ease-out active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100'

type OrderCardProps = {
    order: PanelOrder
}

export default function OrderCard({ order }: OrderCardProps) {
    const tracks = order.shipments.flatMap((shipment) => shipment.tracks)
    const hiddenItems = Math.max(0, order.items.length - MAX_THUMBS)

    return (
        <SurfaceCard className="sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div>
                    <p className="text-lg font-semibold tabular-nums tracking-tight text-foreground">{order.increment_id}</p>
                    <p className="text-sm text-muted-foreground">{formatOrderDate(order.created_at)}</p>
                </div>
                <span className={cn('inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold', TONE_CLASSES[statusTone(order.status)])}>
                    {order.status_label || order.status}
                </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4">
                <ul className="flex items-center gap-2" aria-label="Produkty w zamówieniu">
                    {order.items.slice(0, MAX_THUMBS).map((item) => (
                        <li key={item.item_id}>
                            {item.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image_url} alt={item.name.split('CARINII--')[0]} loading="lazy" className="h-20 w-16 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10" />
                            ) : (
                                <span className="block h-20 w-16 rounded-lg bg-muted" aria-hidden="true" />
                            )}
                        </li>
                    ))}
                    {hiddenItems > 0 && <li className="flex h-20 w-16 items-center justify-center rounded-lg bg-muted text-sm font-semibold tabular-nums text-muted-foreground">+{hiddenItems}</li>}
                </ul>

                <div className="min-w-0 flex-1 text-sm">
                    <p className="line-clamp-2 text-balance font-medium text-foreground">
                        {order.items.map((item) => item.name.split('CARINII--')[0]).join(', ')}
                    </p>
                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                        {order.total_qty_ordered} szt. · {order.shipping_description || 'Dostawa'}
                        {order.payment?.method_title ? ` · ${order.payment.method_title}` : ''}
                    </p>
                </div>

                <p className="text-xl font-semibold tabular-nums tracking-tight text-foreground sm:ml-auto">{formatPrice(order.grand_total)}</p>
            </div>

            {tracks.length > 0 && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <PackageCheck className="size-4 shrink-0" aria-hidden="true" />
                    <span>Numer przesyłki: {tracks.map((track) => track.number).join(', ')}</span>
                </p>
            )}

            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row">
                <Link href={`/success/oid/${encodeURIComponent(order.increment_id)}`} className={cn(ACTION_CLASS, isAwaitingPayment(order.status) ? 'bg-primary text-primary-foreground hover:bg-menuhover' : 'surface-card bg-background text-foreground hover:bg-muted')}>
                    {isAwaitingPayment(order.status) ? 'Zapłać za zamówienie' : 'Szczegóły zamówienia'}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
                {canReportReturn(order.status) && (
                    <Link href={`/zwrot-reklamacja?order=${encodeURIComponent(order.increment_id)}`} className={cn(ACTION_CLASS, 'surface-card bg-background text-foreground hover:bg-muted')}>
                        <RotateCcw className="size-4" aria-hidden="true" />
                        Zwrot lub reklamacja
                    </Link>
                )}
            </div>
        </SurfaceCard>
    )
}
