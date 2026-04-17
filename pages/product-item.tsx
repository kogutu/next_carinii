'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import _ from 'lodash';

/**
 * Typesense product document shape (relevant fields for this component).
 * Full schema: ts_fields_products.json
 */
export interface TsProduct {
    id: string;
    pid: number;
    sku: string;
    name: string;
    slug: string;
    url: string;
    type: string;
    status: string;

    in_stock: boolean;
    stock_quantity: number;
    stock_status: string;

    price: number;
    sale_price?: number;
    final_price: number;
    on_sale: boolean;
    save_percent: number;

    category_ids: number[];
    category_names: string[];

    image_main?: string;
    image_large?: string;
    image_medium?: string;
    image_thumbnail?: string;
    images?: string[];

    featured: boolean;
    total_sales: number;
    average_rating: number;
    review_count: number;
    variation_attributes: any;
    created_at: number;
    updated_at: number;
    menu_order: number;
}

interface ProductItemProps {
    product: TsProduct;
    loading: boolean;
    viewMode: 'grid' | 'list';
    promoCode?: string;
}

function ProductItemInner({ product, viewMode, loading, promoCode = '' }: ProductItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

    /* ======================== SKELETON ======================== */
    if (loading) {
        return (
            <div className={cn(
                'bg-gray-100 overflow-hidden animate-pulse',
                viewMode === 'grid' ? '' : 'h-36 flex gap-4'
            )}>
                <div className={cn(
                    'bg-gray-200',
                    viewMode === 'grid' ? 'w-full aspect-[2/3]' : 'w-36 h-full flex-shrink-0'
                )} />
                <div className="flex flex-col gap-2 p-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-auto" />
                </div>
                <div className="h-16" />
            </div>
        );
    }

    if (!product) return null;

    /* ======================== DERIVED DATA ======================== */
    const imageMain = product.image_medium || product.image_main || '/placeholder.jpg';
    const imageHover = product.image_thumbnail || imageMain;
    const productSlug = product.slug || '';

    const price = product.price == 0 ? product.final_price : product.price;
    const from_price = product.price == 0 ? true : false;
    const salePrice = product.sale_price;
    const onSale = product.on_sale && salePrice && salePrice > 0;
    const displayPrice = onSale ? salePrice : price;
    const finalPrice = product.final_price;

    const isNew = product.category_names?.includes('NOWOŚCI') || false;
    const isOutOfStock = !product.in_stock;


    let variation_labels: any = Object.values(product.variation_attributes ?? []).map((e: any) => {
        return Object.values(e);
    }).flat().filter(Boolean);;;

    if (_.has(product.variation_attributes, 'kupujący')) variation_labels = [];

    const sku = product.sku || '';

    // save_percent from Typesense: already the discount % (e.g. 20 means 20% off)
    const promoPercent = product.save_percent > 0 && product.save_percent < 100
        ? product.save_percent
        : null;

    const StarEmpty = () => {
        return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.99999 12.1969L3.05573 15.2169L4.4 9.58141L0 5.81233L5.77507 5.34934L7.99999 0L10.2249 5.34934L16 5.81233L11.6 9.58141L12.9443 15.2169L7.99999 12.1969Z" fill="#D0D5DD" />
        </svg>)

    }
    const StarFull = () => {
        return (<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.99999 12.1969L3.05573 15.2169L4.4 9.58141L0 5.81233L5.77507 5.34934L7.99999 0L10.2249 5.34934L16 5.81233L11.6 9.58141L12.9443 15.2169L7.99999 12.1969Z" fill="#FFBB52" />
        </svg>)

    }
    const handleCopyCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!promoCode) return;
        try {
            await navigator.clipboard.writeText(promoCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        } catch {
            const textarea = document.createElement('textarea');
            textarea.value = promoCode;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        }
    };

    const formatPrice = (val: number) =>
        val.toFixed(2).replace('.', ',') + ' zł';

    /* ======================== GRID ======================== */
    if (viewMode === 'grid')
        return (
            <div
                className="flex flex-col overflow-hidden group relative  border-1 border-[#f5f5f5] justify-center rounded-2xl"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link href={`/${productSlug}`} className="block relative flex-1 min-h-0 bg-gray-100 pt-12">
                    <div className="relative w-full h-full overflow-hidden aspect-[1/1] pt-1 mb-6">
                        <img
                            src={imageMain}
                            alt={product.name || ''}
                            loading="lazy"
                            decoding="async"
                            className={cn(
                                'object-cover absolute t-0 w-full h-full brightness-[0.96] transition-all duration-500 ease-in-out',
                                isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                            )}
                        />
                        <img
                            src={imageHover}
                            alt={product.name || ''}
                            loading="lazy"
                            decoding="async"
                            className={cn(
                                'object-cover absolute w-full h-full brightness-[0.96] transition-all duration-500 ease-in-out',
                                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            )}
                        />



                    </div>
                    {variation_labels && (
                        <div className="bages absolute bottom-[3px] left-0 gap-1 flex  justify-center right-0">
                            {variation_labels.map((item: any) => (
                                <span key={item} className="bg-sobianek/60 rounded-2xl text-white text-[11px] font-bold uppercase px-2.5 py-1 z-10">
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                    {promoPercent && (
                        <span className="absolute top-2.5 right-2.5 bg-red-500 rounded-2xl text-white text-[11px] font-bold uppercase px-2.5 py-1 tracking-widest z-10">
                            -{promoPercent}%

                        </span>
                    )}
                    {isNew && (
                        <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-bold uppercase px-2.5 py-1 tracking-widest z-10">
                            NEW
                        </span>
                    )}

                    {isOutOfStock && (
                        <span className={cn(
                            'flex items-center gap-2 bg-hcar text-white text-[10px] font-bold px-2 py-1 uppercase left-2.5 m-auto absolute',
                            isNew ? 'top-9' : 'top-2.5'
                        )}>
                            Niedostępny
                        </span>
                    )}
                    {/* 
                    <button
                        className="absolute top-2.5 right-2.5 text-gray-500 hover:text-red-500 transition-colors z-10"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Heart className="w-5 h-5" strokeWidth={1.5} />
                    </button> */}
                </Link>

                <div className="px-3 pt-2.5 pb-2 flex flex-col gap-1 text-center">
                    {/* <Link href={`/${productSlug}`}>
                        <h3 className="font-semibold cfont uppercase truncate text-[14px] text-gray-900 line-clamp-2 leading-snug mt-0.5">
                            {product.name}
                        </h3>
                    </Link> */}

                    <Link href={`/${productSlug}`}>
                        <h3 className="font-semibold text-left cfont  min-h-[60px]  text-[15px] text-gray-900 line-clamp-3 leading-snug mt-0.5">
                            {product.name}
                        </h3>
                    </Link>

                    {product.average_rating >= 0 && (
                        <div className="flex items-center gap-1 text-[14px] text-gray-400 mt-2">
                            {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                    {product.average_rating > i ? <StarFull /> : <StarEmpty />}
                                </span>
                            ))}


                            {product.average_rating > 0 ? (
                                <>
                                    <span className="font-bold text-black">{product.average_rating.toFixed(1)}</span>
                                    {product.review_count > 0 && (
                                        <span>({product.review_count})</span>
                                    )}
                                </>
                            ) : (
                                <span className="text-xs">oceń </span>
                            )}
                        </div>
                    )}

                    {displayPrice != null && displayPrice > 0 && (
                        <div className="flex items-baseline gap-2 mt-2 ">
                            {onSale && price ? (
                                <>

                                    {from_price && (
                                        <span className="text-xs ">od</span>

                                    )}
                                    <span className="text-[15px] font-bold text-red-600">
                                        {formatPrice(displayPrice)}
                                    </span>
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(price)}
                                    </span>

                                </>
                            ) : (
                                <div className="flex gap-1 items-center">
                                    {from_price && (
                                        <span className="text-xs ">od</span>
                                    )}
                                    <span className="text-[15px] font-bold text-black">
                                        {formatPrice(displayPrice)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}



                </div>


            </div>
        );

    /* ======================== LIST ======================== */
    if (viewMode === 'list')
        return (
            <div
                className="flex gap-4 overflow-hidden group mb-3 hover:shadow-md transition-shadow"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="relative w-[130px] flex-shrink-0 aspect-[2/3]">
                    <Link href={`/${productSlug}`} className="block relative w-full h-full">
                        <Image
                            src={imageMain}
                            alt={product.name || ''}
                            fill
                            loading="lazy"
                            className={cn(
                                'object-cover brightness-[0.96] transition-all duration-500',
                                isHovered ? 'opacity-0' : 'opacity-100'
                            )}
                        />
                        <Image
                            src={imageHover}
                            alt={product.name || ''}
                            fill
                            loading="lazy"
                            className={cn(
                                'object-cover brightness-[0.96] transition-all duration-500',
                                isHovered ? 'opacity-100' : 'opacity-0'
                            )}
                        />
                    </Link>

                    {isNew && (
                        <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold uppercase px-2 py-1 tracking-widest z-10">
                            NEW
                        </span>
                    )}

                    {isOutOfStock && (
                        <span className="flex items-center gap-2 bg-hcar text-white text-[10px] font-bold px-2 py-1 uppercase m-auto absolute top-9">
                            Niedostępny
                        </span>
                    )}
                </div>

                <div className="flex flex-col justify-center flex-1 py-3 pr-4 relative">
                    <Link href={`/${productSlug}`}>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-0.5">
                            {product.name}
                        </h3>
                    </Link>

                    <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wide">
                        {sku}
                    </p>

                    {product.category_names?.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                            {product.category_names.map((cat) => (
                                <span
                                    key={cat}
                                    className="text-[10px] border border-gray-200 px-1.5 py-0.5 text-gray-500 bg-gray-50"
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>
                    )}

                    {displayPrice != null && displayPrice > 0 && (
                        <div className="flex items-baseline gap-2">
                            {onSale && price ? (
                                <>
                                    <span className="text-sm text-gray-400 line-through">
                                        {formatPrice(price)}
                                    </span>
                                    <span className="text-[15px] font-bold text-red-600">
                                        {formatPrice(displayPrice)}
                                    </span>
                                </>
                            ) : (
                                <span className="text-[15px] font-bold text-black">
                                    {formatPrice(displayPrice)}
                                </span>
                            )}
                        </div>
                    )}

                    {product.average_rating >= 0 && (

                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
                            {[...Array(5)].map((_, i) => (
                                <span key={i}>
                                    {product.average_rating > i ? <StarFull /> : <StarEmpty />}
                                </span>
                            ))}
                            <span>★ {product.average_rating.toFixed(1)}</span>
                            {product.review_count > 0 && (
                                <span>({product.review_count})</span>
                            )}
                        </div>
                    )}

                    {promoPercent && promoCode && (
                        <button
                            onClick={handleCopyCode}
                            className="mt-2 bg-black hover:bg-gray-800 text-white text-center py-1.5 px-3 cursor-pointer transition-colors inline-flex items-center gap-2 self-start rounded-sm"
                        >
                            {codeCopied ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    <span className="text-[11px] font-medium">Skopiowano!</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-bold">-{promoPercent}%</span>
                                    <span className="text-[11px]">
                                        z kodem: <strong>{promoCode}</strong>
                                    </span>
                                    <Copy className="w-3 h-3 opacity-60" />
                                </>
                            )}
                        </button>
                    )}

                    <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
                        onClick={() => { }}
                    >
                        <Heart className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        );
}

const ProductItem = memo(ProductItemInner, (prev, next) => {
    return (
        prev.product?.id === next.product?.id &&
        prev.viewMode === next.viewMode &&
        prev.loading === next.loading &&
        prev.product?.price === next.product?.price &&
        prev.product?.sale_price === next.product?.sale_price &&
        prev.product?.in_stock === next.product?.in_stock
    );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;