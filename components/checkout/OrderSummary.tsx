'use client'

import { useCartStore } from '@/stores/cartZustand'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBasket, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCheckoutValidationStore } from './checkoutValidationStore'

// 'netto' = ceny w koszyku są netto (trzeba dodać VAT do brutto)
// 'brutto' = ceny w koszyku są brutto (trzeba odjąć VAT do netto)
type PriceType = 'netto' | 'brutto'

const VAT_RATE = 0.23

interface OrderSummaryProps {
    onTermsChange?: (agreed: boolean) => void
    isTermsAccepted?: boolean
    shippingTotal?: number
    checkoutData?: any
    onOrderSubmit?: () => void
    priceType?: PriceType
}

// Helpery do przeliczania cen
const toNetto = (price: number, type: PriceType): number =>
    type === 'brutto' ? price / (1 + VAT_RATE) : price

const toBrutto = (price: number, type: PriceType): number =>
    type === 'netto' ? price * (1 + VAT_RATE) : price

export default function OrderSummary({
    onTermsChange,
    isTermsAccepted,
    shippingTotal,
    checkoutData,
    onOrderSubmit,
    priceType = 'brutto',
}: OrderSummaryProps) {
    const router = useRouter()
    const items = useCartStore(state => state.items)
    const removeItem = useCartStore(state => state.removeItemCart)
    const updateQty = useCartStore(state => state.updateQty)
    const setZustandCoupon = useCartStore(state => state.setCoupon)
    const zshippingTotal = useCartStore(state => state.shippingTotal)
    const ZustandCouponData = useCartStore(state => state.setCouponData)
    const ZustandCoupon = useCartStore(state => state.coupon)
    const {
        errors,
        status,
        billingTouched,
        shippingTouched,

    } = useCheckoutValidationStore()

    const [couponCode, setCouponCode] = useState(ZustandCoupon || "")
    const [couponState, setCouponState] = useState(false)
    const [notes, setNotes] = useState('')
    const [agreeToTerms, setAgreeToTerms] = useState(isTermsAccepted || false)
    const [agreeToNewsletter, setAgreeToNewsletter] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isCouponLoading, setIsCouponLoading] = useState(false)
    const [totalErr, setTotalErr] = useState(false)


    useEffect(() => {
        let t = Object.values(errors).reduce((sum, sectionErrors) => {

            return sum + (Object.values(sectionErrors).length || 0)

        }, 0);
        setTotalErr(t > 0)
    }, [errors]);

    const handleTermsChange = (value: boolean) => {
        setAgreeToTerms(value)
        onTermsChange?.(value)
    }

    useEffect(() => {
        if (ZustandCoupon != "") {
            (async () => {
                await handleCoupon();
            })();
        }
    }, []);

    const handleCoupon = async () => {
        if (!couponCode.trim()) return

        setIsCouponLoading(true)
        try {
            console.log(items);
            var r: any = await fetch('/api/magento/discount', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oids: items.map(e => e.pid).join(","),
                    coupon: couponCode
                })
            })
            r = await r.json();
            console.log(r)
            if (r.success) {
                ZustandCouponData(r);
                setCouponState(true);
                setZustandCoupon(couponCode, r);
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

    // Przeliczenia cen
    const formatPLN = (value: number) =>
        value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })

    // Cena jednostkowa
    const itemNetto = (item: typeof items[0]) => toNetto(item.final_price, priceType)
    const itemBrutto = (item: typeof items[0]) => toBrutto(item.final_price, priceType)

    // Cena * ilość
    const itemTotalNetto = (item: typeof items[0]) => itemNetto(item) * item.qty
    const itemTotalBrutto = (item: typeof items[0]) => itemBrutto(item) * item.qty

    // Suma koszyka
    const sumRegularPrice = items.reduce((sum, item) => sum + item.price, 0);
    const sumDiscount = items.reduce((sum, item) => sum + (item.discount_value ?? 0), 0);
    const subtotalNetto = items.reduce((sum, item) => sum + itemTotalNetto(item), 0)
    const subtotalBrutto = items.reduce((sum, item) => sum + itemTotalBrutto(item), 0)

    // Wysyłka – zakładamy, że zshippingTotal jest zawsze brutto
    const shippingBrutto = zshippingTotal || 0
    const shippingNetto = shippingBrutto / (1 + VAT_RATE)

    // Grand total
    const grandTotalNetto = subtotalNetto + shippingNetto
    const grandTotalBrutto = subtotalBrutto + shippingBrutto

    const setGrandTotal = useCartStore((state) => state.setGrandTotal)

    const handleSubmitOrder = async () => {
        if (!checkoutData || !agreeToTerms) {
            setSubmitError('Brakuje danych lub nie zaakceptowałeś regulaminu')
            return
        }

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const orderData = {
                customer: {
                    firstName: checkoutData.billing.firstName,
                    lastName: checkoutData.billing.lastName,
                    email: checkoutData.billing.email,
                    phone: checkoutData.billing.phone,
                    type: checkoutData.billing.type,
                    nip: checkoutData.billing.nip,
                    companyName: checkoutData.billing.companyName
                },
                billingAddress: {
                    firstName: checkoutData.billing.firstName,
                    lastName: checkoutData.billing.lastName,
                    street: checkoutData.billing.street,
                    postcode: checkoutData.billing.postcode,
                    city: checkoutData.billing.city,
                    phone: checkoutData.billing.phone
                },
                shippingAddress: checkoutData.billing.sameAddress
                    ? {
                        firstName: checkoutData.billing.firstName,
                        lastName: checkoutData.billing.lastName,
                        street: checkoutData.billing.street,
                        postcode: checkoutData.billing.postcode,
                        city: checkoutData.billing.city,
                        phone: checkoutData.billing.phone
                    }
                    : checkoutData.shipping,
                shippingMethod: checkoutData.shippingMethod,
                paymentMethod: checkoutData.paymentMethod,
                items: items.map(item => ({
                    productId: item.pid,
                    variantId: item.variantId,
                    variant: item.variant,
                    sku: item.sku,
                    name: item.name,
                    priceNetto: itemNetto(item),
                    priceBrutto: itemBrutto(item),
                    quantity: item.qty
                })),
                priceType,
                couponCode,
                notes,
                agreeToNewsletter,
                subtotalNetto,
                subtotalBrutto,
                shippingNetto,
                shippingBrutto,
                grandTotalNetto,
                grandTotalBrutto
            }
            console.clear();

            console.log(orderData);

            const response = await fetch('/api/magento/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Błąd podczas wysyłania zamówienia')
            }

            const result = await response.json()
            console.log('[v0] Order submitted successfully:', result)

            onOrderSubmit?.()

            if (result.externalOrderId) {
                router.push(`/success/oid/${result.externalOrderId}`)
            }
        } catch (error) {
            console.error('[v0] Error submitting order:', error)
            setSubmitError(error instanceof Error ? error.message : 'Nieznany błąd')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            {/* Fullscreen Loader */}
            {isSubmitting && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md mx-4">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-gray-200 border-t-[#441c49] rounded-full animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-10 h-10 border-4 border-gray-200 border-b-[#441c49] rounded-full animate-spin animate-reverse"></div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-[#441c49]">
                                Przetwarzanie zamówienia
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Prosimy o cierpliwość. Trwa wysyłanie Twojego zamówienia...
                            </p>
                            <p className="text-xs text-gray-400">
                                Nie zamykaj okna przeglądarki
                            </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div className="h-full bg-[#441c49] rounded-full animate-progress"></div>
                        </div>
                    </div>
                </div>
            )}

            <div className="border border-hborder rounded-lg p-6 space-y-6 bg-white">
                <h2 className="text-xl font-bold text-[#441c49]">
                    Podsumowanie zamówienia
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 pb-4 border-b-2 border-hborder">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-3">
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-16 h-16 rounded object-contain border border-hborder"
                                />
                            )}
                            <div className="flex-1">
                                <p className="font-semibold text-sm text-[#441c49]">{item.name}</p>
                                <div className="text-xs text-gray-600 mb-2 flex gap-4 justify-between">
                                    <div className="flex gap-4">
                                        Cena : {formatPLN((item.price))}

                                        {(item.discount_value) && (
                                            <div>
                                                <span className='text-red-400'>Rabat:</span> - {formatPLN(item.discount_value)}
                                                <br />
                                            </div>

                                        )}
                                    </div>

                                    <button
                                        onClick={() => removeItem(item)}
                                        className=" hover:bg-red-50 rounded transition-colors text-red-500 hover:text-red-700"
                                        aria-label="Usuń produkt"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                {/* Quantity Selector */}
                                <div className="flex items-center gap-2 mb-2 justify-between">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => updateQty(item, item.qty - 1)}
                                            className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            aria-label="Zmniejsz ilość"
                                            disabled={item.qty <= 1}
                                        >
                                            <Minus className="w-3 h-3 text-gray-700" />
                                        </button>

                                        <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => updateQty(item, parseInt(e.target.value) || 1)}
                                            className="w-14 h-8 text-center border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#441c49] focus:border-transparent"
                                            aria-label="Ilość produktu"
                                        />

                                        <button
                                            onClick={() => updateQty(item, item.qty + 1)}
                                            className="p-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                                            aria-label="Zwiększ ilość"
                                        >
                                            <Plus className="w-3 h-3 text-gray-700" />
                                        </button>
                                    </div>


                                    <div className="font-medium text-sm">
                                        <span className='text-gray-400 '>Razem:</span>{' '}
                                        {formatPLN(itemTotalBrutto(item))}
                                    </div>
                                </div>


                            </div>
                        </div>
                    ))}
                </div>

                {/* Coupon Code */}
                {couponState ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-[#441c49]">
                                Kod kuponu
                            </label>
                            <button
                                onClick={() => {
                                    setCouponState(false);
                                    setCouponCode('');
                                    setZustandCoupon('', { success: false });
                                }}
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
                                onClick={() => {
                                    setCouponState(false);
                                    setCouponCode('');
                                    setZustandCoupon('', { success: false });
                                }}
                                className="text-red-500 hover:text-red-700 text-xl font-bold"
                                title="Usuń kod"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ) : (
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
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-[#441c49] hover:bg-[#3d1841] text-white'
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
                )}

                {/* Price Summary */}
                <div className="space-y-2 py-4 border-y-2 border-hborder">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Podsuma</span>
                        <span className="font-medium">
                            {formatPLN(sumRegularPrice)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-red-700">Rabat:</span>
                        <span className="font-medium">
                            - {formatPLN(sumDiscount)}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-700">Wysyłka:</span>
                        <span className="font-medium">
                            {formatPLN(shippingBrutto)} brutto
                        </span>
                    </div>


                    <div className="flex justify-between text-lg font-bold text-[#441c49] pt-2">
                        <span>Do zapłaty:</span>
                        <span>
                            {formatPLN(grandTotalBrutto)} brutto<br />
                            <div className="text-xs w-full text-gray-400 text-right"> {formatPLN(grandTotalNetto)} netto</div>
                        </span>
                    </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={() => handleTermsChange(!agreeToTerms)}
                            className="w-5 h-5 accent-[#441c49] mt-0.5 flex-shrink-0"
                        />
                        <span className={`text-xs ${!agreeToTerms ? 'text-red-500' : 'text-green-500'}`}>
                            <span className="font-semibold">*</span> Potwierdzam, że zapoznałem się i akceptuję regulamin sklepu internetowego i politykę prywatności.   Wyrażam zgodę na przesyłanie mi za pomocą środków komunikacji elektronicznej informacji handlowej przez lub na zlecenie Carinii, w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
                        </span>
                    </label>

                    {/* <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreeToNewsletter}
                            onChange={() => setAgreeToNewsletter(!agreeToNewsletter)}
                            className="w-5 h-5 accent-[#441c49] mt-0.5 flex-shrink-0"
                        />
                        <span className="text-xs text-gray-700">
                            Wyrażam zgodę na przesyłanie mi za pomocą środków komunikacji elektronicznej informacji handlowej przez lub na zlecenie Carinii, w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
                        </span>
                    </label> */}
                </div>

                {/* Error Message */}
                {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {submitError}
                    </div>
                )}

                {/* Submit Button */}
                <Button
                    onClick={handleSubmitOrder}
                    disabled={!agreeToTerms || isSubmitting || totalErr}
                    className={`w-full h-12 font-semibold text-white rounded-lg transition-all duration-300 ${agreeToTerms && !isSubmitting
                        ? 'bg-[#441c49] hover:bg-[#3d1841] hover:shadow-xl hover:shadow-purple-500/50 hover:-translate-y-0.5 cursor-pointer border-2 border-white/20'
                        : 'bg-gray-400 cursor-not-allowed'
                        }`}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Wysyłanie...
                        </>
                    ) : (
                        <>
                            <ShoppingBasket className="w-8 h-8 mr-2" />
                            Złóż zamówienie
                        </>
                    )}
                </Button>

                {/* Admin Info */}
                <div className="bg-white text-xs text-gray-400 space-y-2">
                    <p>
                        <span className="font-semibold">Ochrona danych:</span> Administratorem danych osobowych zbieranych za pośrednictwem sklepu internetowego jest Z.P.O. CARINII,ul. Warszawska 78,08-450 Łaskarzew.
                    </p>
                    <p>
                        Dane są lub mogą być przetwarzane w celach oraz na podstawach wskazanych szczegółowo w polityce prywatności (np. realizacja umowy, marketing bezpośredni).
                    </p>

                </div>
            </div>

            <style jsx>{`
                @keyframes progress {
                    0% { width: 0%; }
                    20% { width: 20%; }
                    40% { width: 40%; }
                    60% { width: 60%; }
                    80% { width: 80%; }
                    90% { width: 90%; }
                    95% { width: 95%; }
                    100% { width: 100%; }
                }
                .animate-progress {
                    animation: progress 2s ease-in-out infinite;
                }
                .animate-reverse {
                    animation-direction: reverse;
                }
            `}</style>
        </>
    )
}