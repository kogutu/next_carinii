'use client';
import { useCategoryZustand } from '@/stores/categoryZustand';

import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
}

export function ProductPagination({ currentPage, totalPages }: ProductPaginationProps) {
  const setPage = useCategoryZustand((state) => state.setPage);

  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page == currentPage) return;
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];

    // KONFIGURACJA:
    // Jeśli stron jest mało (np. 15), pokaż wszystkie bez kropek
    const showAllThreshold = 15;
    if (totalPages <= showAllThreshold) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    // Algorytm dla dużej ilości stron (np. 50+)
    const delta = 2; // Ile stron pokazać obok obecnej
    for (let i = 1; i <= totalPages; i++) {
      if (
        i == 1 ||
        i == totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        if (pages.length > 0 && typeof pages[pages.length - 1] == 'number') {
          const lastPage = pages[pages.length - 1] as number;
          if (i - lastPage == 2) {
            pages.push(lastPage + 1); // Wypełnij lukę zamiast kropek, jeśli brakuje tylko jednej liczby
          } else if (i - lastPage > 2) {
            pages.push('ellipsis');
          }
        }
        pages.push(i);
      }
    }
    return pages;
  };

  return (

    <nav
      aria-label="Nawigacja po stronach"
      className="mt-12 mb-8 flex flex-col items-center gap-4"
    >
      {/* Informacja o postępie dla lepszego UX */}
      <p className="text-sm text-muted-foreground font-medium">
        Strona <span className="text-foreground">{currentPage}</span> z <span className="text-foreground">{totalPages}</span>
      </p>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Pierwsza strona (opcjonalne, dla power-userów) */}
        <PaginationButton
          onClick={() => handlePageChange(1)}
          disabled={currentPage == 1}
          icon={<ChevronsLeft className="h-4 w-4" />}
          label="Pierwsza strona"
          className="hidden sm:flex"
        />

        {/* Poprzednia */}
        <PaginationButton
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage == 1}
          icon={<ChevronLeft className="h-4 w-4" />}
          label="Poprzednia"
        />

        {/* Numery stron */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => (
            page == 'ellipsis' ? (
              <span key={`sep-${idx}`} className="px-1 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </span>
            ) : (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                aria-current={page == currentPage ? 'page' : undefined}
                className={`
                  min-w-[40px] h-10 px-3 flex items-center justify-center rounded-lg
                  text-sm font-semibold transition-all
                  ${page == currentPage
                    ? 'bg-primary text-primary-foreground shadow-lg ring-2 ring-primary ring-offset-2'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Następna */}
        <PaginationButton
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage == totalPages}
          icon={<ChevronRight className="h-4 w-4" />}
          label="Następna"
        />

        {/* Ostatnia strona */}
        <PaginationButton
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage == totalPages}
          icon={<ChevronsRight className="h-4 w-4" />}
          label="Ostatnia strona"
          className="hidden sm:flex"
        />
      </div>
    </nav>
  );
}

// Pomocniczy komponent przycisku dla czystszego kodu
function PaginationButton({
  onClick,
  disabled,
  icon,
  label,
  className = ""
}: {
  onClick: () => void,
  disabled: boolean,
  icon: React.ReactNode,
  label: string,
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`
        flex h-10 w-10 items-center justify-center rounded-lg
        border border-input bg-background
        text-muted-foreground transition-colors
        hover:bg-accent hover:text-accent-foreground
        disabled:opacity-30 disabled:pointer-events-none
        ${className}
      `}
    >
      {icon}
    </button>
  );
}