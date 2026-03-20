'use client';

import { ProductGrid } from './product-grid';
import { ProductControls } from './product-controls';
import { ProductPagination } from './product-pagination';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/lib/api';

interface ProductTemplateProps {
  categoryName?: string;
  products: Product[];
  totalProducts: number;
  currentPage: number;
  perPage: number;
  viewMode: 'grid' | 'list';
  loading: boolean;
  error: string | null;
  totalPages: number;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sort: string) => void;
  onPerPageChange: (perPage: number) => void;
  onPageChange: (page: number) => void;
}

export function ProductTemplate({
  categoryName,
  products,
  totalProducts,
  currentPage,
  perPage,
  viewMode,
  loading,
  error,
  totalPages,
  onViewModeChange,
  onSortChange,
  onPerPageChange,
  onPageChange,
}: ProductTemplateProps) {
  return (
    <main className="flex-1 w-full md:w-auto">
      <div className="mb-6 hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900">{categoryName || 'Kategoria'}</h1>
        <p className="text-gray-600 mt-2">Znaleźliśmy {totalProducts} produktów</p>
      </div>

      {/* Controls */}
      {(
        <ProductControls
          totalProducts={totalProducts}
          currentPage={currentPage}
          perPage={perPage}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          onSortChange={onSortChange}
          onPerPageChange={onPerPageChange}
        />
      )}


      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {<ProductGrid products={products} viewMode={viewMode} loading={loading} />}

      {/* Pagination */}
      {totalPages > 1 && (
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </main>
  );
}
