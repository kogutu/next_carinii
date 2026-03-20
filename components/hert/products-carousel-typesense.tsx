'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  image: string;
  name: string;
  price: number;
  finalPrice: number;
  specialPrice: number;
  hasSpecialPrice: boolean;
  tag: string;
  slug: string;
}

interface ProductCarouselProps {
  title: string;
  url: string;
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

function formatPrice(price: number): string {
  return price.toFixed(2);
}

async function getProducts(url: string): Promise<Product[]> {
  const response = await fetch(url);
  const data = await response.json();
  if (data.hits && Array.isArray(data.hits)) {
    return data.hits.map((hit: any) => {
      const product = hit.document || hit;
      return {
        id: String(product.id),
        image: product.image_main || product.image_small || '',
        name: product.shortdesc || product.name,
        price: Number(product.price) || 0,
        finalPrice: Number(product.final_price) || 0,
        specialPrice: Number(product.special_price) || 0,
        hasSpecialPrice: Boolean(product.has_special_price),
        tag: product.new === '1' ? 'NOWOŚĆ' : '',
        slug: product.slug || '',
      };
    });
  }

  return [];
}

export default function ProductsCarouselTypesense({ title, url, viewAllUrl = '#' }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [visibleItems, setVisibleItems] = useState(5.5);
  const [gap, setGap] = useState(16);

  useEffect(() => {
    getProducts(url).then(setProducts);
  }, [url]);

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

  const handlePrev = () => {
    const newIndex = Math.max(0, current - 1);
    setCurrent(newIndex);
    scrollToPosition(newIndex);
  };

  const handleNext = () => {
    const newIndex = Math.min(maxIndex, current + 1);
    setCurrent(newIndex);
    scrollToPosition(newIndex);
  };

  const scrollToPosition = (index: number) => {
    if (scrollContainerRef.current) {
      const itemSize = scrollContainerRef.current.scrollWidth / products.length;
      scrollContainerRef.current.scrollTo({
        left: index * itemSize,
        behavior: 'smooth',
      });
    }
  };

  // Oblicz szerokość itemu na podstawie visibleItems i gap
  const itemWidthCalc = `calc((100% - ${gap}px * ${visibleItems - 0.5}) / ${visibleItems})`;

  return (
    <div className="max-w-7xl mx-auto py-8 md:py-12 px-4">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold flex gap-2">{title}</h2>
        <Link href={viewAllUrl} className="text-hert flex items-center gap-2 font-bold text-xs sm:text-sm md:text-base hover:underline whitespace-nowrap ml-4">
          ZOBACZ WSZYSTKO <ArrowRight className="h-4" />
        </Link>
      </div>

      <div className="relative group">
        {/* Carousel Container */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-hidden scroll-smooth snap-x snap-mandatory"
          style={{
            gap: `${gap}px`,
          }}
        >
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${product.slug}`}
              className="flex-shrink-0 snap-start transition-all duration-300 hover:bg-slate-50/10"
              style={{
                width: itemWidthCalc,
                minWidth: itemWidthCalc,
              }}
            >
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer">
                {/* Obrazek – responsywna wysokość */}
                <div className="relative bg-gray-100 h-32 sm:h-40 md:h-48 flex-shrink-0">
                  <img
                    src={product.image || '/placeholder.svg'}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 sm:p-3 md:p-4"
                  />
                  {product.tag && (
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-hert text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 rounded">
                      {product.tag}
                    </span>
                  )}
                </div>

                {/* Treść */}
                <div className="p-2 sm:p-3 md:p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-[11px] sm:text-xs md:text-sm mb-1 sm:mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  <div>
                    {product.hasSpecialPrice && product.specialPrice > 0 ? (
                      <>
                        <p className="text-gray-400 line-through text-[10px] sm:text-xs">
                          {formatPrice(product.price)} zł
                        </p>
                        <p className="text-hcar font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
                          {formatPrice(product.specialPrice)} zł
                        </p>
                      </>
                    ) : (
                      <p className="text-hcar font-bold text-xs sm:text-sm mb-0.5 sm:mb-1">
                        {formatPrice(product.finalPrice)} zł
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Przyciski nawigacji – ukryte na mobile, widoczne od sm */}
        <button
          onClick={handlePrev}
          disabled={current === 0}
          className="hidden sm:block absolute -left-3 md:-left-5 lg:-left-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-hcar" />
        </button>
        <button
          onClick={handleNext}
          disabled={current >= maxIndex}
          className="hidden sm:block absolute -right-3 md:-right-5 lg:-right-6 top-1/3 transform -translate-y-1/2 bg-white border border-gray-300 p-1.5 sm:p-2 md:p-3 rounded-full hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all duration-200 z-10"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-hcar" />
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