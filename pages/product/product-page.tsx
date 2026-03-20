'use client'

import React, { useState, useEffect, useMemo } from "react"
import DOMPurify from 'isomorphic-dompurify';
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Minus, Plus, ShoppingCart, HelpCircle, DollarSign, X, ChevronLeft, ChevronRight, User, Briefcase, Mail, Phone, Heart } from 'lucide-react'
import ManagerSection from "./manager_section"
import TabList from "./TabList";
import { useCartStore } from "@/stores/cartZustand";
import ProductCarousel from "@/components/product/ProductsCarusel";
import ProductsCarousel from "@/components/hert/products-carousel";
import ProductsCarouselTypesense from "@/components/hert/products-carousel-typesense";
import { createSlug } from "@/utils/slugify";
import Link from "next/link";
import ProductGallery from "./image-gallery";
import { getLogo } from "@/data/brand/getBrand";
import ShareIt from "./shareIt";
import PromoBadge from "./promo-badge";
import SizeSwatch from "./SizeSwatch";
import ReletaedProducts from "./related-products";
import ProductsCarouselProducts from "@/components/hert/products-carouse-products";
import _ from "lodash";

interface ConfigurableAttribute {
    id: string
    code: string
    label: string
    options: Array<{
        id: string
        label: string
        value: string
    }>
    position: string
}

interface ConfigurableProduct {
    id: string
    price: number
    final_price: number
    sku: string
    is_in_stock: null | boolean
    qty: number
}

interface ConfigurableOptions {
    attributes: Record<string, ConfigurableAttribute>
    combinations: Record<string, string>
    products: Record<string, ConfigurableProduct>
}

interface Attachment {
    id: string | number
    url: string
    filename: string
}

interface RelatedProduct {
    id: string
    name: string
    price: number
    final_price: number
    image_main?: string
    slug: string
}

interface Product {
    id: string
    pid: string
    hidePrice: boolean
    name: string
    sku: string
    price: number
    short_description: string
    final_price_netto_pln: number
    image_medium: string
    image_main?: string
    description: string
    dim_width: string
    dim_height: string
    attachments_tab: Attachment[]
    url: string
    manufacturer: string
    slug: string
    dim_length: string
    size_qty?: string[],
    childProducts?: any[],
    weight?: string
    Paleta?: boolean
    'Czas realizacji'?: string
    'Grupa klientów 1'?: string
    configurable_options?: ConfigurableOptions
    is_configurable: boolean
    width: number
    hide_price: boolean
    type_id: string
    paleta: boolean
    imgs?: Array<{ src: string; alt: string }>
    cids?: string[]
    final_price?: number
    h_palette?: any
    kolor?: string
    cholewka?: string
    wnętrze?: string
    wkładka?: string
    'materiał obcasa'?: string
    'wysokość obcasa'?: string
    'rodzaj podeszwy'?: string
    'podeszwa materiał'?: string
    'wysokość całkowita buta'?: string
    tęgość?: string
    typ?: string
    model?: string
    has_special_price?: boolean
    save_percent?: number
    omnibus?: number
    rel?: RelatedProduct[]
}

interface FormData {
    name: string
    company: string
    nip: string
    phone_mobile: string
    phone_stationary: string
    email: string
    message: string
}

interface Variant {
    size: string
    qty: number
    [key: string]: any
}

interface PriceInfo {
    price: number
    final_price: number
    sku: string
    variantId?: string
}

interface NbpApiResponse {
    rates: Array<{
        mid: number
        effectiveDate: string
    }>
}

const INITIAL_FORM: FormData = {
    name: '',
    company: '',
    nip: '',
    phone_mobile: '',
    phone_stationary: '',
    email: '',
    message: '',
}

const PRIMARY_COLOR = '#431c49'
const ACCENT_COLOR = '#e2b87f'

export default function ProductPage({ product, seemore }: { product: Product, seemore: Product[] }) {

    // === ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURN ===

    const addItemToCart = useCartStore(state => state.addItemToCart)
    const setShowMiniCart = useCartStore(state => state.setShowMiniCart)
    const items = useCartStore(state => state.items)

    const [quantity, setQuantity] = useState<number>(1)
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({})
    const [currentProduct, setCurrentProduct] = useState<ConfigurableProduct | null>(null)
    const [variant, setVariant] = useState<Variant>({} as Variant)
    // Zabezpieczenie przed undefined - jeśli product nie istnieje, używamy pustej tablicy
    const [hasVariant] = useState<boolean>(() =>
        !_.isEmpty(product?.size_qty) ? true : false
    )
    const [errorVariant, setErorrVariant] = useState<boolean>(false)
    const [inquiryForm, setInquiryForm] = useState<FormData>(INITIAL_FORM)
    const [priceForm, setPriceForm] = useState<FormData>(INITIAL_FORM)
    const [submittedInquiry, setSubmittedInquiry] = useState<boolean>(false)
    const [submittedPrice, setSubmittedPrice] = useState<boolean>(false)
    const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false)
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0)
    const [isInquiryOpen, setIsInquiryOpen] = useState<boolean>(false)
    const [isPriceOpen, setIsPriceOpen] = useState<boolean>(false)

    // EUR exchange rate state
    const [eurRate, setEurRate] = useState<number | null>(null)
    const [eurRateLoading, setEurRateLoading] = useState<boolean>(true)
    const [eurRateError, setEurRateError] = useState<string | null>(null)
    const [eurRateDate, setEurRateDate] = useState<string | null>(null)

    // Fetch EUR exchange rate from NBP API
    useEffect(() => {
        const fetchEurRate = async (): Promise<void> => {
            try {
                setEurRateLoading(true)
                setEurRateError(null)

                const response = await fetch('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json')

                if (!response.ok) {
                    throw new Error('Nie udało się pobrać kursu EUR')
                }

                const data: NbpApiResponse = await response.json()
                const rate = data.rates[0].mid
                setEurRate(rate + 0.17)
                setEurRateDate(data.rates[0].effectiveDate);
            } catch (error) {
                console.error('Error fetching EUR rate:', error)
                setEurRateError('Błąd pobierania kursu')
                // Fallback rate in case of error
                setEurRate(4.30) // approximate fallback
            } finally {
                setEurRateLoading(false)
            }
        }

        fetchEurRate()
    }, [])

    // Badge i "by" - useMemo PRZED conditional return
    const { badge, by } = useMemo((): { badge: string; by: string } => {
        if (!product) return { badge: "", by: "" }
        console.log(product);

        let badge = "SERIA";
        let by = "";

        if (product.cids?.includes("190")) {
            badge = "Nowość";
        }

        if (product.cids?.includes("200")) {
            by = "by MAGDALENA PIECZONKA";
        } else if (product.cids?.includes("137")) {
            by = "by NATALIA SIWIEC";
        }

        if (product.final_price !== product.price && !badge) {
            badge = "OKAZJA";
        }

        return { badge, by };
    }, [product?.cids, product?.final_price, product?.price])

    // Sanitized HTML - useMemo for stability
    const cleanHTML = useMemo((): string => {
        if (!product?.description) return ""
        return DOMPurify.sanitize(product.description).replace(/\r\n/g, '<br />');
    }, [product?.description])

    const short_cleanHTML = useMemo((): string => {
        if (!product?.short_description) return ""
        return DOMPurify.sanitize(product.short_description).replace(/\r\n/g, '<br />');
    }, [product?.short_description])

    // Attachments HTML - useMemo for stability
    const attachs_html = useMemo((): string => {
        if (!product?.attachments_tab) return ""
        let html = ""
        product.attachments_tab.forEach((attach: Attachment) => {
            html += `<div key="${attach.id}"  >
            <a href="${attach.url}"  class="flex gap-2 mb-2 block" target="_blank" rel="noopener noreferrer">
<svg width="24px" height="24px" viewBox="-4 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M25.6686 26.0962C25.1812 26.2401 24.4656 26.2563 23.6984 26.145C22.875 26.0256 22.0351 25.7739 21.2096 25.403C22.6817 25.1888 23.8237 25.2548 24.8005 25.6009C25.0319 25.6829 25.412 25.9021 25.6686 26.0962ZM17.4552 24.7459C17.3953 24.7622 17.3363 24.7776 17.2776 24.7939C16.8815 24.9017 16.4961 25.0069 16.1247 25.1005L15.6239 25.2275C14.6165 25.4824 13.5865 25.7428 12.5692 26.0529C12.9558 25.1206 13.315 24.178 13.6667 23.2564C13.9271 22.5742 14.193 21.8773 14.468 21.1894C14.6075 21.4198 14.7531 21.6503 14.9046 21.8814C15.5948 22.9326 16.4624 23.9045 17.4552 24.7459ZM14.8927 14.2326C14.958 15.383 14.7098 16.4897 14.3457 17.5514C13.8972 16.2386 13.6882 14.7889 14.2489 13.6185C14.3927 13.3185 14.5105 13.1581 14.5869 13.0744C14.7049 13.2566 14.8601 13.6642 14.8927 14.2326ZM9.63347 28.8054C9.38148 29.2562 9.12426 29.6782 8.86063 30.0767C8.22442 31.0355 7.18393 32.0621 6.64941 32.0621C6.59681 32.0621 6.53316 32.0536 6.44015 31.9554C6.38028 31.8926 6.37069 31.8476 6.37359 31.7862C6.39161 31.4337 6.85867 30.8059 7.53527 30.2238C8.14939 29.6957 8.84352 29.2262 9.63347 28.8054ZM27.3706 26.1461C27.2889 24.9719 25.3123 24.2186 25.2928 24.2116C24.5287 23.9407 23.6986 23.8091 22.7552 23.8091C21.7453 23.8091 20.6565 23.9552 19.2582 24.2819C18.014 23.3999 16.9392 22.2957 16.1362 21.0733C15.7816 20.5332 15.4628 19.9941 15.1849 19.4675C15.8633 17.8454 16.4742 16.1013 16.3632 14.1479C16.2737 12.5816 15.5674 11.5295 14.6069 11.5295C13.948 11.5295 13.3807 12.0175 12.9194 12.9813C12.0965 14.6987 12.3128 16.8962 13.562 19.5184C13.1121 20.5751 12.6941 21.6706 12.2895 22.7311C11.7861 24.0498 11.2674 25.4103 10.6828 26.7045C9.04334 27.3532 7.69648 28.1399 6.57402 29.1057C5.8387 29.7373 4.95223 30.7028 4.90163 31.7107C4.87693 32.1854 5.03969 32.6207 5.37044 32.9695C5.72183 33.3398 6.16329 33.5348 6.6487 33.5354C8.25189 33.5354 9.79489 31.3327 10.0876 30.8909C10.6767 30.0029 11.2281 29.0124 11.7684 27.8699C13.1292 27.3781 14.5794 27.011 15.985 26.6562L16.4884 26.5283C16.8668 26.4321 17.2601 26.3257 17.6635 26.2153C18.0904 26.0999 18.5296 25.9802 18.976 25.8665C20.4193 26.7844 21.9714 27.3831 23.4851 27.6028C24.7601 27.7883 25.8924 27.6807 26.6589 27.2811C27.3486 26.9219 27.3866 26.3676 27.3706 26.1461ZM30.4755 36.2428C30.4755 38.3932 28.5802 38.5258 28.1978 38.5301H3.74486C1.60224 38.5301 1.47322 36.6218 1.46913 36.2428L1.46884 3.75642C1.46884 1.6039 3.36763 1.4734 3.74457 1.46908H20.263L20.2718 1.4778V7.92396C20.2718 9.21763 21.0539 11.6669 24.0158 11.6669H30.4203L30.4753 11.7218L30.4755 36.2428ZM28.9572 10.1976H24.0169C21.8749 10.1976 21.7453 8.29969 21.7424 7.92417V2.95307L28.9572 10.1976ZM31.9447 36.2428V11.1157L21.7424 0.871022V0.823357H21.6936L20.8742 0H3.74491C2.44954 0 0 0.785336 0 3.75711V36.2435C0 37.5427 0.782956 40 3.74491 40H28.2001C29.4952 39.9997 31.9447 39.2143 31.9447 36.2428Z" fill="#EB5757"></path> </g></svg>
                ${attach.filename}
            </a>
        </div>`;
        });
        return html
    }, [product?.attachments_tab])

    // Zabezpieczenie przed undefined dla productSpecs
    const productSpecsFull = {
        "Kolor": product?.kolor ? product.kolor.charAt(0).toUpperCase() + product.kolor.slice(1) : "",
        "Materiał cholewki": product?.cholewka || "",
        "Materiał wnętrza": product?.wnętrze || "",
        "Materiał wkładki": product?.wkładka || "",
        "Materiał obcasa": product?.["materiał obcasa"] || "",
        "Wysokość obcasa": product?.["wysokość obcasa"] || "",
        "Rodzaj podeszwy": product?.["rodzaj podeszwy"] || "",
        "Materiał podeszwy": product?.["podeszwa materiał"] || "",
        "Wysokość całkowita": product?.["wysokość całkowita buta"] || "",
        "Tęgość": product?.tęgość ? product.tęgość.toUpperCase() + " (standardowa)" : "",
        "Typ buta": product?.typ || "",
        "Model": product?.model || ""
    };

    // Filtrujemy - usuwamy puste wartości
    const productSpecs: Record<string, string> = {};

    Object.keys(productSpecsFull).forEach(key => {
        if (productSpecsFull[key as keyof typeof productSpecsFull] && productSpecsFull[key as keyof typeof productSpecsFull] !== "") {
            productSpecs[key] = productSpecsFull[key as keyof typeof productSpecsFull];
        }
    });

    // Product tabs - useMemo for stability
    const productTabs = useMemo(() => {
        const tabs = [
            { name: "Opis produktu", type: 'html', html: cleanHTML },
            { name: "Specyfikacja", type: 'table', obj: productSpecsFull }
        ]

        return tabs
    }, [cleanHTML, productSpecsFull])

    // Gallery images
    const galleryImages = product?.imgs

    // Get attributes in correct order
    const getAttributesArray = (): ConfigurableAttribute[] => {
        if (!product?.configurable_options?.attributes) return []
        return Object.values(product.configurable_options.attributes).sort(
            (a, b) => parseInt(a.position) - parseInt(b.position)
        )
    }

    // Get current variant price based on selected attributes
    const getCurrentPrice = (): PriceInfo => {
        if (!product) return { price: 0, final_price: 0, sku: '' }

        if (!product.is_configurable) {
            return {
                price: product.price,
                final_price: product.final_price_netto_pln,
                sku: product.sku,
            }
        }

        if (!product.configurable_options) return { price: product.price, final_price: product.final_price_netto_pln, sku: product.sku }

        const attributes = getAttributesArray()
        if (attributes.length === 0) return { price: product.price, final_price: product.final_price_netto_pln, sku: product.sku }

        // Check if all attributes are selected
        const allSelected = attributes.every((attr) => selectedAttributes[attr.code])
        if (!allSelected) return { price: product.price, final_price: product.final_price_netto_pln, sku: product.sku }

        // Build combination key
        const combinationKey = attributes
            .map((attr) => `${attr.code}:${selectedAttributes[attr.code]}`)
            .join('|')

        const variantId: string | undefined = product.configurable_options.combinations[combinationKey]
        if (!variantId) return { price: product.price, final_price: product.final_price_netto_pln, sku: product.sku }

        const variant: ConfigurableProduct | undefined = product.configurable_options.products[variantId]
        if (!variant) return { price: product.price, final_price: product.final_price_netto_pln, sku: product.sku }

        return {
            price: parseFloat(String(variant.price)),
            final_price: parseFloat(String(variant.final_price)),
            sku: variant.sku,
            variantId: variant.id,
        }
    }

    const priceInfo = getCurrentPrice()

    // Update currentProduct when variant changes
    useEffect(() => {
        if (priceInfo.variantId && product?.configurable_options?.products[priceInfo.variantId]) {
            setCurrentProduct(product.configurable_options.products[priceInfo.variantId])
        }
    }, [priceInfo.variantId, product])

    const name = useMemo((): string => {
        if (!product?.name) return ""
        return product.name?.split("CARINII")[0].trim() || product.name
    }, [product?.name])

    // === CONDITIONAL RETURN - AFTER ALL HOOKS ===
    if (!product) {
        return null;
    }

    const existing = items.find(item => item.pid === product.id)

    const handleQuantityChange = (delta: number): void => {
        const newQuantity = Math.max(1, quantity + delta)
        setQuantity(newQuantity)
    }

    const handleAttributeChange = (code: string, value: string): void => {
        setSelectedAttributes((prev) => ({ ...prev, [code]: value }))
    }

    const handleInquiryChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target
        setInquiryForm((prev) => ({ ...prev, [name]: value }))
    }

    const handlePriceChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target
        setPriceForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmitInquiry = (): void => {
        console.log('Inquiry submitted:', inquiryForm)
        setSubmittedInquiry(true)
        setTimeout(() => {
            setIsInquiryOpen(false)
            setSubmittedInquiry(false)
            setInquiryForm(INITIAL_FORM)
        }, 2000)
    }

    const handleSubmitPrice = (): void => {
        console.log('Price negotiation submitted:', priceForm)
        setSubmittedPrice(true)
        setTimeout(() => {
            setIsPriceOpen(false)
            setSubmittedPrice(false)
            setPriceForm(INITIAL_FORM)
        }, 2000)
    }

    const handleAddToCart = (): void => {
        if (_.isEmpty(variant) && hasVariant) {
            setErorrVariant(true);
            return;
        }
        setErorrVariant(false);
        console.clear();

        console.log('Added to cart:', {
            pid: product.pid,
            variantId: variant,
            qty: quantity,
            name: product.name,
            image: product?.image_main,
            price: product.price,
            final_price: product.final_price,
            sku: product.sku,
        })
        setShowMiniCart(true);
        addItemToCart({
            pid: product.pid + "_" + variant?.size,
            variantId: product.childProducts[variant.size] ?? 0,
            variant: variant,
            qty: 1,
            attrs: {},
            name: product.name,
            image: product?.image_main,
            price: product.price,
            final_price: product.final_price,
            sku: product.sku,
        })
    }

    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price)
    }

    const formatPriceEur = (pricePln: number): string | null => {
        if (!eurRate) return null
        const priceEur = pricePln / eurRate
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
        }).format(priceEur)
    }

    const calculateBruttoPrice = (nettoPrice: number): number => {
        return nettoPrice * 1.23 // 23% VAT
    }

    const handleNextImage = (): void => {
        if (!galleryImages) return
        setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length)
    }

    const handlePrevImage = (): void => {
        if (!galleryImages) return
        setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)
    }

    const handleKeyDown = (e: React.KeyboardEvent): void => {
        if (e.key === 'ArrowRight') handleNextImage()
        if (e.key === 'ArrowLeft') handlePrevImage()
        if (e.key === 'Escape') setIsLightboxOpen(false)
    }


    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8" style={{ '--primary-color': PRIMARY_COLOR, '--accent-color': ACCENT_COLOR } as React.CSSProperties}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
                    {/* Product Gallery Section */}
                    <ProductGallery imgs={galleryImages} />
                    {/* Product Details Section */}
                    <div className="flex flex-col gap-6">
                        {/* Product Info */}
                        <div className="space-y-2 ">
                            <div className="flex mb-20 justify-between">
                                <div className="badge" key={`badge-${badge}-${by}`}>

                                    {badge && (
                                        <>
                                            <span className="uppercase text-2xl font-bold">{badge}</span>
                                            <div className="text-xs">{by}</div>
                                        </>
                                    )}
                                </div>

                                <div className="share flex gap-2">
                                    <ShareIt url="https://example.com/post/123" title="Świetny artykuł!" />
                                    <Button
                                        variant="outline"
                                        size="icon"

                                        aria-label="Udostępnij"
                                    >
                                        <Heart className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <h1 className="text-3xl font-bold text-hert uppercase tracking-tighter">
                                {name}
                            </h1>
                            <div className="flex justify-between">
                                <p className="text-md text-gray-600">{product.sku}</p>

                                {product['Grupa klientów 1'] && (
                                    <p className="text-sm text-gray-500">
                                        Dla: {product['Grupa klientów 1']}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mt-6">
                            <div className="grid items-baseline gap-3 flex-wrap">
                                <div className="flex gap-2">
                                    {product.has_special_price && (
                                        <p className="text-md text-black line-through">
                                            {formatPrice(product.price)}
                                        </p>
                                    )}
                                    {product.has_special_price && product.save_percent && product.save_percent > 0 && (
                                        <span className="text-sm font-semibold text-white bg-hcar rounded-full px-2 py-0.5">
                                            -{product.save_percent}%
                                        </span>
                                    )}
                                </div>
                                <div className="text-4xl font-bold text-hcar">
                                    {product.final_price && formatPrice(product.final_price)}
                                </div>

                                {product.omnibus && (
                                    <span className="text-xs"> najniższa cena w ciągu ostatnich 30 dni: <u> {formatPrice(product.omnibus)}</u></span>
                                )}
                            </div>

                        </div>
                        <div className="mt-4">
                            <PromoBadge />
                        </div>
                        <div className="mt-4">
                            <SizeSwatch
                                setVariant={(variant: Variant) => {
                                    console.log(variant);
                                    setVariant(variant);
                                    setErorrVariant(false);
                                }}
                                size_qty={product.size_qty || []}
                                sku={product.sku}
                                image_thumbnail={product.image_main}
                            />
                        </div>
                        {/* Configurable Options */}
                        {product.is_configurable && product.configurable_options && (
                            <div className="space-y-4 border-t border-b border-gray-200 py-6">
                                <h3 className="text-sm font-semibold text-hert">Konfiguracja</h3>
                                {getAttributesArray().map((attribute) => (
                                    <div key={attribute.code} className="space-y-2">
                                        <Label htmlFor={attribute.code} className="text-sm font-semibold">
                                            {attribute.label}
                                        </Label>
                                        <Select value={selectedAttributes[attribute.code] || ''} onValueChange={(value) => handleAttributeChange(attribute.code, value)}>
                                            <SelectTrigger id={attribute.code} className="w-full">
                                                <SelectValue placeholder={`Wybierz ${attribute.label.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attribute.options.map((option) => (
                                                    <SelectItem key={option.id} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>
                        )}
                        {product.short_description && (
                            <div className="shortdesc">
                                <div dangerouslySetInnerHTML={{ __html: short_cleanHTML }} />
                            </div>
                        )}


                        {/* Quantity Selector & Add to Cart */}
                        {!product.hide_price && (

                            <>
                                <div className="flex flex-wrap  justify-between items-center">


                                    {errorVariant && (
                                        <div className="rounded-full w-full mb-2 text-center bg-hcar px-2.5 py-1.5 text-sm whitespace-nowrap text-white">
                                            Prosimy o wybranie rozmiaru!
                                        </div>
                                    )}
                                    <div className="w-full">
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={product.is_configurable && getAttributesArray().some((attr) => !selectedAttributes[attr.code])}
                                            className="w-full py-6 text-lg text-white bg-car hover:bg-hcar"

                                        >
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            Dodaj do koszyka
                                        </Button>
                                    </div>

                                </div></>
                        )}

                        <div className="relprss">
                            <ReletaedProducts products={product.rel || []} />
                        </div>

                        <div className="mt-0 ">
                            <TabList
                                tabs={productTabs}
                                defaultActiveIndex={0}
                                className="custom-class"
                            />
                        </div>
                    </div>
                </div>

                {/* Full Description Section */}

            </div>

            <div className=" mt-16 w-full h-px my-8 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>

            <ProductsCarouselProducts title="Nieprzegap..." products={seemore.length > 0 ? seemore : []} />

        </main>
    )
}