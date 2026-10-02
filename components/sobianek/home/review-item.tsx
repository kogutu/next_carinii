'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { BadgeCheck, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Typesense review document shape.
 */
export interface TsReview {
    id: string;
    pid: number;
    review_id: number;
    rating: number;
    status: string;

    author_name: string;
    author_email?: string;
    author_user_id?: number;
    is_registered_user?: boolean;

    content: string;
    content_html?: string;

    product_name: string;
    product_slug: string;
    product_url?: string;
    product_sku?: string;
    product_image?: string;
    product_categories?: string[];
    product_category_ids?: number[];

    is_reply: boolean;
    parent_id: number;
    verified_purchase?: boolean;

    created_at: number;
}

interface ReviewItemProps {
    review: TsReview;
    loading?: boolean;
}

function ReviewItemInner({ review, loading = false }: ReviewItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    /* ======================== SKELETON ======================== */
    if (loading) {
        return (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-1.5" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-5/6 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="w-12 h-12 rounded-lg bg-gray-200" />
                    <div className="h-3 bg-gray-200 rounded w-2/5" />
                </div>
            </div>
        );
    }

    if (!review) return null;

    /* ======================== DERIVED DATA ======================== */
    const rating = Math.min(Math.max(review.rating || 0, 0), 5);
    const authorInitial = (review.author_name || '?').charAt(0).toUpperCase();
    const productSlug = review.product_slug || '';
    const productImage = review.product_image || '';

    const createdDate = review.created_at
        ? new Date(review.created_at * 1000).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';

    const StarEmpty = () => (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.99999 12.1969L3.05573 15.2169L4.4 9.58141L0 5.81233L5.77507 5.34934L7.99999 0L10.2249 5.34934L16 5.81233L11.6 9.58141L12.9443 15.2169L7.99999 12.1969Z" fill="#D0D5DD" />
        </svg>
    );

    const StarFull = () => (
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.99999 12.1969L3.05573 15.2169L4.4 9.58141L0 5.81233L5.77507 5.34934L7.99999 0L10.2249 5.34934L16 5.81233L11.6 9.58141L12.9443 15.2169L7.99999 12.1969Z" fill="#FFBB52" />
        </svg>
    );

    /* ======================== RENDER ======================== */
    return (
        <article
            className={cn(
                'bg-white rounded-2xl overflow-hidden border border-gray-100',
                'transition-shadow duration-300 ease-in-out h-full flex flex-col p-5',
                isHovered && 'shadow-lg shadow-black/5'
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* ---- Header: avatar + name + date ---- */}
            <div className="flex items-center gap-3 mb-3">
                {/* Avatar initial */}
                <div className="w-10 h-10 rounded-full bg-sobianek/10 text-sobianek flex items-center justify-center text-[15px] font-bold flex-shrink-0">
                    {authorInitial}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[14px] text-gray-900 truncate">
                            {review.author_name}
                        </span>
                        {review.verified_purchase && (
                            <BadgeCheck className="w-4 h-4 text-sobianek flex-shrink-0" strokeWidth={2} />
                        )}
                    </div>
                    {createdDate && (
                        <span className="text-[12px] text-gray-400 leading-none">{createdDate}</span>
                    )}
                </div>
            </div>

            {/* ---- Stars ---- */}
            <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                    <span key={i}>{rating > i ? <StarFull /> : <StarEmpty />}</span>
                ))}
                <span className="ml-1.5 text-[13px] font-bold text-gray-900">{rating.toFixed(1)}</span>
            </div>

            {/* ---- Review text ---- */}
            <div className="relative flex-1 mb-4">
                <Quote className="absolute -top-0.5 -left-0.5 w-5 h-5 text-gray-200 rotate-180" strokeWidth={1.5} />
                <p className="text-[14px] leading-relaxed text-gray-600 line-clamp-4 pl-5">
                    {review.content}
                </p>
            </div>

            {/* ---- Product link ---- */}
            {productSlug && (
                <Link
                    href={`/${productSlug}`}
                    className="flex items-center gap-3 pt-3.5 mt-auto border-t border-gray-100 group/product"
                >
                    {productImage && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                            <img
                                src={productImage}
                                alt={review.product_name || ''}
                                loading="lazy"
                                decoding="async"
                                className="object-cover w-full h-full"
                            />
                        </div>
                    )}
                    <span className="text-[13px] font-medium text-gray-500 line-clamp-2 group-hover/product:text-sobianek transition-colors duration-200">
                        {review.product_name}
                    </span>
                </Link>
            )}
        </article>
    );
}

const ReviewItem = memo(ReviewItemInner, (prev, next) => {
    return (
        prev.review?.id === next.review?.id &&
        prev.loading === next.loading &&
        prev.review?.rating === next.review?.rating
    );
});

ReviewItem.displayName = 'ReviewItem';

export default ReviewItem;