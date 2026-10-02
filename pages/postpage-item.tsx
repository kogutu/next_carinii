'use client';

import { useState, memo } from 'react';
import Link from 'next/link';
import { User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Typesense blog/post document shape.
 */
export interface TsBlogPost {
    id: string;
    pid: number;
    title: string;
    slug: string;
    url: string;
    post_type: string;
    status: string;

    content_text?: string;
    excerpt?: string;

    author_id: number;
    author_name: string;
    author_slug: string;

    category_ids: number[];
    category_names: string[];

    image_main?: string;
    image_large?: string;
    image_medium?: string;
    image_thumbnail?: string;

    created_at: number;
    updated_at: number;

    read_time_minutes?: number;
    word_count?: number;
    comment_count?: number;
    meta_description?: string;
}

interface BlogPostItemProps {
    post: TsBlogPost;
    loading?: boolean;
    /** Which category name to show as the badge. Defaults to first category. */
    badgeCategory?: string;
    /** Custom badge color (Tailwind bg class). Defaults to bg-[#1B7D3A] (green). */
    badgeColorClass?: string;
}

function BlogPostItemInner({
    post,
    loading = false,
    badgeCategory,
    badgeColorClass = 'bg-[#1B7D3A]',
}: BlogPostItemProps) {
    const [isHovered, setIsHovered] = useState(false);

    /* ======================== SKELETON ======================== */
    if (loading) {
        return (
            <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="w-full aspect-[16/10] bg-gray-200" />
                <div className="p-5 flex flex-col gap-3">
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                    <div className="flex gap-4 mt-3">
                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                    </div>
                </div>
            </div>
        );
    }

    if (!post) return null;

    /* ======================== DERIVED DATA ======================== */
    const image = post.image_medium || post.image_large || post.image_main || '/placeholder.jpg';
    const postSlug = post.slug || '';

    const categoryLabel = badgeCategory || post.category_names?.[0] || '';

    const excerpt =
        post.meta_description ||
        post.excerpt ||
        (post.content_text ? post.content_text.slice(0, 160) + '…' : '');

    const createdDate = post.created_at
        ? new Date(post.created_at * 1000).toLocaleDateString('pl-PL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        })
        : '';

    /* ======================== RENDER ======================== */
    return (
        <Link
            href={`/${postSlug}`}
            className="group block"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <article
                className={cn(
                    'bg-white rounded-2xl overflow-hidden border border-gray-100',
                    'transition-shadow duration-300 ease-in-out h-full flex flex-col',
                    isHovered && 'shadow-lg shadow-black/5'
                )}
            >
                {/* ---- Image ---- */}
                <div className="relative w-full aspect-[16/10] overflow-hidden bg-gray-100">
                    <img
                        src={image}
                        alt={post.title || ''}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                            'object-cover w-full h-full transition-transform duration-500 ease-in-out',
                            isHovered && 'scale-105'
                        )}
                    />

                    {/* Category badge */}
                    {categoryLabel && (
                        <span
                            className={cn(
                                'absolute top-4 left-4 text-white text-[12px] font-semibold',
                                'px-3.5 py-1.5 rounded-full z-10 leading-none',
                                badgeColorClass
                            )}
                        >
                            {categoryLabel}
                        </span>
                    )}
                </div>

                {/* ---- Content ---- */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h3 className="font-bold text-[17px] leading-snug text-gray-900 line-clamp-2 mb-2 group-hover:text-[#1B7D3A] transition-colors duration-200">
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    {excerpt && (
                        <p className="text-[14px] leading-relaxed text-gray-500 line-clamp-2 mb-4">
                            {excerpt}
                        </p>
                    )}

                    {/* Meta row — pinned to bottom */}
                    <div className="mt-auto flex items-center gap-4 text-[13px] text-gray-400 pt-2">

                        {createdDate && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" strokeWidth={1.5} />
                                {createdDate}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

const PostPageItem = memo(BlogPostItemInner, (prev, next) => {
    return (
        prev.post?.id === next.post?.id &&
        prev.loading === next.loading &&
        prev.badgeCategory === next.badgeCategory
    );
});

PostPageItem.displayName = 'BlogPostItem';

export default PostPageItem;