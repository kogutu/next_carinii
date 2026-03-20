'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import ProductItem from '@/pages/product-item';

interface Product {
  id: number;
  image: string;
  name: string;
  hidePrice: boolean;
  price: string;
  priceNet: string;
  priceGross?: string;
  tag: string;
  url: string;
}

interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllUrl?: string;
}

// Breakpointy RWD: ile itemów widocznych na danej szerokości
const BREAKPOINTS = [
  { minWidth: 1280, visibleItems: 5.5, gap: 16 }, // xl
  { minWidth: 1024, visibleItems: 4.5, gap: 16 }, // lg
  { minWidth: 768, visibleItems: 3.5, gap: 12 },  // md
  { minWidth: 640, visibleItems: 2.5, gap: 12 },  // sm
  { minWidth: 480, visibleItems: 2.2, gap: 10 },  // xs
  { minWidth: 0, visibleItems: 1.3, gap: 8 },     // mobile
];

function getBreakpoint(width: number) {
  return BREAKPOINTS.find((bp) => width >= bp.minWidth) ?? BREAKPOINTS[BREAKPOINTS.length - 1];
}

const SWIPE_THRESHOLD = 50; // minimalna odległość swipe'a w px

export default function ProductsCarouselProducts({ title, products, viewAllUrl = '#' }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [visibleItems, setVisibleItems] = useState(5.5);
  const [gap, setGap] = useState(16);

  // Touch/swipe state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const isSwiping = useRef(false);
  const isHorizontalSwipe = useRef<boolean | null>(null);

  // Nasłuchuj zmian rozmiaru okna
  useEffect(() => {
    const handleResize = () => {
      const bp = getBreakpoint(window.innerWidth);
      setVisibleItems(bp.visibleItems);
      setGap(bp.gap);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, products.length - Math.floor(visibleItems));

  const scrollToPosition = useCallback((index: number) => {
    if (scrollContainerRef.current) {
      const itemSize = scrollContainerRef.current.scrollWidth / products.length;
      scrollContainerRef.current.scrollTo({
        left: index * itemSize,
        behavior: 'smooth',
      });
    }
  }, [products.length]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => {
      const newIndex = Math.max(0, prev - 1);
      scrollToPosition(newIndex);
      return newIndex;
    });
  }, [scrollToPosition]);

  const handleNext = useCallback(() => {
    setCurrent((prev) => {
      const newIndex = Math.min(maxIndex, prev + 1);
      scrollToPosition(newIndex);
      return newIndex;
    });
  }, [maxIndex, scrollToPosition]);

  // --- Touch / Swipe handlers ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    isSwiping.current = true;
    isHorizontalSwipe.current = null; // jeszcze nie wiemy kierunku
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwiping.current) return;

    touchEndX.current = e.touches[0].clientX;

    const deltaX = Math.abs(e.touches[0].clientX - touchStartX.current);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Ustal kierunek swipe'a po pierwszych pikselach ruchu
    if (isHorizontalSwipe.current === null && (deltaX > 5 || deltaY > 5)) {
      isHorizontalSwipe.current = deltaX > deltaY;
    }

    // Jeśli swipe jest horyzontalny, blokujemy scroll pionowy
    if (isHorizontalSwipe.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    // Tylko jeśli swipe był horyzontalny
    if (!isHorizontalSwipe.current) return;

    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff > 0) {
        // Swipe w lewo → następny
        handleNext();
      } else {
        // Swipe w prawo → poprzedni
        handlePrev();
      }
    }

    isHorizontalSwipe.current = null;
  }, [handleNext, handlePrev]);

  // Oblicz szerokość itemu na podstawie visibleItems i gap
  const itemWidthCalc = `calc((100% - ${gap}px * ${visibleItems - 0.5}) / ${visibleItems})`;

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{title}</h2>
        <Link href={viewAllUrl} className="text-purple-900 font-bold text-xs sm:text-sm md:text-base hover:underline whitespace-nowrap ml-4">
          <div className="flex items-center">   zobacz więcej <ChevronRight></ChevronRight></div>
        </Link>
      </div>

      <div className="relative group">
        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory touch-pan-y"
          style={{
            gap: `${gap}px`,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 snap-start transition-all duration-300 hover:bg-slate-50/10"
              style={{
                width: itemWidthCalc,
                minWidth: itemWidthCalc,
              }}
              draggable={false}
            >
              <ProductItem key={product.id} product={product} viewMode="grid" ></ProductItem>

            </div>
          ))}
        </div>

        {/* Przyciski nawigacji – ukryte na mobile, widoczne od sm */}
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="hidden sm:block absolute -left-3 md:-left-5 lg:-left-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-purple-900" />
        </button>
        <button
          onClick={handleNext}
          disabled={current >= maxIndex}
          className="hidden sm:block absolute -right-3 md:-right-5 lg:-right-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-900" />
        </button>

        {/* Gradient na prawej krawędzi */}
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-white to-transparent pointer-events-none rounded-lg" />
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mt-4 sm:mt-6">
        {Array.from({ length: Math.min(7, Math.ceil(products.length / Math.max(1, Math.floor(visibleItems)))) }).map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${i === Math.floor(current / Math.max(1, Math.floor(visibleItems)))
              ? 'w-5 sm:w-6 bg-hert'
              : 'w-1.5 sm:w-2 bg-gray-300'
              }`}
          />
        ))}
      </div>
    </div>
  );
}