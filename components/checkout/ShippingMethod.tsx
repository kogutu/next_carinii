'use client'

import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/formatPrice'
import SectionHeader from './SectionHeader'
import { INPOST_PARCEL_LOCKER, type InpostPoint } from '@/hooks/useCheckoutValidation'
import { useCartStore } from '@/stores/cartZustand'
import methods from '../../data/shipping_payment_methods.json'
import Paczkomaty from './shipping_method/paczkomaty'

type ShippingMethodProps = {
    onMethodChange: (method: string) => void
    onPointChange: (point: InpostPoint) => void
    init?: string
    point: InpostPoint
    lastUsed?: string
    error?: string
}

const LOGO_CLASS = 'h-10 w-auto rounded-md outline outline-1 -outline-offset-1 outline-black/10'

const ICONS: Record<string, React.ReactNode> = {
    flatrate_flatrate: <img className={LOGO_CLASS} alt="" src="/shipping_methods/dhl.jpg" />,
    dhl_dhl24pl_courier: <img className={LOGO_CLASS} alt="" src="/shipping_methods/dhl.jpg" />,
    flatrate48_flatrate48: <img className={LOGO_CLASS} alt="" src="/shipping_methods/dhl.jpg" />,
    inpostparcels_inpostparcels: <img className={LOGO_CLASS} alt="" src="/shipping_methods/paczkomaty.jpg" />,
    flatrate5_flatrate5: <img className={LOGO_CLASS} alt="" src="/shipping_methods/inpost-kurier.jpg" />,
}

export default function ShippingMethod({ onMethodChange, onPointChange, init, point, lastUsed, error }: ShippingMethodProps) {
    const shippingMethods = methods.shipping_methods['PL']
    const [selected, setSelected] = useState(init ?? shippingMethods[0]?.code ?? '')
    const setShippingTotal = useCartStore((state) => state.setShippingTotal)

    // Cena wysyłki trafia do koszyka (OrderSummary liczy z niej sumę)
    useEffect(() => {
        const method = shippingMethods.find((m) => m.code === selected)
        if (method && method.price > 0) setShippingTotal(method.price)
    }, [selected, shippingMethods, setShippingTotal])

    const handleChange = (code: string) => {
        setSelected(code)
        onMethodChange(code)
    }

    // Wybór punktu w widgecie InPost wybiera też metodę „Paczkomaty”
    const handlePointSet = (data: { inpost: InpostPoint }) => {
        onPointChange(data.inpost)
        if (selected !== INPOST_PARCEL_LOCKER) handleChange(INPOST_PARCEL_LOCKER)
    }

    return (
        <div id="section-shipping" className="scroll-mt-24">
            <SectionHeader step={2} title="Sposób wysyłki" complete={!error} hasErrors={!!error} />

            <div role="radiogroup" aria-label="Sposób wysyłki" className="grid gap-3">
                {shippingMethods.map((method) => {
                    const icon = ICONS[method.code] ?? <Truck className="size-5 text-foreground" aria-hidden="true" />
                    const isSelected = selected === method.code

                    return (
                        <label
                            key={method.code}
                            className={cn(
                                'flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border-2 p-4 transition-colors motion-reduce:transition-none',
                                isSelected ? 'border-foreground bg-muted/60' : 'border-border hover:border-foreground/50',
                            )}
                        >
                            <input
                                type="radio"
                                name="shipping"
                                checked={isSelected}
                                onChange={() => handleChange(method.code)}
                                className="size-4 shrink-0 accent-black"
                            />

                            <span className="flex h-10 min-w-16 shrink-0 items-center justify-center">{icon}</span>

                            <div className="min-w-0 flex-1" onClick={() => handleChange(method.code)}>
                                <p className="font-semibold text-foreground">{method.title}</p>
                                {lastUsed === method.code && isSelected && (
                                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Ostatnio używane</span>
                                )}
                            </div>

                            <p className="text-sm font-semibold tabular-nums text-foreground">
                                {method.price === 0 ? 'Bezpłatna' : formatPrice(method.price)}
                            </p>

                            {method.code === INPOST_PARCEL_LOCKER && (
                                <div className="w-full sm:pl-8" onClick={() => handleChange(method.code)}>
                                    <Paczkomaty point={point} onSetPoint={handlePointSet} />
                                </div>
                            )}
                        </label>
                    )
                })}
            </div>
            {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
        </div>
    )
}
