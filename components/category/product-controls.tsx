'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Grid3x3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryZustand } from '@/stores/categoryZustand';
import { ProductFilters } from './filters';

interface ProductControlsProps {
  totalProducts: number;
  currentPage: number;
  facets: any;
  perPage: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onSortChange: (sortBy: string) => void;
  onPerPageChange: (perPage: number) => void;
}

export function ProductControls({
  totalProducts,
  currentPage,
  facets,
  perPage,
  viewMode,
  onViewModeChange,
  onSortChange,
  onPerPageChange,
}: ProductControlsProps) {
  const currentPageZustand = useCategoryZustand((state) => state.page)

  const start = (currentPageZustand - 1) * perPage + 1;
  const end = Math.min(currentPageZustand * perPage, totalProducts);
  return (
    <div className="flex flex-col gap-4 mb-6 pb-4 border-b">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <p className="text-sm text-gray-600">
          Wyświetlanie {start}-{end} z {totalProducts} produktów
        </p>


        <div className="flex flex-wrap gap-3 items-center">
          <Select value={perPage.toString()} onValueChange={(v) => onPerPageChange(parseInt(v))}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Na stronę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="80">80 na stronę</SelectItem>
              <SelectItem value="100">100 na stronę</SelectItem>
              <SelectItem value="140">140 na stronę</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={onSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sortuj" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdat:desc">Wg nowości</SelectItem>
              <SelectItem value="name:asc">Nazwa A-Z</SelectItem>
              <SelectItem value="name:desc">Nazwa Z-A</SelectItem>
              <SelectItem value="price:asc">Cena rosnąco</SelectItem>
              <SelectItem value="price:desc">Cena malejąco</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className={cn('px-2', viewMode === 'grid' && 'bg-hert')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className={cn('px-2', viewMode === 'list' && 'bg-hert')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
