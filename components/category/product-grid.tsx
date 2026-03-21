'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api';
import ProductItem from '../../pages/product-item';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
}

/**
 * Lightweight wrapper that defers mounting its children
 * until the element scrolls into (or near) the viewport.
 */
function LazyProductSlot({
  children,
  viewMode,
}: {
  children: React.ReactNode;
  viewMode: 'grid' | 'list';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

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
  }, []);

  if (!visible) {
    // Placeholder that matches the approximate card dimensions
    return (
      <div
        ref={ref}
        className={cn(
          'bg-gray-100',
          viewMode === 'grid' ? 'aspect-[2/3]' : 'h-36'
        )}
      />
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
      {products.map((product) => (
        <LazyProductSlot key={product.sku} viewMode={viewMode}>
          <ProductItem
            product={product}
            viewMode={viewMode}
            loading={loading}
          />
        </LazyProductSlot>
      ))}
    </div>
  );
}