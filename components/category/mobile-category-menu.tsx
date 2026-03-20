'use client';

import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CategoryNode {
  id: string;
  name: string;
  url: string;
  children?: CategoryNode[];
}

interface MobileCategoryMenuProps {
  categories: CategoryNode[];
}

function CategoryList({
  categories,
  onSelect,
}: {
  categories: CategoryNode[];
  onSelect?: (id: string) => void;
}) {
  return (
    <ul className="space-y-1">
      {categories.map((cat) => (
        <li key={cat.id}>
          {cat.children && cat.children.length > 0 ? (
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors">
                {cat.name}
                <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pl-2">
                <CategoryList categories={cat.children} onSelect={onSelect} />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <a
              href={cat.url}
              onClick={() => onSelect?.(cat.id)}
              className="block px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              {cat.name}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MobileCategoryMenu({ categories }: MobileCategoryMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="outline" size="icon">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-lg">
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-4">Kategorie</h3>
          <CategoryList
            categories={categories}
            onSelect={() => setOpen(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
