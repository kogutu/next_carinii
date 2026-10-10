'use client';

import { ProductGrid } from '../../components/search/product-grid';
import { ProductControls } from '../../components/search/product-controls';
import { ProductPagination } from '../../components/search/product-pagination';
import { Spinner } from '@/components/ui/spinner';
import type { Product } from '@/lib/api';
import Link from 'next/link';
import { ENTER, EYEBROW, SurfaceCard } from '@/components/ui/surface';
import { cn } from '@/lib/utils';

const SUGGESTED_LINKS = [
  { href: '/nowosci.html', label: 'Nowości' },
  { href: '/obuwie.html', label: 'Obuwie' },
  { href: '/torebki.html', label: 'Torebki' },
  { href: '/wyprzedaz.html', label: 'Wyprzedaż' },
];

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
    <main className="w-full flex-1 md:w-auto">
      <header className={cn(ENTER, 'mb-8')}>
        <p className={EYEBROW}>Wyszukiwanie</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {totalProducts > 0 ? 'Wyniki dla' : 'Brak wyników dla'} „{searchQuery}”
        </h1>
        {totalProducts > 0 && (
          <p className="mt-2 text-sm tabular-nums text-muted-foreground">
            Znaleźliśmy {totalProducts} {totalProducts === 1 ? 'produkt' : totalProducts < 5 ? 'produkty' : 'produktów'}
          </p>
        )}
      </header>

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
        <div role="alert" className="mb-6 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Products Grid or Empty State */}
      {totalProducts === 0 ? (
        <SurfaceCard className="mx-auto max-w-xl text-center sm:p-12">
          <p className="text-lg font-semibold text-foreground">Nie znaleźliśmy pasujących produktów</p>
          <p className="mt-2 text-pretty text-sm text-muted-foreground">
            Spróbuj zmienić zapytanie albo przeglądaj nasze kategorie.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGGESTED_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="inline-flex h-11 items-center rounded-full bg-muted px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </SurfaceCard>
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
