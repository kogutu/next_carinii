import { useState, useRef, useEffect, useCallback } from "react";
import navigationData from "@/data/menu.json";
import Link from "next/link";
import Image from "next/image";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface Subcategory {
    id: number;
    name: string;
    href: string;
}

interface Category {
    id: number;
    name: string;
    href: string;
    image: string;
    subcategories: Subcategory[];
}

interface MenuItem {
    label: string;
    href: string;
    icon?: string;
    highlight?: boolean;
    isMegaMenu?: boolean;
    categories?: Category[];
}

// ─── ICONS ─────────────────────────────────────────────────────────────────────
const ChevronDown = ({ open, className = "" }: { open: boolean; className?: string }) => (
    <svg
        width="10" height="10" viewBox="0 0 10 10" fill="none"
        stroke="black" strokeWidth="1.5"
        className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : ""} ${className}`}
    >
        <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
);

const ArrowRight = ({ active }: { active: boolean }) => (
    <svg
        width="14" height="14" viewBox="0 0 14 14" fill="black"
        stroke="black" strokeWidth="1.5"
        className={`h-4 w-4 transition-all duration-300 ${active ? "opacity-50 translate-x-0" : "opacity-0 -translate-x-1"}`}
    >
        <path d="M5 3L9 7L5 11" />
    </svg>
);

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M6 6l12 12M18 6L6 18" />
    </svg>
);

const ImagePlaceholderIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-stone-300">
        <rect x="6" y="10" width="36" height="28" rx="3" />
        <circle cx="17" cy="21" r="4" />
        <path d="M6 32L16 24L24 30L32 22L42 30" />
    </svg>
);

// ─── HOOKS ─────────────────────────────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia(query);
        setMatches(mql.matches);
        const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, [query]);
    return matches;
}

// ─── MOBILE DRAWER ─────────────────────────────────────────────────────────────
function MobileDrawer({
    isOpen,
    onClose,
    menuItems,
}: {
    isOpen: boolean;
    onClose: () => void;
    menuItems: MenuItem[];
}) {
    const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({});
    const [expandedSub, setExpandedSub] = useState<number | null>(null);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setExpandedMenus({});
            setExpandedSub(null);
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const toggleMenu = (label: string) => {
        setExpandedMenus(prev => ({
            ...prev,
            [label]: !prev[label]
        }));
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-[70] shadow-2xl transition-transform duration-400 ease-out overflow-hidden flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <span className="text-xl font-semibold text-stone-900">
                        MENU
                    </span>
                    <button
                        onClick={onClose}
                        className="p-2 text-stone-500 hover:text-stone-900 transition-colors bg-transparent border-none cursor-pointer"
                    >
                        <CloseIcon />
                    </button>
                </div>

                {/* Drawer content - scrollable */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {menuItems.map((item, i) => {
                        // Regular link (no mega menu)
                        if (!item.isMegaMenu) {
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-6 py-4 text-sm tracking-wider uppercase no-underline border-b border-stone-50 transition-colors
                    ${item.highlight
                                            ? "text-rose-600 font-semibold"
                                            : "text-stone-700 hover:text-green-600 hover:bg-stone-50"
                                        }`}
                                    onClick={onClose}
                                >
                                    {item.icon && (
                                        <img src={item.icon} alt="" className="w-6 h-6 rounded-full object-cover" />
                                    )}
                                    {item.label}
                                </Link>
                            );
                        }

                        // Mega menu item — accordion
                        const isExpanded = expandedMenus[item.label] || false;
                        const categories = item.categories || [];

                        return (
                            <div key={i}>
                                {/* Category toggle */}
                                <button
                                    onClick={() => toggleMenu(item.label)}
                                    className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium tracking-wider uppercase text-stone-700 bg-transparent border-none border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors"
                                >
                                    {item.label}
                                    <ChevronDown open={isExpanded} className="" />
                                </button>

                                {/* Categories accordion */}
                                <div
                                    className={`overflow-hidden transition-all duration-400 ease-out ${isExpanded ? "max-h-[2000px]" : "max-h-0"}`}
                                    style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
                                >
                                    <div className="bg-stone-50">
                                        {categories.map((cat) => (
                                            <div key={cat.id}>
                                                {/* Category button */}
                                                <button
                                                    onClick={() => setExpandedSub(expandedSub === cat.id ? null : cat.id)}
                                                    className={`flex items-center justify-between w-full px-8 py-3.5 text-xs tracking-wider uppercase border-none cursor-pointer transition-all duration-200
                            ${expandedSub === cat.id
                                                            ? "text-green-600 bg-amber-50 font-medium"
                                                            : "text-stone-600 bg-transparent hover:text-green-600"
                                                        }`}
                                                >
                                                    {cat.name}
                                                    {cat.subcategories.length > 0 && (
                                                        <ChevronDown open={expandedSub === cat.id} className="" />
                                                    )}
                                                </button>


                                                {/* Subcategories */}
                                                {cat.subcategories.length > 0 && (
                                                    <div
                                                        className={`overflow-hidden transition-all duration-300 ease-out ${expandedSub === cat.id ? "max-h-[1000px]" : "max-h-0"}`}
                                                    >
                                                        <div className="bg-white py-2">
                                                            {cat.subcategories.map((sub) => (
                                                                <Link
                                                                    key={sub.id}
                                                                    href={sub.href}
                                                                    className="block px-10 py-2.5 text-sm text-stone-500 no-underline hover:text-green-600 transition-colors"
                                                                    onClick={onClose}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                            <Link
                                                                href={cat.href}
                                                                className="block px-10 py-2.5 text-xs font-medium tracking-wider uppercase text-green-600 no-underline hover:opacity-70 transition-opacity"
                                                                onClick={onClose}
                                                            >
                                                                Zobacz wszystkie →
                                                            </Link>
                                                        </div>
                                                    </div>
                                                )}

                                                {cat.subcategories.length === 0 && (
                                                    <Link
                                                        href={cat.href}
                                                        className="block px-10 py-0 pb-3 text-xs text-stone-400 no-underline hover:text-green-600 transition-colors"
                                                        onClick={onClose}
                                                    >
                                                        Przejdź do kategorii →
                                                    </Link>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

// ─── DESKTOP MEGA MENU PANEL ───────────────────────────────────────────────────
function DesktopMegaPanel({
    isOpen,
    menuItem,
    activeCat,
    onCatHover,
    onEnter,
    onLeave,
}: {
    isOpen: boolean;
    menuItem: MenuItem | null;
    activeCat: number | null;
    onCatHover: (id: number) => void;
    onEnter: () => void;
    onLeave: () => void;
}) {
    const categories = menuItem?.categories || [];
    const activeCategory = categories.find((c) => c.id === activeCat);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [activeCat]);

    if (!menuItem) return null;

    return (
        <div
            className={`absolute top-full left-0 right-0 bg-white z-[100] shadow-2xl transition-all duration-300 ease-out
        ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <div className="container mx-auto px-4 flex" style={{ minHeight: 480 }}>

                {/* Sidebar */}
                <div className="w-56 xl:w-64 shrink-0 bg-stone-50 border-r border-stone-100 py-6">
                    <div className="px-6 xl:px-7 pb-5 mb-2 border-b border-stone-200 text-stone-700 text-lg font-semibold tracking-widest uppercase">
                        {menuItem.label}
                    </div>

                    {categories.map((cat) => {
                        const isActive = activeCat === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onMouseEnter={() => onCatHover(cat.id)}
                                className={`group relative flex items-center justify-between w-full px-6 xl:px-7 py-3 text-left text-xs tracking-wider uppercase border-none cursor-pointer transition-all duration-200
                  ${isActive
                                        ? "text-green-600 bg-amber-50 font-medium"
                                        : "text-stone-600 bg-transparent hover:text-green-600 hover:bg-stone-100"
                                    }`}
                            >
                                <span
                                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-bg-green-600 transition-opacity duration-300
                    ${isActive ? "opacity-100" : "opacity-0"}`}
                                />
                                {cat.name}
                                <ArrowRight active={isActive} />
                            </button>
                        );
                    })}
                </div>

                {/* Content */}
                {activeCategory && (
                    <div className="flex-1 flex gap-6 xl:gap-8 p-6 xl:p-8 anim-slide" key={animKey}>

                        {/* Subcategories */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-4 mb-5 xl:mb-6 pb-4 border-b border-stone-100">
                                <span className="text-xl xl:text-2xl text-stone-900 font-semibold">
                                    {activeCategory.name}
                                </span>
                                <Link
                                    href={activeCategory.href}
                                    className="text-xs font-medium tracking-wider uppercase text-green-600 no-underline border-b border-green-600 pb-px hover:opacity-70 transition-opacity"
                                >
                                    Zobacz wszystkie
                                </Link>
                            </div>

                            {activeCategory.subcategories.length > 0 ? (
                                <div className="grid grid-cols-2 xl:grid-cols-3 gap-x-4">
                                    {activeCategory.subcategories.map((sub) => (
                                        <Link
                                            key={sub.id}
                                            href={sub.href}
                                            className="group/link relative block py-2.5 pr-3 text-sm text-stone-600 no-underline hover:text-green-600 hover:translate-x-1 transition-all duration-200"
                                        >
                                            <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-bg-green-600 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-stone-400">
                                    <span className="text-xl font-medium text-stone-500">
                                        Odkryj kolekcję {activeCategory.name}
                                    </span>
                                    <Link
                                        href={activeCategory.href}
                                        className="inline-block px-8 py-3 bg-stone-900 text-stone-100 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 uppercase no-underline rounded hover:bg-green-600 transition-colors duration-300"
                                    >
                                        Przejdź do kategorii
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Image */}
                        <div className="hidden lg:flex w-60 xl:w-72 shrink-0 flex-col gap-3">
                            <div className="relative flex-1 bg-stone-50 rounded-lg border border-dashed border-stone-300 hover:border-bg-green-600 transition-colors duration-300 flex items-center justify-center overflow-hidden">
                                {activeCategory.image ? (
                                    <Image
                                        src={activeCategory.image}
                                        alt={activeCategory.name}
                                        fill
                                        className="object-cover rounded-lg"
                                    />
                                ) : (
                                    <ImagePlaceholderIcon />
                                )}
                            </div>
                            <Link
                                href={activeCategory.href}
                                className="block text-center py-3.5 bg-sgreen text-stone-100 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 uppercase no-underline rounded hover:bg-green-600 transition-colors duration-300"
                            >
                                Zobacz kolekcję
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface MenuProps {
    isMobileMenuOpen?: boolean;
    onMobileMenuToggle?: (open: boolean) => void;
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function SobianekMegaMenu({ isMobileMenuOpen = false, onMobileMenuToggle }: MenuProps) {
    const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
    const isOpen = onMobileMenuToggle ? isMobileMenuOpen : internalMobileMenuOpen;
    const setIsOpen = onMobileMenuToggle ? onMobileMenuToggle : setInternalMobileMenuOpen;

    const [activeMegaItem, setActiveMegaItem] = useState<MenuItem | null>(null);
    const [activeCat, setActiveCat] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isDesktop = useMediaQuery("(min-width: 1024px)");

    const menuItems = navigationData.mainMenu as MenuItem[];

    useEffect(() => {
        // When a mega menu item becomes active, automatically select its first category
        if (activeMegaItem && activeMegaItem.categories && activeMegaItem.categories.length > 0) {
            // Only set if no category is currently selected or if we're switching to a different mega menu
            if (activeCat === null || !activeMegaItem.categories.some(c => c.id === activeCat)) {
                setActiveCat(activeMegaItem.categories[0].id);
            }
        }
    }, [activeMegaItem, activeCat]);

    // Close mobile drawer when switching to desktop
    useEffect(() => {
        if (isDesktop) setIsOpen(false);
    }, [isDesktop, setIsOpen]);

    const openMega = useCallback((item: MenuItem) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveMegaItem(item);
        // The useEffect above will handle setting the first category
    }, []);

    const closeMega = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setActiveMegaItem(null);
            setActiveCat(null);
        }, 180);
    }, []);

    const cancelClose = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleCloseMobile = () => {
        setIsOpen(false);
    };

    return (
        <>
            <style>{`
        @keyframes slideContent { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
        .anim-slide { animation: slideContent 0.28s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

            <div className="relative z-1 border-t border-gray-200 bg-white">
                {/* ── DESKTOP NAV ── */}
                <nav className="hidden lg:block bg-white border-b border-stone-100 relative z-50">
                    <div className="flex container mx-auto px-4">
                        {menuItems.map((item, i) => {
                            if (item.isMegaMenu) {
                                const isActive = activeMegaItem?.label === item.label;
                                return (
                                    <div
                                        key={i}
                                        className="relative"
                                        onMouseEnter={() => openMega(item)}
                                        onMouseLeave={closeMega}
                                    >
                                        <button
                                            className={`flex items-center gap-1 px-4 xl:px-5 py-4 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 uppercase transition-colors duration-300 bg-transparent border-none cursor-pointer
                                                ${isActive ? "text-green-600" : "text-stone-700 hover:text-green-600"}`}
                                        >
                                            {item.label}
                                            <ChevronDown open={isActive} className="ml-1 opacity-40" />
                                        </button>
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`${item?.position == 'right' ? "ml-auto" : ""} flex items-center gap-1.5 px-4 xl:px-5 py-4 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 uppercase no-underline transition-colors duration-300 whitespace-nowrap
                    ${item.highlight
                                            ? "text-rose-600 font-semibold hover:opacity-70"
                                            : "text-stone-700 hover:text-green-600"
                                        }`}
                                >
                                    {item.icon && (
                                        <img src={item.icon} alt="" className="w-5 h-5 rounded-full object-cover" />
                                    )}
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* Desktop overlay - positioned below nav but above content */}
                {isDesktop && (
                    <div
                        className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 pointer-events-none z-30
                        ${activeMegaItem !== null ? "opacity-100" : "opacity-0"}`}
                    />
                )}

                {/* Mega panel - high z-index to stay above overlay */}
                <DesktopMegaPanel
                    isOpen={activeMegaItem !== null}
                    menuItem={activeMegaItem}
                    activeCat={activeCat}
                    onCatHover={setActiveCat}
                    onEnter={cancelClose}
                    onLeave={closeMega}
                />
            </div>

            {/* Mobile drawer */}
            {!isDesktop && (
                <MobileDrawer
                    isOpen={isOpen}
                    onClose={handleCloseMobile}
                    menuItems={menuItems}
                />
            )}
        </>
    );
}