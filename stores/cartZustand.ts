'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import methods from '../data/shipping_payment_methods.json'


export type CartItem = {
    pid: string
    variantId: number
    variant: any;
    qty: number
    attrs: Record<string, string>
    name: string
    image: string
    price: number
    final_price: number
    weight?: string
    paleta?: boolean
    sku: string
}

type CartStore = {
    items: CartItem[]
    isHydrated: boolean
    showMiniCart: boolean
    paymentMethods: any[]
    grandTotal: number
    shippingTotal: number
    coupon: string,
    couponData: any,
    couponState: boolean,
    addItemToCart: (item: CartItem) => void
    removeItemCart: (id: string) => void
    setShowMiniCart: (state: boolean) => void
    setCoupon: (state: string, data: any) => void
    clearCart: () => void
    setHydratedCart: (state: boolean) => void
    updateQty: (id: string, qty: number) => void
    updatePaymentMethod: (ship_method: string) => void
    setShippingTotal: (state: number) => void
    setGrandTotal: (state: number) => void
    setCouponData: (state: any) => void

}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            isHydrated: false,
            showMiniCart: false,
            grandTotal: 0,
            couponData: {},
            coupon: "",
            couponState: false,
            shippingTotal: 0,
            paymentMethods: methods.payment_methods,
            setShippingTotal: (state) => set({ shippingTotal: state }),
            setGrandTotal: (state) => set({ grandTotal: state }),
            setShowMiniCart: (state) => set({ showMiniCart: state }),

            setHydratedCart: (state) => set({ isHydrated: state }),
            setCouponData: (state) => set({ couponData: state }),
            setCoupon: (code, data) => {
                if (!data?.success) {


                    const updatedItems = get().items.map(item => {


                        return { ...item, final_price: item.price }


                    })

                    set({ coupon: '', couponState: false, items: updatedItems })


                    return
                }

                const updatedItems = get().items.map(item => {
                    const match = data.products.find(
                        (p: any) => p.product_id.toString() === item.pid || p.sku === item.sku
                    )
                    if (match && match.eligible) {
                        return { ...item, final_price: match.final_price, discont_percent: match, discount_value: match.discount_value }
                    }
                    console.log(item);
                    return item
                })

                set({ coupon: code, couponState: true, items: updatedItems })
            },
            addItemToCart: (item) => {
                const existing = get().items.find(i => i.pid === item.pid)

                if (existing) {
                    set({
                        items: get().items.map(i =>
                            i.pid === item.pid
                                ? { ...i, qty: i.qty + item.qty }
                                : i
                        )
                    })
                } else {
                    set({ items: [...get().items, item] })
                }
            },

            removeItemCart: (pr: any) => {
                set({ items: get().items.filter(i => i.pid !== pr.pid) })
            },
            updateQty: (pr: any, qty: number) => {
                set({
                    items: get().items.map(i =>
                        i.pid === pr.pid ? { ...i, qty } : i
                    )
                })
            },
            updatePaymentMethod: (shipping_method: string) => {

                set({ paymentMethods: get().paymentMethods.map(i => i.code === shipping_method ? { ...i, selected: true } : { ...i, selected: false }) })
            },
            clearCart: () => set({ items: [] })
        }),
        {
            //change this name to refresh cart!!
            name: 'carinii-cstorege',
            storage: createJSONStorage(() =>
                typeof window !== 'undefined'
                    ? localStorage
                    : {
                        getItem: () => null,
                        setItem: () => { },
                        removeItem: () => { }
                    }
            ),
            onRehydrateStorage: () => (state) => {
                state?.setHydratedCart(true)
            }
        }
    )
)
