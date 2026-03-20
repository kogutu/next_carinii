'use client'

import { useEffect, useMemo, useState } from 'react'
import { Truck, MapPin } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { SectionStatus } from '@/hooks/useCheckoutValidation'
import { useCartStore } from '@/stores/cartZustand'
import methods from '../../data/shipping_payment_methods.json'
import Paczkomaty from './shipping_method/paczkomaty'

interface ShippingMethodProps {
    onMethodChange?: (method: string) => void
    init?: string
    status?: SectionStatus
}

function calcShippingPrice(method: any, weight: number, cashOnDelivery: boolean): number {
    const calc = method.price_excl_tax

    if (calc === 'weight') {
        const w = method.weight
        if (weight <= 30) {
            return cashOnDelivery
                ? parseFloat(w['0-30'].z_pobraniem)
                : parseFloat(w['0-30'].bez_pobrania)
        } else if (weight <= 50) {
            return cashOnDelivery
                ? parseFloat(w['30-50'].z_pobraniem)
                : parseFloat(w['30-50'].bez_pobrania)
        } else if (weight <= 101) {
            return parseFloat(w['50-101'])
        } else if (weight <= 300) {
            return parseFloat(w['101-300'])
        } else if (weight > 300) {
            return parseFloat(w['301-500'])
        }
        console.log(weight)
        return 0
    }

    if (typeof calc === 'number') return calc

    return 0
}

const ICONS: Record<string, React.ReactNode> = {
    flatrate: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    dhl_dhl24pl_courier: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    flatrate48: <img className='h-12' alt="" src="/shipping_methods/dhl.jpg" />,
    inpostparcels: <img className='h-12' alt="" src="/shipping_methods/paczkomaty.jpg" />,
    flatrate5: <img className='h-12' alt="" src="/shipping_methods/inpost-kurier.jpg" />,
}

export default function ShippingMethod({ onMethodChange, init, status }: ShippingMethodProps) {
    const shippingMethods = methods.shipping_methods['PL']
    const [selected, setSelected] = useState(init ?? shippingMethods[0]?.code ?? '')
    const items = useCartStore(state => state.items)
    const updatePaymentMethod = useCartStore((state) => state.updatePaymentMethod)
    const setShippingTotal = useCartStore((state) => state.setShippingTotal)

    useEffect(() => {
        updatePaymentMethod(shippingMethods[0]?.code);
    }, [shippingMethods]);

    const cashOnDelivery = false

    const weight = useMemo(() => {
        return items.reduce((total: number, item: any) => {
            const itemWeight = item.weight < 50 && item.paleta ? 50 : item.weight
            return total + item.qty * itemWeight
        }, 0)
    }, [items])

    const shippingPrices = shippingMethods;
    console.log(shippingPrices);

    useEffect(() => {
        const selectedIndex = shippingMethods.findIndex(m => m.code === selected)
        const method = shippingPrices[selectedIndex] ?? 0
        console.clear();

        console.log(method.price);

        if ((method.price) > 0) {
            console.log(method.price);
            setShippingTotal(method.price)
        }
    }, [selected, shippingPrices, setShippingTotal, shippingMethods])

    const handleChange = (code: string) => {
        setSelected(code)
        onMethodChange?.(code)
        updatePaymentMethod(code);
    }

    return (
        <div className="space-y-4">
            <SectionHeader
                title="2. Sposób wysyłki"
                sectionKey="shippingMethod"
                status={status || {
                    billing: 'incomplete',
                    shipping: 'incomplete',
                    shippingMethod: 'incomplete',
                    paymentMethod: 'incomplete',
                    terms: 'incomplete',
                }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {shippingMethods.map((method, index) => {
                    const price = shippingPrices[index]['price']
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
                                    checked={selected === method.code}
                                    onChange={() => handleChange(method.code)}
                                    className="w-4 h-4 accent-[#441c49]"
                                />

                                {icon}
                                <div>
                                    <p className="font-semibold text-[#441c49]">
                                        {method.title}
                                    </p>
                                    {method.code == "inpostparcels" && (
                                        <Paczkomaty />
                                    )}
                                </div>

                                <p className="text-md text-gray-600 font-bold">
                                    {price === 0 ? 'Bezpłatna' : `${price} zł`}
                                </p>
                            </div>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}