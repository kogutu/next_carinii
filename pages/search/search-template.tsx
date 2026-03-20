'use client';

import { ProductGrid } from '../../components/search/product-grid';
import { ProductControls } from '../../components/search/product-controls';
import { ProductPagination } from '../../components/search/product-pagination';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/lib/api';

interface SearchTemplateProps {
  searchQuery: string;
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

export default function SearchTemplate({
  searchQuery,
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
}: SearchTemplateProps) {
  if (!searchQuery) {
    return null;
  }
  return (
    <main className="flex-1 w-full md:w-auto">
      <div className="mb-6 hidden md:block">
        <h1 className="text-3xl font-bold text-gray-900">Wyniki wyszukiwania</h1>
        <p className="text-gray-600 mt-2">
          {totalProducts > 0 ? (
            <>
              Znaleźliśmy <span className="font-semibold">{totalProducts}</span> produktów dla frazy <span className="font-semibold">"{searchQuery}"</span>
            </>
          ) : (
            <>
              Brak wyników dla frazy <span className="font-semibold">"{searchQuery}"</span>
            </>
          )}
        </p>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden mb-4">
        <h2 className="text-xl font-bold text-gray-900">Wyniki dla: <span className="text-hert">{searchQuery}</span></h2>
        <p className="text-sm text-gray-600">Znaleźliśmy {totalProducts} produktów</p>
      </div>

      {/* Controls */}
      {totalProducts > 0 && (
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

      {/* Products Grid or Empty State */}
      {totalProducts === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">
            Niestety, nie znaleźliśmy produktów pasujących do Twojego wyszukiwania.
          </p>
          <p className="text-gray-500 text-sm">
            Spróbuj zmienić zapytanie lub przeglądaj nasze kategorie
          </p>
        </div>
      ) : (
        <>
          {<ProductGrid products={products} viewMode={viewMode} loading={loading} />}

          {/* Pagination */}
          {totalPages > 1 && (
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </main>
  );
}
