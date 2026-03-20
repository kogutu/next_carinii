import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

import { useRouter } from 'next/navigation';
import { useRef, useState, useEffect, useCallback } from "react";

interface Item {
    id: string;
    image: string;
    url: string;
    price: number;
    sku: string;
    status: number;
    variant_name: string;
    img: string;
    alt: string;
}

export function Carousel45({ items }: { items: Array<Item> }) {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const thumbnailContainerRef = useRef<HTMLDivElement>(null);

    const router = useRouter();

    // Update max scroll when container resizes or items change
    const updateMaxScroll = useCallback(() => {
        if (thumbnailContainerRef.current) {
            const container = thumbnailContainerRef.current;
            // Znajdź właściwy element scrollujący - dziecko z overflow
            const scrollableElement = container.querySelector('.overflow-x-auto') as HTMLElement || container;
            const max = scrollableElement.scrollWidth - scrollableElement.clientWidth;
            setMaxScroll(Math.max(0, max));
            setScrollPosition(scrollableElement.scrollLeft);
        }
    }, []);

    // Initialize and update on resize
    useEffect(() => {
        // Opóźnij pierwszą kalkulację, aby DOM się w pełni wyrenderował
        const timer = setTimeout(() => {
            updateMaxScroll();
        }, 100);

        const handleResize = () => {
            updateMaxScroll();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize);
        };
    }, [updateMaxScroll, items.length, showAll]);

    const showLeftArrow = !showAll && scrollPosition > 10;
    const showRightArrow = !showAll && scrollPosition < maxScroll - 10;

    const scrollThumbnails = useCallback((direction: "left" | "right") => {
        if (!thumbnailContainerRef.current) return;

        const container = thumbnailContainerRef.current;
        const scrollableElement = container.querySelector('.overflow-x-auto') as HTMLElement || container;
        const itemWidth = scrollableElement.children[0]?.clientWidth || 0;
        const gap = 8; // gap-2 = 0.5rem = 8px
        const scrollAmount = itemWidth + gap;

        if (direction === "left") {
            const newPosition = Math.max(0, scrollPosition - scrollAmount);
            scrollableElement.scrollTo({ left: newPosition, behavior: "smooth" });
            setScrollPosition(newPosition);
        } else {
            const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
            scrollableElement.scrollTo({ left: newPosition, behavior: "smooth" });
            setScrollPosition(newPosition);
        }
    }, [scrollPosition, maxScroll]);

    const handleThumbnailClick = (idx: any) => {
        console.log(idx)
        const url = "/" + idx.url.split("/").pop();
        console.log(url);
        // router.push("/catalog/" + url);
    };

    const handleThumbnailScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        setScrollPosition(target.scrollLeft);
    };

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            scrollThumbnails("left");
        } else if (e.key === 'ArrowRight') {
            scrollThumbnails("right");
        }
    }, [scrollThumbnails]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return (
        <div className="relative  bg-[#f2f2f2]  rounded-lg mb-2">
            <div className="text-md leading-[14px] text-mpgray font-medium pt-4 pl-4 flex justify-between pr-2">
                <span className="text-sm ">Wersje kolorystyczne:</span>
                {items.length > 3 && (
                    <span
                        className="text-muted-foreground text-sm flex items-center cursor-pointer"
                        onClick={() => setShowAll(!showAll)}
                    >
                        zobacz wszystkie <ChevronRight className="h-4 w-4" />
                    </span>
                )}
            </div>

            {/* Mobile Carousel */}
            <div className="relative pl-3 pt-4 p-2">
                {/* Left Arrow */}
                {showLeftArrow && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8"
                        onClick={() => scrollThumbnails("left")}
                        aria-label="Scroll left"
                        type="button"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}

                {/* Scrollable Container */}
                <div
                    ref={thumbnailContainerRef}
                    className={`px-1 relative    ${showAll ? 'w-full' : ''}`}
                >
                    <div
                        className={showAll
                            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-2"
                            : "flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-1"
                        }
                        onScroll={!showAll ? handleThumbnailScroll : undefined}
                    >
                        {items.map((item, idx) => (
                            <button
                                key={item.id || idx}
                                onClick={() => handleThumbnailClick(item)}
                                className={`relative aspect-[4/3] bg-muted rounded-xl overflow-hidden border border-gray-50 cursor-pointer transition-all hover:border-b-2 hover:border-mpgreen ${showAll ? '' : 'snap-start flex-shrink-0'
                                    }`}
                                style={
                                    !showAll ? {
                                        width: "calc((100vw - 2rem) / 5)",
                                        maxWidth: "140px",
                                        minWidth: "100px",
                                    } : undefined
                                }
                                type="button"
                            >
                                <Image
                                    src={item.image || "/placeholder.svg"}
                                    alt={item.alt || item.variant_name || `Product ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Arrow */}
                {showRightArrow && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full w-8 h-8"
                        onClick={() => scrollThumbnails("right")}
                        aria-label="Scroll right"
                        type="button"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    );
}