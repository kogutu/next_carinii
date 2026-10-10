'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { Product } from '@/lib/api';
import ProductItem from '../../pages/product-item';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
}

// Tyle pierwszych kart renderuje się od razu po stronie serwera (nad zgięciem i tuż pod nim)
const EAGER_CARDS = 8;
// Tyle pierwszych zdjęć ładuje się z wysokim priorytetem (kandydaci na LCP)
const PRIORITY_IMAGES = 4;

/**
 * Lightweight wrapper that defers mounting its children
 * until the element scrolls into (or near) the viewport.
 * Pierwsze karty są od razu w HTML; pozostałe zostawiają w placeholderze zwykły link do produktu,
 * żeby roboty wyszukiwarek widziały pełną listę produktów kategorii.
 */
function LazyProductSlot({
  children,
  viewMode,
  initiallyVisible,
  href,
  label,
}: {
  children: React.ReactNode;
  viewMode: 'grid' | 'list';
  initiallyVisible: boolean;
  href: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(initiallyVisible);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px' } // start loading 200px before it enters viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  if (!visible) {
    // Placeholder that matches the approximate card dimensions
    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-gray-100',
          viewMode === 'grid' ? 'aspect-[2/3]' : 'h-36'
        )}
      >
        <Link href={href} className="absolute inset-0">
          <span className="sr-only">{label}</span>
        </Link>
      </div>
    );
  }

  return <div ref={ref}>{children}</div>;
}

export function ProductGrid({ products, viewMode, loading }: ProductGridProps) {
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Brak produktów w tej kategorii</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        viewMode === 'grid'
          ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4'
          : 'space-y-3'
      )}
    >
      {products.map((product, index) => (
        <LazyProductSlot
          key={product.sku}
          viewMode={viewMode}
          initiallyVisible={index < EAGER_CARDS}
          href={`/${product.slug}`}
          label={product.name}
        >
          <ProductItem
            product={product}
            viewMode={viewMode}
            loading={loading}
            priority={index < PRIORITY_IMAGES}
          />
        </LazyProductSlot>
      ))}
    </div>
  );
}