import { useState } from "react";

// Type definitions
interface MenuItem {
    vis: string;
    id: string;
    label: string;
    count: number;
    link: string;
    child?: MenuItem[];
}

interface MenuItemsProps {
    items: MenuItem[];
    level?: number;
    onItemClick?: () => void;
    parentLabel?: string;
}

interface MobileMenuProps {
    items: MenuItem[];
    isOpen: boolean;
    onClose: () => void;
}



// Recursive component for mobile menu items
const MobileMenuItems = ({ items, level = 0, onItemClick, parentLabel }: MenuItemsProps) => {
    const [openItems, setOpenItems] = useState<string[]>([]);

    const toggleItem = (id: string) => {
        setOpenItems(prev =>
            prev.includes(id)
                ? prev.filter(itemId => itemId !== id)
                : [...prev, id]
        );
    };

    return (
        <div className={`space-y-1 ${level > 0 ? 'ml-4 border-l pl-4' : ''}`}>
            {parentLabel && level === 1 && (
                <div className="px-3 py-2 text-sm font-semibold text-muted-foreground bg-muted/50 rounded-md mb-1">
                    {parentLabel}
                </div>
            )}

            {items.map((item) => {
                if (item.vis !== "1") return null;

                const hasChildren = item.child && item.child.length > 0;
                const isOpen = openItems.includes(item.id);

                if (hasChildren) {
                    return (
                        <div key={item.id}>
                            <button
                                onClick={() => toggleItem(item.id)}
                                className="w-full flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors text-left"
                            >
                                <span className="font-medium">{item.label}</span>
                                <div className="flex items-center gap-2">

                                    <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>
                            {isOpen && (
                                <MobileMenuItems
                                    items={item.child!}
                                    level={level + 1}
                                    onItemClick={onItemClick}
                                    parentLabel={item.label}
                                />
                            )}
                        </div>
                    );
                }

                return (
                    <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onItemClick}
                        className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors block"
                    >
                        <span>{item.label}</span>

                    </a>
                );
            })}
        </div>
    );
};

// Mobile menu component
export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
    if (!isOpen) return null;

    const mainCategories = items.filter(item => item.vis === "1");

    return (
        <div className="fixed inset-0 z-50 md:hidden">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-background shadow-lg animate-in slide-in-from-right duration-300">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">Menu</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-md hover:bg-accent"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100%-73px)]">
                    <nav className="space-y-1">
                        {mainCategories.map((category) => {
                            const hasChildren = category.child && category.child.length > 0;

                            if (hasChildren) {
                                return (
                                    <MobileMenuItems
                                        key={category.id}
                                        items={[category]}
                                        onItemClick={onClose}
                                    />
                                );
                            }

                            return (
                                <a
                                    key={category.id}
                                    href={category.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={onClose}
                                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent transition-colors block font-medium"
                                >
                                    <span>{category.label}</span>

                                </a>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </div>
    );
};
