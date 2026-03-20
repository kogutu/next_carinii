'use client';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui/navigation-menu';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface CategoryNode {
  id: string;
  name: string;
  children?: CategoryNode[];
  url: string
}

interface CategoryMenuProps {
  categories: CategoryNode[];
}

function CategoryLevel({ categories, level = 0 }: { categories: CategoryNode[]; level?: number }) {
  if (level > 4) return null;

  return (
    <ul className="space-y-1">
      {categories.map((cat) => (
        <li key={cat.id}>
          {cat.children && cat.children.length > 0 ? (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-auto py-2 px-3 text-sm font-medium hover:bg-gray-100">
                    {cat.name}
                    <ChevronRight className="ml-2 w-4 h-4 transition-transform" />
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="absolute left-full top-0 min-w-max">
                    <div className="p-2 bg-white border rounded-lg shadow-lg">
                      <CategoryLevel categories={cat.children} level={level + 1} />
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          ) : (
            <Link
              href={cat.url}
              className="block py-2 px-3 text-sm hover:bg-gray-100 rounded transition-colors"
            >
              {cat.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function CategoryMenu({ categories }: CategoryMenuProps) {
  return (
    <nav className="hidden md:block">
      <NavigationMenu orientation="vertical" className="w-64">
        <NavigationMenuList className="flex-col items-start gap-0">
          {categories.map((cat) => (
            <NavigationMenuItem key={cat.id} className="w-full">
              {cat.children && cat.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger className="w-full justify-between px-3 py-2 h-auto">
                    {cat.name}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="p-2 bg-white border rounded-lg shadow-lg absolute left-64">
                      <CategoryLevel categories={cat.children} level={1} />
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <Link href={cat.url} legacyBehavior passHref>
                  <NavigationMenuLink className="block py-2 px-3 text-sm hover:bg-gray-100 rounded transition-colors w-full">
                    {cat.name}
                  </NavigationMenuLink>
                </Link>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <NavigationMenuViewport />
      </NavigationMenu>
    </nav>
  );
}
