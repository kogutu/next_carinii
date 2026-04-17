'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartZustand'
var userCoupon = 0;
export default function DiscountCode() {
    const items = useCartStore(state => state.items)
    const setProductCoupon = useCartStore(state => state.setProductCoupon)
    const setZustandCoupon = useCartStore(state => state.setCoupon)
    const ZustandCouponData = useCartStore(state => state.setCouponData)
    const ZustandCoupon = useCartStore(state => state.coupon)

    const [couponCode, setCouponCode] = useState(ZustandCoupon || '')
    const [couponState, setCouponState] = useState(false)
    const [isCouponLoading, setIsCouponLoading] = useState(false)

    useEffect(() => {

        if (ZustandCoupon !== '') {
            setCouponCode(ZustandCoupon)
            setCouponState(true)
            console.log(userCoupon);
            console.log("userCoupon", userCoupon)
            if (items.length != userCoupon)
                getDisc().then(e => {
                    setProductCoupon(e)
                    userCoupon = items.length
                });

        }
    })

    const getDisc = async () => {
        const res = await fetch('/api/magento/discount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                oids: items.map(e => e.pid).join(','),
                coupon: couponCode,
            }),
        })
        return await res.json()
    }

    const handleCoupon = async () => {
        if (!couponCode.trim()) return

        console.log(couponCode);


        setIsCouponLoading(true)
        try {
            const res = await fetch('/api/magento/discount', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oids: items.map(e => e.pid).join(','),
                    coupon: couponCode,
                }),
            })
            const r = await res.json()

            if (r.success) {
                ZustandCouponData(r)
                setCouponState(true)
                setZustandCoupon(couponCode, r)
                return;
            } else {
                alert('Nieprawidłowy kod kuponu')
            }
        } catch (error) {
            console.error('Błąd podczas weryfikacji kuponu:', error)
            alert('Wystąpił błąd podczas weryfikacji kodu')
        } finally {
            setIsCouponLoading(false)
        }
    }

    const handleRemoveCoupon = () => {
        setCouponState(false)
        setCouponCode('')
        setZustandCoupon('', { success: false })
    }

    if (couponState) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-[#441c49]">
                        Kod kuponu
                    </label>
                    <button
                        onClick={handleRemoveCoupon}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                        Usuń kod
                    </button>
                </div>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span>✓</span>
                        <span>Kod {couponCode} został użyty</span>
                    </span>
                    <button
                        onClick={handleRemoveCoupon}
                        className="text-red-500 hover:text-red-700 text-xl font-bold"
                        title="Usuń kod"
                    >
                        ×
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-[#441c49]">
                Kod kuponu
            </label>
            <div className="flex gap-2">
                <input
                    type="text"
                    name="coupon_code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="Wpisz kod kuponu"
                    disabled={isCouponLoading}
                    className={`flex-1 border border-hborder p-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#441c49] ${isCouponLoading ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                />
                <button
                    onClick={handleCoupon}
                    disabled={isCouponLoading || !couponCode.trim()}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center min-w-[80px] ${isCouponLoading || !couponCode.trim()
                        ? 'bg-gray-200 cursor-not-allowed'
                        : 'bg-sgreen hover:bg-sgreen/80 cursor-pointer text-white'
                        }`}
                >
                    {isCouponLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-1" />
                            <span>...</span>
                        </>
                    ) : (
                        'Użyj'
                    )}
                </button>
            </div>
        </div>
    )
}