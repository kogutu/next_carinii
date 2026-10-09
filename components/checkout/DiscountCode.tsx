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
                    <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                        Kod kuponu
                    </label>
                    <button
                        onClick={handleRemoveCoupon}
                        className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-destructive"
                    >
                        Usuń kod
                    </button>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-success-soft px-4 py-3 text-sm text-success">
                    <span className="flex items-center gap-2">
                        <span>✓</span>
                        <span>Kod {couponCode} został użyty</span>
                    </span>
                    <button
                        onClick={handleRemoveCoupon}
                        className="flex size-9 items-center justify-center rounded-lg text-xl font-bold text-success hover:bg-success/10"
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
            <label className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
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
                    className={`h-11 min-w-0 flex-1 rounded-xl border border-hborder/50 px-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-foreground ${isCouponLoading ? 'cursor-not-allowed bg-muted' : ''
                        }`}
                />
                <button
                    onClick={handleCoupon}
                    disabled={isCouponLoading || !couponCode.trim()}
                    className={`flex h-11 min-w-20 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors ${isCouponLoading || !couponCode.trim()
                        ? 'cursor-not-allowed bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground hover:bg-menuhover'
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