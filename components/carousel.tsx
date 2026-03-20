'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode, useRef, useState } from 'react';

interface CarouselProps<T> {
    title: string;
    items: T[];
    renderItem: (item: T, index: number) => ReactNode;
    isLoading?: boolean;
    skeletonCount?: number;
    renderSkeleton?: () => ReactNode;
    showViewAll?: boolean;
    viewAllText?: string;
    onViewAll?: () => void;
}

const DefaultSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden h-full">
        <div className="bg-gray-200 h-40 sm:h-48 animate-pulse" />
        <div className="p-3 sm:p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
            </div>
        </div>
    </div>
);

export default function Carousel<T>({
    title,
    items,
    renderItem,
    isLoading = false,
    skeletonCount = 8,
    renderSkeleton = DefaultSkeleton,
    showViewAll = true,
    viewAllText = 'ZOBACZ WSZYSTKO',
    onViewAll,
}: CarouselProps<T>) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [current, setCurrent] = useState(0);

    const displayItems = isLoading ? Array.from({ length: skeletonCount }) : items;
    const maxIndex = Math.max(0, displayItems.length - 1);

    const handlePrev = () => {
        setCurrent((prev) => Math.max(0, prev - 1));
        scrollToPosition(Math.max(0, current - 1));
    };

    const handleNext = () => {
        setCurrent((prev) => Math.min(maxIndex, prev + 1));
        scrollToPosition(Math.min(maxIndex, current + 1));
    };

    const scrollToPosition = (index: number) => {
        if (scrollContainerRef.current) {
            const itemSize = scrollContainerRef.current.scrollWidth / displayItems.length;
            scrollContainerRef.current.scrollTo({
                left: index * itemSize,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{title}</h2>
                {showViewAll && (
                    <button
                        onClick={onViewAll}
                        className="text-hcar font-bold text-sm md:text-base hover:text-purple-700 transition-colors"
                    >
                        {viewAllText}
                    </button>
                )}
            </div>

            <div className="relative group">
                <div
                    ref={scrollContainerRef}
                    className="flex gap-4 overflow-x-hidden scroll-smooth snap-x snap-mandatory"
                >
                    {displayItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 snap-center transition-all duration-300 hover:scale-105"
                            style={{
                                width: `calc((100% - 12px * 4.5) / 5.5)`,
                                minWidth: `calc((100% - 12px * 4.5) / 5.5)`,
                            }}
                        >
                            {isLoading ? (
                                renderSkeleton()
                            ) : (
                                renderItem(item as T, index)
                            )}
                        </div>
                    ))}
                </div>

                <button
                    onClick={handlePrev}
                    disabled={current === 0 || isLoading}
                    className="absolute -left-4 sm:-left-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-2 sm:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
                >
                    <ChevronLeft size={20} className="text-hcar" />
                </button>

                <button
                    onClick={handleNext}
                    disabled={current === maxIndex || isLoading}
                    className="absolute -right-4 sm:-right-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-2 sm:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
                >
                    <ChevronRight size={20} className="text-hcar" />
                </button>

                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-lg" />
            </div>

            <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: Math.min(5, Math.ceil(displayItems.length / 2)) }).map((_, i) => (
                    <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${i === Math.floor(current / 2)
                            ? 'w-6 bg-hert'
                            : 'w-2 bg-gray-300'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
