'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/api';
import ProductItem from '../../pages/product-item';

interface ProductGridProps {
  products: Product[];
  viewMode: 'grid' | 'list';
  loading: boolean;
}

export function ProductGrid({ products, viewMode, loading }: ProductGridProps) {
  if (products.length === 0) {
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
        <ProductItem key={product.sku} product={product} viewMode={viewMode} loading={loading} />
      ))}
    </div>
  );
}
