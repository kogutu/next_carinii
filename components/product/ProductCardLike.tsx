import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Star, Info, Truck, Package } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { StockLevel } from "./components/stock_level"


export interface Product {
    // Identifiers
    id: string
    pid: number
    sku: string
    ean?: string

    // Basic info
    name: string
    subtitle?: string
    url?: string
    slug?: string
    model?: string
    description?: string

    // Categories
    cats?: string[]

    // Status flags
    enabled: boolean
    isnew?: boolean
    ispresale?: boolean

    // Pricing
    price: number
    pulap?: number // original price
    pulap_teraz?: number // discount amount

    // Stock
    qty: number
    stock?: {
        stock: {
            available_quantity: number
            is_available: boolean
            is_on_order: number
            real_quantity: number
        }
        delivery: {
            days: number
            formatted_time: number
            delivery_date_info?: {
                status: boolean
            }
        }
    }
    stock_data?: {
        stock: {
            display_quantity: string
            is_on_order: string
            real_quantity: string
        }
        delivery: {
            days: string
            days_text: string
        }
        reviews: {
            clients_count: number
            review_text: string
            stars: number
        }
        display: {
            show_immediate_stock: boolean
            show_on_order: boolean
            show_additional_on_order: boolean
            show_min_delivery: boolean
            show_planned_delivery: boolean
            show_reviews: boolean
        }
        planned_delivery?: {
            status: boolean
        }
    }

    // Reviews
    reviews_count?: number
    reviews_stars?: number
    revs?: any[]

    // Images
    img: string
    imgs?: Array<{
        url: string
        alt: string
        position: number
    }>

    // Shipping
    shipping_amount?: number
    shipping_carring?: number
    shipping_days?: string[]
    shipping_packages?: number
    shipping_realizacja?: number
    shipping_termin?: string

    // Specifications
    specyfikacja?: {
        [key: string]: any[]
    }
    specyfikacja_string?: string

    // Characteristics
    charakterystyka?: {
        [key: string]: string[]
    }
    charakterystyka_string?: string

    // Additional
    flaga?: string
    cbm?: number
    configuration?: any[]
    dodatki?: any
    instrukcja_montazu?: boolean
    instrukcja_uzytkowania?: string
    model3d?: string
    noga?: any
    nogipodstawy?: any[]
    wysylka?: {
        packs: string
        height: number[]
        length: number[]
        width: number[]
        weight: number[]
        per_in_box: number[]
    }
    lowerpricemonth?: string
    facets_list?: any[]
}

type ProductCardProps = {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const discount =
        product.pulap && product.price ? Math.round(((product.pulap - product.price) / product.pulap) * 100) : 0

    const currentPrice = product.price
    const regularPrice = product.pulap || 0
    const discountAmount = regularPrice - currentPrice;
    const imageUrl = product.img || "/placeholder.svg"
    const deliveryCost = product.shipping_amount || 0
    const deliveryTime = product.shipping_termin || ""
    const reviewCount = product.reviews_count || 0
    const reviewStars = product.reviews_stars || 0
    const stockQuantity = product.stock_data?.stock?.display_quantity || product.qty?.toString() || "0"

    // Extract warranty from specifications
    const warranty = product.specyfikacja?.gwarancja?.[0] || "10"
    const warrantyUnit = "lat"

    // Generate product URL from slug
    const productUrl = product?.slug ? `/${product.slug}` : "#"

    return (
        <Card className="group relative overflow-hidden border-0 bg-card shadow-lg transition-all duration-300 hover:shadow-xl py-0 my-4 gap-0 border border-gray-50 min-h-[400px] md:min-h-[400px]">
            {/* Badges */}

            {product.isnew && (
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 ">
                    <Badge className="bg-destructive text-white font-bold shadow-md text-xs">
                        HIT
                    </Badge>
                </div>

            )}
            {product.ispresale && (
                <div className="absolute left-2 top-2 z-10 flex flex-col gap-1 ">

                    <Badge className="bg-mpgreen text-white font-bold shadow-md text-xs">PRESALE</Badge>
                </div>

            )}


            {/* Product Image with Link */}
            <Link href={productUrl}>
                <div className="relative overflow-hidden aspect-[4/3] cursor-pointer">
                    <Image
                        src={imageUrl || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="w-full img_bg object-contain transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                </div>
            </Link>

            {/* Content */}
            <div className="p-3 space-y-2">

                <div className="flex items-center justify-between gap-2 ">
                    <div className="flex items-center gap-1.5 justify-center w-full">

                        <div className="flex items-center gap-1 justify-center w-full">


                        </div>
                    </div>
                </div>


                {/* Product Name with Link */}
                <div className="space-y-1 w-full min-h-[100px] flex items-center flex-wrap">
                    <Link href={productUrl}>
                        <h3 className="font-bold w-full mb-2 text-center text-base leading-tight line-clamp-2 text-balance cursor-pointer hover:text-primary transition-colors">
                            {product.name}
                        </h3>
                    </Link>
                    {product.subtitle && (
                        <Link href={productUrl}>
                            <p className="text-xs w-full text-center text-muted-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors">
                                {product.subtitle}
                            </p>
                        </Link>
                    )}

                </div>



                {/* Rating & Stock */}
                <div className="flex items-center justify-between ">
                    <div>
                        <div className="flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-warning text-warning" fill={reviewCount ? '#f8d20c' : 'transparent'} strokeWidth={reviewCount ? 0 : 1} />
                            <span className="font-semibold text-xs underline decoration-dotted underline-offset-2 cursor-pointer hover:text-primary transition-colors">
                                {reviewCount} {reviewCount == 0 && (<span>opinii</span>)}  {reviewCount == 1 && (<span>opinia</span>)} {reviewCount > 1 && (<span>opinie</span>)}
                            </span>
                        </div>
                    </div>
                    <StockLevel product={product} />

                </div>

                {/* Delivery Info */}
                {/* {product.stock_data?.delivery && (
                    <div className="text-xs text-muted-foreground">
                        <p className="font-medium">
                            Kolejna dostawa za <span className="text-foreground font-bold">min 6 miesięcy</span>
                        </p>
                    </div>
                )}
 */}

                {/* Pricing Section */}
                <div className="space-y-1.5  ">
                    <div className="flex items-center justify-between flex-wrap mt-5">
                        <div className="flex justify-between w-full">
                            <span className="text-xs block w-full  font-medium text-muted-foreground uppercase">
                                {regularPrice > currentPrice && (
                                    <s>{regularPrice} zł</s>
                                )}


                            </span>
                            <span className="text-right text-xs block w-full  font-medium text-muted-foreground uppercase">Gwarancja:

                            </span>
                        </div>
                        <div className="flex items-baseline gap-2">

                            <span className="text-2xl font-bold  text-mpred">{currentPrice} zł</span>

                        </div>

                        <div className="bg-success text-success-foreground bg-mpgray text-white rounded-md px-2 py-1 font-bold text-xs shadow-md whitespace-nowrap">
                            {warranty ?? 2} {warrantyUnit ?? 'lata'}
                        </div>
                    </div>

                    {/* Delivery Details */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
                        <div className="flex items-center gap-1">
                            <Truck className="h-3 w-3" />
                            <span className="font-bold text-foreground">{deliveryCost} zł</span>
                        </div>
                        <div className="flex items-center gap-1">
                            Czas wysyłki:
                            <span className="font-bold text-mpgreen">{deliveryTime}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card >
    )
}
