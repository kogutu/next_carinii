'use client'

import { useState } from 'react'
import { Banknote, CreditCard, Building2, Wallet } from 'lucide-react'
import SectionHeader from './SectionHeader'
import { SectionStatus } from '@/lib/hooks/use-checkout-validation'
import { useCartStore } from '@/stores/cartZustand'



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

interface PaymentMethodProps {
    onMethodChange?: (method: string) => void
    shippingMethod: string
    init?: string
    status?: SectionStatus
}

export default function PaymentMethod({ onMethodChange, shippingMethod, init, status }: PaymentMethodProps) {
    const methods = useCartStore((state) => state.paymentMethods)
    const updatePaymentMethod = useCartStore((state) => state.updatePaymentMethod)
    const paymentMethods: any = useCartStore((state) => state.paymentMethods);



    const [payment, setPayment] = useState(init ?? paymentMethods[0]?.code ?? '')

    const handleChange = (code: string) => {
        setPayment(code)
        onMethodChange?.(code)
    }

    const defaultStatus: SectionStatus = {
        billing: 'incomplete',
        shipping: 'incomplete',
        shippingMethod: 'incomplete',
        paymentMethod: 'incomplete',
        terms: 'incomplete',
    }
    console.clear();

    console.log(paymentMethods);

    const filteredPaymentMethods = paymentMethods.filter(
        (method: any) => {
            const hasWildcard = method.shipping_methods[0] === '*';
            const hasShippingMethod = method.shipping_methods.includes(shippingMethod);
            console.log(method);

            const isExcluded = method.exclude_hipping_methods.includes(shippingMethod);

            return (hasWildcard || hasShippingMethod) && !isExcluded;
        }
    );

    const selected = filteredPaymentMethods.find(m => m.code === payment);
    return (
        <div className="space-y-4">
            <SectionHeader
                title="3. Metoda płatności"
                sectionKey="paymentMethod"
                status={status || defaultStatus}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {filteredPaymentMethods.map((method) => (
                    <label
                        key={method.code}
                        className={`block border-2 p-4 rounded-lg cursor-pointer transition-colors ${payment === method.code
                            ? 'border-[#441c49] bg-[#f8f4f1]'
                            : 'border-gray-200 hover:border-[#441c49] hover:bg-[#f8f4f1]'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3 text-center">

                            <input
                                type="radio"
                                name="payment"
                                checked={payment === method.code}
                                onChange={() => handleChange(method.code)}
                                className="w-4 h-4 accent-[#441c49]"
                            />
                            {methodIcons[method.code] ?? <CreditCard className="w-5 h-5 text-[#441c49]" />}
                            <p className="font-semibold text-[#441c49]">{method.title}</p>
                            {selected?.description && selected.code === method.code && (
                                <div className="text-sm text-gray-600 whitespace-pre-line px-1 mt-2">
                                    {selected.description}
                                </div>
                            )}
                        </div>
                    </label>
                ))}
            </div>
        </div>
    )
}