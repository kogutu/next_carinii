'use client'

import { EYEBROW } from '@/components/ui/surface'
import { useCartStore } from '@/stores/cartZustand'
import PayButton from '@/components/payments/PayButton'
import { useEffect, useRef, useState } from 'react'
import { Trash2, Plus, Minus, ShoppingBasket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DiscountCode from './DiscountCode'
import UndoRemoveBar from './UndoRemoveBar'
import type { CheckoutData } from '@/hooks/useCheckoutValidation'
import { countryIso } from '@/lib/countries'
import { resolveInvoiceBuyer } from '@/lib/invoice'
import { startRedirectPayment } from '@/lib/tpay/browser-api'
import ExpressWalletButtons, { type ExpressWallet } from './ExpressWalletButtons'

// 'netto' = ceny w koszyku są netto (trzeba dodać VAT do brutto)
// 'brutto' = ceny w koszyku są brutto (trzeba odjąć VAT do netto)
type PriceType = 'netto' | 'brutto'

const VAT_RATE = 0.23

interface OrderSummaryProps {
    checkoutData: CheckoutData
    onTermsChange: (agreed: boolean) => void
    // true, gdy formularz jest poprawny; w przeciwnym razie pokazuje błędy i przewija do pierwszego
    onValidate: () => boolean
    isTermsAccepted?: boolean
    termsError?: string
    priceType?: PriceType
}

// Helpery do przeliczania cen
const toNetto = (price: number, type: PriceType): number =>
    type === 'brutto' ? price / (1 + VAT_RATE) : price

const toBrutto = (price: number, type: PriceType): number =>
    type === 'netto' ? price * (1 + VAT_RATE) : price

export default function OrderSummary({
    checkoutData,
    onTermsChange,
    onValidate,
    isTermsAccepted,
    termsError,
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
    const clearCart = useCartStore(state => state.clearCart)

    const [couponCode, setCouponCode] = useState(ZustandCoupon || "")
    const [couponState, setCouponState] = useState(false)
    const [notes, setNotes] = useState('')
    const [noteOpen, setNoteOpen] = useState(false)
    const summaryRef = useRef<HTMLDivElement>(null)
    const [summaryVisible, setSummaryVisible] = useState(true)
    const [agreeToTerms, setAgreeToTerms] = useState(isTermsAccepted || false)
    const [agreeToNewsletter, setAgreeToNewsletter] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isCouponLoading, setIsCouponLoading] = useState(false)

    // Na telefonie podsumowanie jest na końcu strony — dopóki nie jest widoczne, pokazujemy dolny pasek z kwotą
    useEffect(() => {
        const element = summaryRef.current
        if (!element) return

        const observer = new IntersectionObserver(([entry]) => setSummaryVisible(entry.isIntersecting))
        observer.observe(element)
        return () => observer.disconnect()
    }, [])

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
            var r: any = await fetch('/api/magento/discount', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oids: items.map(e => e.pid).join(","),
                    coupon: couponCode
                })
            })
            r = await r.json();
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
    const sumRegularPrice = items.reduce((sum, item) => sum + item.price * item.qty, 0);
    const sumDiscount = items.reduce((sum, item) => sum + Math.max(0, item.price - item.final_price) * item.qty, 0);
    const subtotalNetto = items.reduce((sum, item) => sum + itemTotalNetto(item), 0)
    const subtotalBrutto = items.reduce((sum, item) => sum + itemTotalBrutto(item), 0)

    // Wysyłka – zakładamy, że zshippingTotal jest zawsze brutto
    const shippingBrutto = zshippingTotal || 0
    const shippingNetto = shippingBrutto / (1 + VAT_RATE)

    // Grand total
    const grandTotalNetto = subtotalNetto + shippingNetto
    const grandTotalBrutto = subtotalBrutto + shippingBrutto

    const setGrandTotal = useCartStore((state) => state.setGrandTotal)

    // wallet: szybka płatność z koszyka — zamówienie idzie z metodą „Płatność kartą”, a po jego utworzeniu
    // od razu przekierowujemy do Google Pay / Apple Pay w Tpay
    const handleSubmitOrder = async (wallet?: ExpressWallet) => {
        if (!onValidate()) return

        setIsSubmitting(true)
        setSubmitError(null)

        try {
            const { customer } = checkoutData
            const buyer = checkoutData.invoice ? resolveInvoiceBuyer(customer, checkoutData.invoice) : null

            const deliveryAddress = {
                firstName: customer.firstName,
                lastName: customer.lastName,
                street: customer.street,
                postcode: customer.postcode,
                city: customer.city,
                country: countryIso(customer.country),
                phone: customer.phone
            }
            // Faktura: adres rozliczeniowy to nabywca (firma z GUS albo — bez NIP — osoba prywatna),
            // dostawa zostaje na adres osoby
            const billingAddress = buyer
                ? {
                    ...deliveryAddress,
                    company: buyer.companyName,
                    vatId: buyer.nip || undefined,
                    street: buyer.street,
                    postcode: buyer.postcode,
                    city: buyer.city,
                    country: buyer.country
                }
                : deliveryAddress

            const orderData = {
                customer: {
                    firstName: customer.firstName,
                    lastName: customer.lastName,
                    email: customer.email,
                    phone: customer.phone,
                    phoneCode: customer.phoneCode,
                    type: buyer?.nip ? 'company' : 'private',
                    nip: buyer?.nip || undefined,
                    companyName: buyer?.companyName
                },
                documentType: buyer ? 'invoice' : 'receipt',
                invoice: buyer,
                billingAddress,
                shippingAddress: deliveryAddress,
                shippingMethod: checkoutData.shippingMethod,
                paymentMethod: wallet ? 'tpay_card' : checkoutData.paymentMethod,
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
                Inpost: checkoutData.inpost,
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
            if (!result.success) {
                let errMsg = result.message;
                if (result.errItemId > 0) {
                    let errIts: any = items.filter(e => {
                        if (e.variantId == result.errItemId)
                            return e;
                        return false;

                    });
                    let errIt = errIts[0];

                    errMsg = errMsg + `: 
                    ` + errIt.name;
                    if (errIt.variant) errMsg = errMsg + " roz." + errIt.variant.size
                }
                throw new Error(errMsg || 'Błąd podczas wysyłania zamówienia')
            }

            if (result.externalOrderId) {
                const orderNumber = String(result.externalOrderId)

                if (wallet) {
                    try {
                        const { redirectUrl } = await startRedirectPayment(orderNumber, wallet)
                        if (redirectUrl) {
                            clearCart()
                            window.location.href = redirectUrl
                            return
                        }
                    } catch (paymentError) {
                        // zamówienie już istnieje — klient zapłaci na jego stronie
                        console.error('[tpay] express payment failed:', paymentError)
                    }
                }

                router.push(`/success/oid/${orderNumber}`)
                clearCart()
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
                    <div className="mx-4 flex max-w-md flex-col items-center gap-4 rounded-2xl bg-card p-8 shadow-2xl">
                        <div className="relative">
                            <div className="size-20 animate-spin rounded-full border-4 border-border border-t-foreground motion-reduce:animate-none"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="size-10 animate-spin rounded-full border-4 border-border border-b-foreground animate-reverse motion-reduce:animate-none"></div>
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-semibold text-foreground">
                                Przetwarzanie zamówienia
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Prosimy o cierpliwość. Trwa wysyłanie Twojego zamówienia...
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Nie zamykaj okna przeglądarki
                            </p>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full animate-progress rounded-full bg-foreground"></div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={summaryRef} id="order-summary" className="surface-card scroll-mt-4 space-y-6 rounded-2xl bg-card p-5 sm:p-6">
                <h2 className={EYEBROW}>
                    Podsumowanie zamówienia
                </h2>

                <UndoRemoveBar />

                {/* Cart Items */}
                <div className="space-y-5 border-b border-border pb-5">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-3">
                            {item.image && (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-24 w-20 shrink-0 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10"
                                />
                            )}
                            <div className="flex-1">
                                <p className="text-balance text-sm font-medium text-foreground">{item.name.split("CARINII--")[0]}</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">{item.sku}</p>
                                {item.variant.size && (
                                    <div className="mb-2 mt-1 flex justify-between gap-4 text-xs text-muted-foreground">
                                        Rozmiar : {item.variant.size}

                                    </div>
                                )}
                                <div className="mb-2 flex items-center justify-between gap-4 text-xs tabular-nums text-muted-foreground">

                                    <div className="flex gap-4">
                                        Cena : {formatPLN((item.price))}

                                        {(item.discount_value) && (
                                            <div>
                                                <span className='text-destructive'>Rabat:</span> - {formatPLN(item.discount_value)}
                                                <br />
                                            </div>

                                        )}
                                    </div>

                                    <button
                                        onClick={() => removeItem(item)}
                                        className="-my-2 -mr-2 flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
                                            className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:active:scale-100"
                                            aria-label="Zmniejsz ilość"
                                            disabled={item.qty <= 1}
                                        >
                                            <Minus className="size-3.5 text-foreground" aria-hidden="true" />
                                        </button>

                                        <input
                                            type="number"
                                            min="1"
                                            value={item.qty}
                                            onChange={(e) => updateQty(item, parseInt(e.target.value) || 1)}
                                            className="h-9 w-14 rounded-lg border border-hborder/50 text-center text-sm tabular-nums focus:border-transparent focus:outline-none focus:ring-2 focus:ring-foreground"
                                            aria-label="Ilość produktu"
                                        />

                                        <button
                                            onClick={() => updateQty(item, item.qty + 1)}
                                            className="flex size-9 items-center justify-center rounded-lg bg-muted transition-colors hover:bg-muted/70 active:scale-97 motion-reduce:active:scale-100"
                                            aria-label="Zwiększ ilość"
                                        >
                                            <Plus className="size-3.5 text-foreground" aria-hidden="true" />
                                        </button>
                                    </div>


                                    <div className="text-sm font-semibold tabular-nums text-foreground">
                                        <span className='font-normal text-muted-foreground'>Razem:</span>{' '}
                                        {formatPLN(itemTotalBrutto(item))}
                                    </div>
                                </div>


                            </div>
                        </div>
                    ))}
                </div>

                {/* Coupon Code */}
                <DiscountCode />

                {/* Price Summary */}
                <div className="space-y-3 border-b border-border pb-5 tabular-nums">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Produkty</span>
                        <span className="font-medium text-foreground">
                            {formatPLN(sumRegularPrice)}
                        </span>
                    </div>
                    {sumDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-success">Rabat:</span>
                            <span className="font-medium text-success">
                                - {formatPLN(sumDiscount)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Wysyłka:</span>
                        <span className="font-medium text-foreground">
                            {formatPLN(shippingBrutto)}
                        </span>
                    </div>


                    <div className="flex items-baseline justify-between gap-4 border-t border-border pt-4">
                        <span className="text-base font-semibold text-foreground">Do zapłaty:</span>
                        <span className="text-right">
                            <span className="block text-2xl font-semibold tracking-tight text-foreground">{formatPLN(grandTotalBrutto)}</span>
                            <span className="block text-xs text-muted-foreground">brutto, {formatPLN(grandTotalNetto)} netto</span>
                        </span>
                    </div>
                </div>

                {/* Komentarz do zamówienia */}
                <div>
                    {noteOpen ? (
                        <label className="block">
                            <span className="text-xs text-muted-foreground">Komentarz do zamówienia (opcjonalnie)</span>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                maxLength={500}
                                rows={3}
                                placeholder="np. uwagi dla kuriera, preferowane godziny dostawy"
                                className="mt-1 w-full rounded-xl border border-hborder/50 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-foreground"
                            />
                        </label>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setNoteOpen(true)}
                            className="inline-flex min-h-11 items-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                        >
                            Dodaj komentarz do zamówienia
                        </button>
                    )}
                </div>

                {/* Checkboxes */}
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            id="checkout-terms"
                            type="checkbox"
                            checked={agreeToTerms}
                            onChange={() => handleTermsChange(!agreeToTerms)}
                            aria-invalid={!!termsError}
                            className="mt-0.5 size-5 shrink-0 accent-black"
                        />
                        <span className={`text-pretty text-xs ${termsError ? 'text-destructive' : agreeToTerms ? 'text-success' : 'text-muted-foreground'}`}>
                            <span className="font-semibold">*</span> Potwierdzam, że zapoznałem się i akceptuję regulamin sklepu internetowego i politykę prywatności.   Wyrażam zgodę na przesyłanie mi za pomocą środków komunikacji elektronicznej informacji handlowej przez lub na zlecenie Carinii, w rozumieniu ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
                        </span>
                    </label>
                    {termsError && <p role="alert" className="text-xs text-destructive">{termsError}</p>}

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
                    <div role="alert" className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                        {submitError}
                    </div>
                )}

                {/* Submit Button */}
                <PayButton
                    align="center"
                    isLoading={isSubmitting}
                    loadingLabel="Wysyłanie…"
                    onClick={() => handleSubmitOrder()}
                    className="h-12 text-base"
                >
                    <ShoppingBasket className="size-5" aria-hidden="true" />
                    Złóż zamówienie
                </PayButton>

                <ExpressWalletButtons
                    shippingMethod={checkoutData.shippingMethod}
                    isBusy={isSubmitting}
                    onPay={handleSubmitOrder}
                />

                {/* Admin Info */}
                <div className="space-y-2 text-xs text-muted-foreground">
                    <p>
                        <span className="font-semibold">Ochrona danych:</span> Administratorem danych osobowych zbieranych za pośrednictwem sklepu internetowego jest Z.P.O. CARINII,ul. Warszawska 78,08-450 Łaskarzew.
                    </p>
                    <p>
                        Dane są lub mogą być przetwarzane w celach oraz na podstawach wskazanych szczegółowo w polityce prywatności (np. realizacja umowy, marketing bezpośredni).
                    </p>

                </div>
            </div>

            {!summaryVisible && (
                <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 bg-background px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] lg:hidden">
                    <div className="leading-tight">
                        <p className="text-xs text-muted-foreground">Do zapłaty</p>
                        <p className="text-lg font-semibold tabular-nums text-foreground">{formatPLN(grandTotalBrutto)}</p>
                    </div>
                    <PayButton
                        align="center"
                        className="w-auto px-6"
                        onClick={() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                        Do podsumowania
                    </PayButton>
                </div>
            )}

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