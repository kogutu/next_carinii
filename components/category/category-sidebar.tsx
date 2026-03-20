import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
  url: string
}

interface CategorySidebarProps {
  categories: CategoryNode[];
  activeId?: string;
  parentCategory?: string;
  categoryTree?: any;
  isMobile?: boolean; // Dodajemy props zamiast useState
}

function CategoryList({
  categories,
  parentCategory,
  categoryTree,
  level = 0,
  activeId,
}: {
  categories: CategoryNode[];
  parentCategory?: string;
  categoryTree?: any;
  level?: number;
  activeId?: string;
}) {
  return (
    <ul className="space-y-1">
      {categories.map((cat) => (
        <li key={cat.id}>
          {cat.children && cat.children.length > 0 ? (
            <Collapsible defaultOpen={activeId === cat.id || categoryTree?.includes(cat.id)}>
              <CollapsibleTrigger
                className={cn(
                  'flex items-start text-left justify-between w-full px-3 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors',
                  (activeId === cat.id || categoryTree?.includes(cat.id)) && 'bg-hert/10 text-hert'
                )}
              >
                {cat.name}
                <ChevronDown className="w-4 h-4 transition-transform data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-1 pl-2">
                <CategoryList categories={cat.children} level={level + 1} activeId={activeId}
                  parentCategory={parentCategory} categoryTree={categoryTree} />
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <Link
              href={cat.url}
              className={cn(
                'block px-3 py-2 rounded text-sm hover:bg-gray-100 transition-colors',
                activeId === cat.id && 'bg-hert text-white'
              )}
            >
              {cat.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

// Główny komponent - teraz serwerowy
export default function CategorySidebar({
  categories,
  activeId,
  parentCategory,
  categoryTree,
  isMobile = false // Domyślnie false, ale możesz to ustawić po stronie serwera
}: CategorySidebarProps) {

  // Jeśli to widok mobilny, zawsze pokazujemy zamknięty collapsible
  // Jeśli desktop, pokazujemy statyczną listę
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="sticky top-4 bg-white rounded-lg border p-4">
        {isMobile ? (
          <Collapsible defaultOpen={false}>
            <CollapsibleTrigger className="flex items-center justify-between w-full text-lg font-semibold">
              <span>Kategorie</span>
              <ChevronDown className="w-5 h-5 transition-transform data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CategoryList
                categories={categories}
                activeId={activeId}
                parentCategory={parentCategory}
                categoryTree={categoryTree}
              />
            </CollapsibleContent>
          </Collapsible>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Kategorie</h3>
            <CategoryList
              categories={categories}
              activeId={activeId}
              parentCategory={parentCategory}
              categoryTree={categoryTree}
            />
          </>
        )}
      </div>
    </aside>
  );
}