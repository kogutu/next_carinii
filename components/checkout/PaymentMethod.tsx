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
    devbackblik: (<svg width="47px " xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.64 64.18" > <linearGradient id="blik-a" x1="67.82" y1="63.051" x2="67.82" y2="1.128" gradientUnits="userSpaceOnUse"> <stop stopColor="#5a5a5a" offset="0" /> <stop stopColor="#484848" offset="0.146" /> <stop stopColor="#212121" offset="0.52" /> <stop stopColor="#080808" offset="0.817" /> <stop offset="1" /> </linearGradient> <linearGradient id="blik-o" x1="39.667" y1="19.898" x2="49.695" y2="9.87" gradientUnits="userSpaceOnUse"> <stop stopColor="#e52f08" offset="0" /> <stop stopColor="#e94f96" offset="1" /> </linearGradient> <filter id="blik-b" x="21.709" y="10.07" width="99.399" height="50.159" filterUnits="userSpaceOnUse"> <feOffset dx="2.379" dy="2.973" /> <feGaussianBlur result="blur" stdDeviation="0.743" /> <feFlood floodOpacity="0.949" /> <feComposite in2="blur" operator="in" result="result1" /> <feComposite in="SourceGraphic" in2="result1" /> </filter> <path fill="url(#blik-a)" d="M 127.725,0.827 H 7.915 A 7.083,7.083 0 0 0 0.828,7.906 v 48.368 a 7.082,7.082 0 0 0 7.087,7.078 h 119.81 a 7.082,7.082 0 0 0 7.086,-7.078 V 7.906 a 7.083,7.083 0 0 0 -7.086,-7.079 z" /> <path fill="url(#blik-o)" d="m 51.769,14.884 a 7.088,7.088 0 0 1 -7.088,7.088 7.088,7.088 0 0 1 -7.088,-7.088 7.088,7.088 0 0 1 7.088,-7.088 7.088,7.088 0 0 1 7.088,7.088 z" /> <path fill="#ffffff" filter="url(#blik-b)" d="m 106.28,55.03 h 10.206 L 104.224,39.193 115.343,25.585 h -9.257 L 95.167,39.278 v -29.2 H 87.242 V 55.03 h 7.925 L 95.161,39.316 Z M 72.294,25.58 h 7.923 V 55.025 H 72.294 Z M 57.34,10.069 h 7.923 V 55.025 H 57.34 Z M 36.741,25.286 a 14.968,14.968 0 0 0 -7.108,1.784 v -17 H 21.709 V 40.312 A 15.03,15.03 0 1 0 36.741,25.286 Z m 0,22.26 a 7.233,7.233 0 1 1 7.233,-7.234 7.231,7.231 0 0 1 -7.233,7.234 z" /> </svg>),
    carinii_sklep: (<svg width="24" height="24" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"> <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" /> <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.6 19.1 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.6 6.3 14.7z" /> <path fill="#FBBC04" d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.4 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.6 41.4 15.2 46 24 46z" /> <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.7 7.5l6.5 5.5C40.6 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" /> </svg>),
    banktransfer: <Building2 className="w-5 h-5 text-[#441c49]" />,
    cashondelivery: <Wallet className="w-5 h-5 text-[#441c49]" />,
    payu_account: (
        <svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 290 145" width="47px"><path fill="#A6C307" d="m267.9 30.2h-17.2c-1.9 0-3.4 1.5-3.4 3.4v2.4h1.2c7.8 0 10.7 1.3 10.7 8.4v10.1h8.7c1.9 0 3.4-1.5 3.4-3.4l0.1-17.5c0-1.8-1.6-3.4-3.4-3.4zm-94.1 27.1c-0.8-1-2.3-1.1-3.8-1.1h-1.1c-3.8 0-5.2 1.1-6.1 4.7l-10.4 43.4c-1.3 5.3-3.1 6.3-6.3 6.3-3.8 0-5.3-0.9-6.9-6.3l-11.8-43.4c-0.9-3.6-2.4-4.7-6.1-4.7h-1.1c-1.5 0-3 0.1-3.8 1.1-0.7 1-0.5 2.5-0.1 4l12 43.8c2.2 8.3 4.9 15.3 14.8 15.3 1.9 0 3.6-0.3 5-0.8-3 9.5-6.1 13.7-15.1 14.6-1.8 0.2-3 0.5-3.7 1.4-0.7 0.9-0.5 2.2-0.3 3.4l0.3 1.1c0.5 2.6 1.4 4.2 4.3 4.2q0.5 0 1 0c13.5-0.9 20.8-8.2 25-25.2l14.5-57.8c0.3-1.5 0.5-3-0.3-4zm-88.9-3c-7.4 0-12 1-13.7 1.3-3.1 0.7-4.4 1.5-4.4 5.1v1c0 1.3 0.2 2.3 0.6 3q0.8 1.2 2.5 1.2 0.8 0 1.9-0.3c1.8-0.5 7.4-1.4 13.6-1.4 11.2 0 15.7 3.1 15.7 10.7v6.7h-14c-18.1 0-26.5 6.1-26.5 19.2 0 12.6 8.7 19.6 24.4 19.6 18.8 0 27.1-6.4 27.1-20.6v-24.9c0-13.9-8.9-20.6-27.2-20.6zm16.2 36.3v8.8c0 7.1-2.7 11.2-16.2 11.2-8.9 0-13.3-3.2-13.3-9.8 0-7.3 4.4-10.2 15.6-10.2zm-68.2-54.6h-18.6c-10 0-14.4 4.4-14.4 14.4v63.9c0 3.8 1.2 5 5.1 5h1.2c3.9 0 5.1-1.2 5.1-5v-24.9h21.6c19.1 0 28-8.5 28-26.7 0-18.2-8.9-26.7-28-26.7zm16.6 26.7c0 10.4-2.6 16.1-16.6 16.1h-21.6v-26.9c0-3.7 1.4-5.1 5.1-5.1h16.5c10.5 0 16.6 2.6 16.6 15.9zm220-50.5h-8.7c-0.9 0-1.7-0.7-1.7-1.7v-8.8c0-0.9 0.8-1.7 1.7-1.7h8.7c1 0 1.7 0.8 1.7 1.7v8.8c0 1-0.7 1.7-1.7 1.7zm17.1 18h-12.8c-1.4 0-2.6-1.1-2.6-2.5l0.1-12.9c0-1.4 1.1-2.6 2.5-2.6h12.8c1.4 0 2.5 1.2 2.5 2.6v12.9c0 1.4-1.1 2.5-2.5 2.5zm-36 24.3c-1.9 0-3.4-1.6-3.4-3.4v-15.1h-1.2c-7.8 0-10.7 1.3-10.7 8.4v16.6q0 0 0 0.1v3.6q0 0.2 0 0.4v23.2c0 2.8-0.6 5-1.7 6.8-2.1 3.3-6.3 4.7-13 4.7-6.8 0-10.9-1.4-13.1-4.7-1.1-1.8-1.6-4-1.6-6.8v-23.2q0-0.2-0.1-0.4v-3.6q0-0.1 0-0.1v-16.6c0-7.1-2.9-8.4-10.6-8.4h-2.5c-7.8 0-10.6 1.3-10.6 8.4v43.9c0 7 1.5 13 4.6 17.8 6 9.3 17.5 14.3 33.8 14.3q0 0 0.1 0 0 0 0 0c16.4 0 27.9-5 33.8-14.3 3.1-4.8 4.7-10.8 4.7-17.8v-33.8z" /></svg>
    ),
    purchaseorder: <img className=" h-5" src=" https://paypo.pl/blog/wp-content/uploads/2021/08/logo_PayPo.svg" />,

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

    const handleChange = (method: any) => {
        setPayment(method.code)
        onMethodChange?.(method.code)
    }

    const defaultStatus: SectionStatus = {
        billing: 'incomplete',
        shipping: 'incomplete',
        shippingMethod: 'incomplete',
        paymentMethod: 'incomplete',
        terms: 'incomplete',
    }


    const filteredPaymentMethods = paymentMethods.filter(
        (method: any) => {
            const hasWildcard = method.shipping_methods[0] === '*';
            const hasShippingMethod = method.shipping_methods.includes(shippingMethod);

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

            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-4 gap-2">
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
                                onChange={() => handleChange(method)}
                                className="w-4 h-4 accent-[#441c49]"
                            />

                            {methodIcons[method.code] ?? <CreditCard className="w-5 h-5 text-[#441c49]" />}
                            <p className="font-semibold text-[#441c49]" data-method={method.code}>{method.title}</p>
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