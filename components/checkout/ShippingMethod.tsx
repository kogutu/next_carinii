'use client'

import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
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

const ICONS: Record<string, React.ReactNode> = {
    flatrate_flatrate: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    dhl_dhl24pl_courier: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    flatrate48_flatrate48: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    inpostparcels_inpostparcels: <img className='h-12' alt="" src="/shipping_methods/paczkomaty.jpg" />,
    flatrate5_flatrate5: <img className='h-12' alt="" src="/shipping_methods/inpost-kurier.jpg" />,
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
        <div id="section-shipping" className="space-y-4 scroll-mt-24">
            <SectionHeader
                title="2. Sposób wysyłki"
                complete={!error}
                hasErrors={!!error}
            />

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-1">
                {shippingMethods.map((method) => {
                    const icon = ICONS[method.code] ?? <Truck className="w-5 h-5 text-[#441c49]" />

                    return (
                        <label
                            key={method.code}
                            className={`block border-2 p-4 rounded-lg cursor-pointer hover:bg-[#f8f4f1] transition-colors ${selected === method.code
                                ? 'border-[#441c49] bg-[#f8f4f1]'
                                : 'border-gray-300'
                                }`}
                        >
                            <div className="flex flex-col items-center gap-3 text-center">
                                <input
                                    type="radio"
                                    name="shipping"
                                    checked={selected === method.code}
                                    onChange={() => handleChange(method.code)}
                                    className="w-4 h-4 accent-[#441c49]"
                                />

                                {icon}
                                <div onClick={() => handleChange(method.code)}>
                                    <p className="font-semibold text-[#441c49]">
                                        {method.title}
                                    </p>
                                    {method.code === INPOST_PARCEL_LOCKER && (
                                        <Paczkomaty point={point} onSetPoint={handlePointSet} />
                                    )}
                                </div>

                                <p className="text-md text-gray-600 font-bold">
                                    {method.price === 0 ? 'Bezpłatna' : `${method.price} zł`}
                                </p>
                                {lastUsed === method.code && selected === method.code && (
                                    <span className="text-[10px] uppercase tracking-wide text-gray-500">Ostatnio używane</span>
                                )}
                            </div>
                        </label>
                    )
                })}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}
