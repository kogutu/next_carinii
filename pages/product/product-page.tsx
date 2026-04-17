'use client'

import React, { useState, useMemo, useEffect, useRef } from "react"
import DOMPurify from 'isomorphic-dompurify'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ShoppingCart, Heart, Star, StarHalf, Truck, Shield, Leaf } from 'lucide-react'
import ProductGallery from "./productGallery"
import TabList from "./TabList"
import { ProductReviews } from "./ProductReviews"
import _ from "lodash"
import { useCartStore } from "@/stores/cartZustand"

// ============ TYPES ============

interface ProductAttribute {
    [key: string]: string
}

interface Variation {
    id: number
    attrs: {
        kupujący?: string
        [key: string]: string | undefined
    }
    price: number
    sale_price: number
    final_price: number
    in_stock: boolean
    qty: number
    sku: string
    image: string
}

interface Product {
    id: string
    pid: number
    name: string
    sku: string
    price: number
    price_min: number
    price_max: number
    final_price: number
    special_price: number
    has_special_price: boolean
    save_percent: number
    omnibus_price: string
    short_description: string
    description: string
    image_main: string
    image_medium: string
    image_large: string
    image_thumbnail: string
    images: string[]
    url: string
    slug: string
    basename: string
    type: string
    status: string
    in_stock: boolean
    stock_status: string
    qty: number
    weight: number
    attributes: ProductAttribute
    variation_attributes: {
        [key: string]: string[]
    }
    variations: Variation[]
    variation_count: number
    categories: number[]
    category_ids: number[]
    category_names: string[]
    category_slugs: string[]
    category_hierarchy: string[]
    tag_ids: number[]
    tag_names: string[]
    average_rating: number
    review_count: number
    total_sales: number
    featured: boolean
    meta_title: string
    meta_description: string
    shipping_class: string
    cross_sell_ids: number[]
    upsell_ids: number[]
}

interface ProductPageProps {
    product: Product
    relatedProducts?: Product[]
}

// ============ COMPONENT ============

export default function ProductPage({ product, relatedProducts = [] }: ProductPageProps) {

    const addItemToCart = useCartStore(state => state.addItemToCart)
    const setShowMiniCart = useCartStore(state => state.setShowMiniCart)
    const items = useCartStore(state => state.items)

    // State for selected variation
    // const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null)
    const [selectedBuyer, setSelectedBuyer] = useState<string>("")
    const [isAddingToCart, setIsAddingToCart] = useState(false)
    const [descLoad, setDescLoaded] = useState(false)
    const [qtySelectedVariant, setQtySelectedVariant] = useState(product.qty);
    const [selectedVariation, setSelectedVariation] = useState(() => {
        // Zabezpieczenie 1: sprawdź czy product istnieje i ma variations
        if (!product?.variations?.length) {
            return {}; // lub null, w zależności od potrzeb
        }

        // Zabezpieczenie 2: upewnij się, że zwracasz kopię, a nie referencję
        return { ...product.variations[0] };
    });


    const stock_anv = product.qty > 0 ? true : false;

    // Get variation attribute options
    const buyerCoalOptions = useMemo(() => {
        return product.variation_attributes?.["kupujący"] || []
    }, [product.variation_attributes])

    // Find variation by selected buyer type
    const findVariation = (buyerType: string): Variation | undefined => {
        return product.variations?.find(v => v.attrs.kupujący === buyerType)
    }

    // Handle buyer selection
    const handleBuyerChange = (value: string) => {
        setSelectedBuyer(value)
        const variation = findVariation(value)
        setSelectedVariation(variation || null)
    }


    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= qtySelectedVariant) {


            setQuantity(newQuantity);
        }
    };



    // const setVariant = (newQuantity) => {
    //     if (newQuantity >= 1 && newQuantity <= qtySelectedVariant) {


    //         setQuantity(newQuantity);
    //     }
    // };


    const handleVariationSelect = (v) => {
        console.log(v.qty);
        setQtySelectedVariant(v.qty);
        if (quantity > v.qty) setQuantity(v.qty);
        if (v.qty > 0) {
            setSelectedVariation(v || null)
        }
    }



    // Get current price info
    const currentPrice = useMemo(() => {

        if (selectedVariation && !_.isEmpty(selectedVariation)) {


            return {
                price: selectedVariation.price,
                finalPrice: selectedVariation.final_price,
                hasDiscount: selectedVariation.price !== selectedVariation.final_price
            }
        }
        return {
            price: product.price,
            finalPrice: product.final_price,
            hasDiscount: product.has_special_price
        }
    }, [selectedVariation, product])



    // Uruchom funkcję po załadowaniu strony
    // Możesz wywołać ją ręcznie: replaceYouTubeLinksWithIframes();
    // Sanitized HTML
    const cleanDescription = useMemo(() => {

        if (!product?.description) return ""
        return DOMPurify.sanitize(product.description).replace(/\r\n/g, '<br />')
    }, [product?.description])

    const cleanShortDescription = useMemo(() => {
        if (!product?.short_description) return ""
        return DOMPurify.sanitize(product.short_description).replace(/\r\n/g, '<br />')
    }, [product?.short_description])

    // Product specs from attributes
    const productSpecs = useMemo(() => {
        if (!product?.attributes) return {}
        const specs: Record<string, string> = {}

        const labelMap: Record<string, string> = {
            "granulacja": "Granulacja",
            "kaloryczność": "Kaloryczność",
            "kategoria": "Kategoria",
            "opakowanie": "Opakowanie",
            "paliwo": "Rodzaj paliwa",
            "popiół": "Zawartość popiołu",
            "producent": "Producent",
            "wilgoć całkowita": "Wilgotność"
        }

        Object.entries(product.attributes).forEach(([key, value]) => {
            if (value) {
                const label = labelMap[key] || key.charAt(0).toUpperCase() + key.slice(1)
                specs[label] = value
            }
        })

        return specs
    }, [product?.attributes])

    // Product tabs

    const productTabs = useMemo(() => {
        setDescLoaded(true);
        return [
            { name: "Opis produktu", type: 'html' as const, html: cleanDescription }
        ]
    }, [cleanDescription, productSpecs])


    const contentRef = useRef(null);
    useEffect(() => {


        const container = document.querySelector('.product-content') || document.body;

        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&]\S*)?/g;

        const elements = container.querySelectorAll('p, span, li, div:not(.video-container), h2, h3, h4');

        elements.forEach(element => {
            if (element.querySelector('iframe')) return;

            let html = element.innerHTML;
            let modified = false;
            let newHtml = html;

            const matches = [...html.matchAll(youtubeRegex)];

            matches.forEach(match => {
                const fullUrl = match[0];
                const videoId = match[1];

                const iframeHtml = `<div class="video-container"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`;

                newHtml = newHtml.replace(fullUrl, iframeHtml);
                modified = true;
            });

            if (modified) {
                element.innerHTML = newHtml;
            }
        });

    }, [descLoad]); // Re-run jeśli htmlContent się zmieni



    // Format price
    const formatPrice = (price: number): string => {
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
        }).format(price)
    }

    // Render star rating
    const renderRating = (rating: number) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5

        for (let i = 0; i < fullStars; i++) {
            stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-amber-400 text-amber-400" />)
        }
        if (hasHalfStar) {
            stars.push(<StarHalf key="half" className="h-4 w-4 fill-amber-400 text-amber-400" />)
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
        }
        return stars
    }

    // Add to cart handler
    const handleAddToCart = (): void => {
        // if (_.isEmpty(variant) && hasVariant) {
        //     setErorrVariant(true);
        //     return;
        // }
        // setErorrVariant(false);
        console.clear();
        var price = product.price;
        var final_price = product.final_price;
        if (selectedVariation.price) {
            final_price = selectedVariation.final_price;
            price = selectedVariation.price
        };


        console.log('Added to cart:', {
            pid: product.pid,
            variantId: selectedVariation,
            product: product,
            qty: quantity,
            name: product.name,
            image: product?.image_main,
            price: price,
            final_price: final_price,
            sku: product.sku,
        })
        setShowMiniCart(true);
        addItemToCart({
            pid: selectedVariation?.id,
            variantId: selectedVariation?.id,
            variant: selectedVariation,
            product: product,
            qty: quantity,
            attrs: {},
            name: product.name,
            image: product?.image_main,
            price: price,
            final_price: final_price,
            sku: product.sku,
        })
    }
    if (!product) {
        return null
    }

    return (
        <main className="min-h-screen bg-background py-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                {product.category_hierarchy && product.category_hierarchy.length > 0 && (
                    <nav className="mb-6 text-sm text-muted-foreground">
                        <ol className="flex flex-wrap items-center gap-2">
                            <li><a href="/" className="hover:text-foreground transition-colors">Sklep</a></li>
                            {product.category_names.map((cat, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <span>/</span>
                                    <a href={`/kategoria/${product.category_slugs[i]}`} className="hover:text-foreground transition-colors">
                                        {cat}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}

                <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
                    {/* Product Gallery Section */}
                    <ProductGallery imgs={product.images} />

                    {/* Product Details Section */}
                    <div className="flex flex-col gap-6">
                        {/* Tags/Badges */}
                        <div className="flex flex-wrap gap-2">
                            {product.featured && (
                                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-3 py-1 rounded-full">
                                    Polecany
                                </span>
                            )}
                            {product.has_special_price && product.save_percent > 0 && (
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
                                    -{product.save_percent}%
                                </span>
                            )}
                            {product.tag_names?.slice(0, 3).map((tag, i) => (
                                <span key={i} className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Product Name & SKU */}
                        <div className="space-y-2">
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                                {product.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span>SKU: {product.sku}</span>
                                {product.weight > 0 && (
                                    <span>Waga: {product.weight} kg</span>
                                )}
                            </div>
                        </div>

                        {/* Rating */}
                        {product.average_rating > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                    {renderRating(product.average_rating)}
                                </div>
                                <span className="text-sm font-medium">{product.average_rating.toFixed(2)}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({product.review_count} {product.review_count === 1 ? 'opinia' : 'opinii'})
                                </span>
                            </div>
                        )}

                        {/* Price Section */}
                        <div className="space-y-2 py-4 border-y border-border">

                            <div className="grid items-baseline gap-3">

                                <span className="text-3xl font-bold text-primary">
                                    {formatPrice(currentPrice.finalPrice)}
                                </span>
                                {currentPrice.hasDiscount && (
                                    <span className="text-lg text-muted-foreground line-through">
                                        {formatPrice(currentPrice.price)}
                                    </span>
                                )}
                            </div>
                            {product.price_min !== product.price_max && !selectedVariation && (
                                <p className="text-sm text-muted-foreground">
                                    Ceny od {formatPrice(product.price_min)} do {formatPrice(product.price_max)}
                                </p>
                            )}
                            {product.omnibus_price && (
                                <p className="text-xs text-muted-foreground">
                                    Najniższa cena w ciągu ostatnich 30 dni: {product.omnibus_price}
                                </p>
                            )}
                        </div>






                        {/* Short Description */}
                        {product.short_description && (
                            <div
                                className="text-sm text-muted-foreground prose prose-sm max-w-none"
                                suppressHydrationWarning
                                dangerouslySetInnerHTML={{ __html: cleanShortDescription }}
                            />
                        )}

                        {/* Variation Selector */}
                        {product.type === 'variable' && buyerCoalOptions.length > 0 && (
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">
                                    Wybierz typ kupującego *
                                </label>
                                <Select value={selectedBuyer} onValueChange={handleBuyerChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Wybierz typ kupującego" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {buyerCoalOptions.map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {!selectedBuyer && (
                                    <p className="text-xs text-amber-600">
                                        Wybierz typ kupującego, aby dodać produkt do koszyka
                                    </p>
                                )}
                            </div>
                        )}
                        {product.type === 'variable' && product.variation_count > 0 && buyerCoalOptions.length === 0 && (
                            <div className="opts mt-4 relative">
                                <div className="text-gray-700 font-medium mb-3">
                                    Wybierz {Object.keys(product.variations[0]?.attrs || {}).join(", ")}:
                                </div>
                                <div className="options relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {product.variations.map((e, idx) => {
                                        const isAvailable = e.qty > 0 && e.in_stock === true;
                                        return (
                                            <div
                                                onClick={() => handleVariationSelect(e)}
                                                key={idx}
                                                className={(selectedVariation.id == e.id ? "border-green-600  bg-green-50 text-green-600" : '') + `
              border rounded-2xl p-3 flex flex-col items-center justify-center text-center
              transition-all duration-200
              ${isAvailable
                                                        ? ' border-gray-200 relative overflow-hidden pt-[30px] hover:shadow-md hover:border-blue-300 cursor-pointer'
                                                        : 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                                                    }
            `}
                                            >

                                                <div className="promo absolute top-0 left-0  text-xs text-white bg-red-600 w-full">
                                                    {e.final_price != e.price && (
                                                        <div className="py-[2px]">! PROMOCJA !</div>
                                                    )}
                                                </div>
                                                <span className={`
              font-bold text-lg
              ${isAvailable ? 'text-gray-800' : 'text-gray-500'}
            `}>
                                                    {Object.values(e.attrs).join(", ")}
                                                </span>


                                                <div className="price">


                                                    {e.final_price != e.price && (

                                                        <>
                                                            <s className="text-gray-500 text-xs">{formatPrice(e.price)}</s>
                                                            <div className={`
              font-semibold text-sm mt-1
              ${isAvailable ? 'text-red-600' : 'text-gray-400'}
            `}>

                                                                {formatPrice(e.final_price)}
                                                            </div></>
                                                    )}





                                                    {e.final_price == e.price && (
                                                        <div className={`
              font-semibold text-sm mt-1
              ${isAvailable ? 'text-red-600' : 'text-gray-400'}
            `}>
                                                            {formatPrice(e.final_price)}
                                                        </div>


                                                    )}

                                                </div>





                                                {!isAvailable && (
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        brak w magazynie
                                                    </div>
                                                )}
                                                {isAvailable && e.qty <= 3 && (
                                                    <div className="text-xs text-orange-500 mt-1">
                                                        tylko {e.qty} szt.
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart */}
                        <div className="space-y-3">

                            {/* Przycisk dodawania do koszyka */}

                            {stock_anv && (
                                <div>
                                    {/* Qty Selector */}
                                    < div className="flex items-center justify-between border rounded-lg p-2 mb-1">
                                        <span className="text-sm font-medium text-gray-600">Ilość:</span>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleQuantityChange(quantity - 1)}
                                                disabled={quantity <= 1}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="w-12 text-center font-semibold text-lg">
                                                {quantity}
                                            </span>
                                            <button
                                                onClick={() => handleQuantityChange(quantity + 1)}
                                                disabled={quantity >= qtySelectedVariant}
                                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAddToCart}
                                        disabled={product.type === 'variable' && !selectedVariation}
                                        className="w-full py-6 text-lg"

                                        size="lg"
                                    >
                                        {isAddingToCart ? (
                                            <span className="flex items-center gap-2">
                                                <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                Dodawanie...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <ShoppingCart className="h-5 w-5" />
                                                Dodaj do koszyka
                                            </span>
                                        )}
                                    </Button>
                                </div>

                            )}

                            {!stock_anv && (
                                <Button

                                    className="w-full py-6 text-lg bg-red-500"

                                    size="lg"
                                >

                                    <span className="flex items-center gap-2">
                                        ⚠️
                                        BRAK NA MAGAZYNIE
                                    </span>

                                </Button>
                            )}

                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-4 py-4">
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="p-2 rounded-full bg-green-100">
                                    <Truck className="h-5 w-5 text-green-700" />
                                </div>
                                <span className="text-xs text-muted-foreground">Szybka dostawa</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="p-2 rounded-full bg-blue-100">
                                    <Shield className="h-5 w-5 text-blue-700" />
                                </div>
                                <span className="text-xs text-muted-foreground">Bezpieczne płatności</span>
                            </div>
                            <div className="flex flex-col items-center text-center gap-2">
                                <div className="p-2 rounded-full bg-amber-100">
                                    <Leaf className="h-5 w-5 text-amber-700" />
                                </div>
                                <span className="text-xs text-muted-foreground">Certyfikat jakości</span>
                            </div>
                        </div>

                        {/* Product Attributes Quick View */}
                        {Object.keys(productSpecs).length > 0 && (
                            <div className="bg-muted/50 rounded-lg p-4">
                                <h3 className="font-medium mb-3 text-foreground">Parametry produktu</h3>
                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(productSpecs).slice(0, 6).map(([key, value]) => (
                                        <div key={key} className="flex flex-col">
                                            <dt className="text-muted-foreground">{key}</dt>
                                            <dd className="font-medium text-foreground">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        )}

                        {/* Tabs */}

                    </div>
                </div>
                <div className="mt-4 product-content">
                    <TabList
                        tabs={productTabs}
                        defaultActiveIndex={0}
                    />
                </div>
                {/* Sales Info */}
                {product.total_sales > 0 && (
                    <div className="mt-8 text-center text-sm text-muted-foreground">
                        {product.pid}
                        Sprzedano już: <strong>{(product.total_sales + Math.ceil(product.pid * 0.1)).toLocaleString('pl-PL')}</strong> sztuk
                    </div>
                )}

                {/* Reviews Section */}
                <ProductReviews
                    productSku={product.sku}
                    productBasename={product.basename}
                    averageRating={product.average_rating}
                    reviewCount={product.review_count}
                />
            </div>
        </main>
    )
}
