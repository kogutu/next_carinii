'use client';

import { useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api';

interface ProductItemProps {
    product: Product;
    loading: boolean;
    viewMode: 'grid' | 'list';
}

function ProductItemInner({ product, viewMode, loading }: ProductItemProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [codeCopied, setCodeCopied] = useState(false);

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
                    <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-5 w-7 bg-gray-200 rounded-sm" />
                        ))}
                    </div>
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/3 mt-auto" />
                </div>
                <div className='h-16'></div>
            </div>
        );
    }

    if (!product) return null;

    const imageMain = product?.image_small || product?.image_main || '/placeholder.jpg';
    const imageHover = product?.image_thumbnail || imageMain;
    const productSlug = product?.slug || '';
    const price = product?.price;
    const specialPrice = product?.special_price;
    const hasSpecialPrice = product?.has_special_price && specialPrice && specialPrice > 0;
    const displayPrice = hasSpecialPrice ? specialPrice : price;
    const isNew = product?.new === '1' || product?.categories?.includes('NOWOŚCI');
    const sku = product?.sku || '';
    const shortName = product?.name?.split('CARINII')[0]?.trim() || product?.name;

    const sizeQty = product?.size_qty || {};

    let lastItems = 0;
    for (let r in sizeQty) {
        if (sizeQty[r] < 2) lastItems++;
    }

    const allSizes = Object.keys(sizeQty)
        .map(key => ({
            size: key.replace('roz', ''),
            qty: sizeQty[key],
        }))
        .sort((a, b) => Number(a.size) - Number(b.size));

    const promoCode = product?.promo_code || 'WOMAN';
    const promoPercent = product?.save_percent && product.save_percent < 100
        ? (100 - product.save_percent)
        : null;

    const handleCopyCode = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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

    /* ======================== GRID ======================== */
    if (viewMode === 'grid')
        return (
            <div
                className="flex flex-col overflow-hidden group relative"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Link href={`/${productSlug}`} className="block relative flex-1 min-h-0 bg-gray-100">
                    <div className="relative w-full h-full overflow-hidden aspect-[2/3]">
                        <img
                            src={imageMain}
                            alt={product?.name || ''}
                            loading="lazy"
                            decoding="async"
                            className={cn(
                                'object-cover absolute t-0 w-full h-full brightness-[0.96] transition-all duration-500 ease-in-out',
                                isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                            )}
                        />
                        <img
                            src={imageHover}
                            alt={product?.name || ''}
                            loading="lazy"
                            decoding="async"
                            className={cn(
                                'object-cover absolute w-full h-full brightness-[0.96] transition-all duration-500 ease-in-out',
                                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            )}
                        />
                    </div>

                    {isNew && (
                        <span className="absolute top-2.5 left-2.5 bg-black text-white text-[10px] font-bold uppercase px-2.5 py-1 tracking-widest z-10">
                            NEW
                        </span>
                    )}
                    {lastItems > 2 && (
                        <span className={`flex items-center gap-2 bg-hcar text-white text-[10px] font-bold px-2 py-1 uppercase left-2.5 m-auto absolute
                            ${isNew ? 'top-9' : 'top-2.5'}`}>
                            ostatnie sztuki
                        </span>
                    )}

                    <button
                        className="absolute top-2.5 right-2.5 text-gray-500 hover:text-red-500 transition-colors z-10"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                    >
                        <Heart className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                </Link>

                <div className="px-3 pt-2.5 pb-2 flex flex-col gap-1 text-center">
                    {allSizes.length > 0 && (
                        <div className="relative flex gap-[2px] flex-wrap justify-center">
                            {allSizes.map(({ size, qty }) => (
                                <span
                                    key={size}
                                    className={cn(
                                        'text-[11px] border px-1.5 py-[5px] min-w-[28px] text-center leading-tight relative group/size',
                                        qty > 0
                                            ? 'text-gray-700 border-gray-300 bg-white'
                                            : 'text-gray-300 border-gray-200 opacity-50 line-through'
                                    )}
                                >
                                    {size}
                                    {(qty < 2 && qty > 0) && (
                                        <>
                                            <span className="text-hcar text-[7px] absolute top-0 right-0">■</span>
                                            <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover/size:opacity-100 z-10">
                                                Ostatnia sztuka
                                            </span>
                                        </>
                                    )}
                                </span>
                            ))}
                        </div>
                    )}

                    <Link href={`/${productSlug}`}>
                        <h3 className="font-semibold cfont uppercase mt-4 truncate text-[14px] text-gray-900 line-clamp-2 leading-snug mt-0.5">
                            {shortName}
                        </h3>
                    </Link>

                    <p className="text-[11px] mb-2 text-gray-400 uppercase tracking-wide leading-none">
                        CARINII {sku}
                    </p>

                    {displayPrice != null && displayPrice > 0 && (
                        <div className="flex items-baseline gap-2 mt-0.5 justify-center">
                            {hasSpecialPrice && price ? (
                                <>
                                    <span className="text-sm text-gray-400 line-through">
                                        {price.toFixed(2).replace('.', ',')} zł
                                    </span>
                                    <span className="text-[15px] font-bold text-red-600">
                                        {displayPrice.toFixed(2).replace('.', ',')} zł
                                    </span>
                                </>
                            ) : (
                                <span className="text-[15px] font-bold text-black">
                                    {displayPrice.toFixed(2).replace('.', ',')} zł
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {promoPercent ? (
                    <button
                        onClick={handleCopyCode}
                        className="bg-black hover:bg-gray-800 text-white text-center py-2 px-2 cursor-pointer transition-colors flex items-center justify-center gap-2"
                    >
                        {codeCopied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                <span className="text-xs font-medium">Skopiowano kod!</span>
                            </>
                        ) : (
                            <>
                                <span className="text-sm font-bold">-{promoPercent}%</span>
                                <span className="text-xs">
                                    z kodem: <strong>{promoCode}</strong>
                                </span>
                                <Copy className="w-3 h-3 opacity-60" />
                            </>
                        )}
                    </button>
                ) : (
                    <div className="text-center py-2 px-2 cursor-pointer transition-colors flex items-center justify-center gap-2">&nbsp;</div>
                )}
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
                            alt={product?.name || ''}
                            fill
                            loading="lazy"
                            className={cn(
                                'object-cover brightness-[0.96] transition-all duration-500',
                                isHovered ? 'opacity-0' : 'opacity-100'
                            )}
                        />
                        <Image
                            src={imageHover}
                            alt={product?.name || ''}
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
                    {lastItems > 2 && (
                        <span className="flex items-center gap-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase m-auto rounded-xl absolute top-9">
                            <span>ostatnie sztuki</span>
                        </span>
                    )}
                </div>

                <div className="flex flex-col justify-center flex-1 py-3 pr-4 relative">
                    {allSizes.length > 0 && (
                        <div className="flex gap-[3px] flex-wrap mb-2">
                            {allSizes.map(({ size, qty }) => (
                                <span
                                    key={size}
                                    className={cn(
                                        'text-[11px] border px-1.5 py-[2px] min-w-[28px] text-center leading-tight',
                                        qty > 0
                                            ? 'text-gray-700 border-gray-300 bg-white'
                                            : 'text-gray-300 border-gray-200 bg-gray-50 line-through'
                                    )}
                                >
                                    {size}
                                </span>
                            ))}
                        </div>
                    )}

                    <Link href={`/${productSlug}`}>
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-0.5">
                            {shortName}
                        </h3>
                    </Link>

                    <p className="text-[11px] text-gray-400 mb-2 uppercase tracking-wide">
                        CARINII {sku}
                    </p>

                    {displayPrice != null && displayPrice > 0 && (
                        <div className="flex items-baseline gap-2">
                            {hasSpecialPrice && price ? (
                                <>
                                    <span className="text-sm text-gray-400 line-through">
                                        {price.toFixed(2).replace('.', ',')} zł
                                    </span>
                                    <span className="text-[15px] font-bold text-red-600">
                                        {displayPrice.toFixed(2).replace('.', ',')} zł
                                    </span>
                                </>
                            ) : (
                                <span className="text-[15px] font-bold text-black">
                                    {displayPrice.toFixed(2).replace('.', ',')} zł
                                </span>
                            )}
                        </div>
                    )}

                    {promoPercent && (
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
        prev.product?.sku === next.product?.sku &&
        prev.viewMode === next.viewMode &&
        prev.loading === next.loading &&
        prev.product?.price === next.product?.price &&
        prev.product?.special_price === next.product?.special_price
    );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;