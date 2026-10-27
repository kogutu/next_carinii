"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCallback } from "react";
import type { BlogPageData, BlogPost } from "./page";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function stripHtml(html: string): string {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "").trim();
}

function truncate(text: string, maxLen = 150): string {
    const clean = stripHtml(text);
    if (clean.length <= maxLen) return clean;
    return clean.slice(0, maxLen).replace(/\s+\S*$/, "") + "…";
}

/* ------------------------------------------------------------------ */
/*  PostCard                                                           */
/* ------------------------------------------------------------------ */

function PostCard({ post }: { post: BlogPost }) {
    const excerpt = truncate(
        post.excerpt || post.meta_description || post.content_text || "",
        150
    );
    const image =
        post.image_medium || post.image_main || post.image_thumbnail || "";
    const categories =
        post.category_names?.filter((c) => c !== "BLOG EKSPERTÓW") || [];

    return (
        <Link
            href={`/${post.slug}`}
            className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                {image ? (
                    <Image
                        src={image}
                        alt={post.title || ""}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                        <svg
                            width="48"
                            height="48"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.2}
                        >
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-3">
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {categories.slice(0, 2).map((cat) => (
                            <span
                                key={cat}
                                className="text-[11px] font-semibold tracking-wide uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>
                )}

                <h2 className="text-lg font-bold leading-snug text-neutral-900 group-hover:text-amber-700 transition-colors line-clamp-2">
                    {post.title}
                </h2>

                {excerpt && (
                    <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                        {excerpt}
                    </p>
                )}

                <Button>czytaj więcej </Button>

            </div>
        </Link>
    );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}) {
    if (totalPages <= 1) return null;

    const getPages = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        const delta = 2;
        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);
        if (rangeStart > 2) pages.push("...");
        for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
        if (rangeEnd < totalPages - 1) pages.push("...");
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <nav
            className="flex items-center justify-center gap-1.5 mt-12"
            aria-label="Paginacja"
        >
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Poprzednia strona"
            >
                ←
            </button>

            {getPages().map((page, idx) =>
                page === "..." ? (
                    <span
                        key={`dots-${idx}`}
                        className="px-2 text-neutral-300 select-none"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`min-w-[40px] h-10 text-sm font-semibold rounded-lg transition-colors ${page === currentPage
                            ? "bg-neutral-900 text-white shadow-sm"
                            : "text-neutral-600 hover:bg-neutral-100"
                            }`}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                aria-label="Następna strona"
            >
                →
            </button>
        </nav>
    );
}

/* ------------------------------------------------------------------ */
/*  Main Client Component                                              */
/* ------------------------------------------------------------------ */

interface BlogClientProps {
    initialData: BlogPageData;
}

export default function BlogClient({ initialData }: BlogClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { posts, totalFound, page: currentPage, totalPages } = initialData;

    const handlePageChange = useCallback(
        (newPage: number) => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("page", newPage.toString());
            router.push(`?${params.toString()}`, { scroll: true });
        },
        [router, searchParams]
    );

    return (
        <section className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
                        Blog Ekspertów
                    </h1>
                    <p className="mt-3 text-neutral-500 text-base sm:text-lg max-w-2xl">
                        Porady, inspiracje i wiedza od naszych specjalistów.
                    </p>

                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {posts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-neutral-400 text-lg">
                            Brak wpisów do wyświetlenia.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}