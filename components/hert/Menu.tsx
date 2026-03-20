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
        stroke="currentColor" strokeWidth="1.5"
        className={`transition-transform duration-300 ${open ? "rotate-180" : ""} ${className}`}
    >
        <path d="M2 3.5L5 6.5L8 3.5" />
    </svg>
);

const ArrowRight = ({ active }: { active: boolean }) => (
    <svg
        width="14" height="14" viewBox="0 0 14 14" fill="none"
        stroke="currentColor" strokeWidth="1.5"
        className={`transition-all duration-300 ${active ? "opacity-50 translate-x-0" : "opacity-0 -translate-x-1"}`}
    >
        <path d="M5 3L9 7L5 11" />
    </svg>
);

const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M4 7h16M4 12h16M4 17h16" />
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
    const [expandedCat, setExpandedCat] = useState<number | null>(null);
    const [expandedSub, setExpandedSub] = useState<number | null>(null);

    // Lock body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
            setExpandedCat(null);
            setExpandedSub(null);
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const megaItem = menuItems.find((m) => m.isMegaMenu);
    const categories = megaItem?.categories || [];

    return (
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl transition-transform duration-400 ease-out overflow-hidden flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
                style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
            >
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                    <span
                        className="text-xl font-semibold text-stone-900"

                    >
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
                        // Regular link
                        if (!item.isMegaMenu) {
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-6 py-4 text-sm tracking-wider uppercase no-underline border-b border-stone-50 transition-colors
                    ${item.highlight
                                            ? "text-rose-600 font-semibold"
                                            : "text-stone-700 hover:text-amber-800 hover:bg-stone-50"
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
                        return (
                            <div key={i}>
                                {/* Obuwie toggle */}
                                <button
                                    onClick={() => setExpandedCat(expandedCat === -1 ? null : -1)}
                                    className="flex items-center justify-between w-full px-6 py-4 text-sm font-medium tracking-wider uppercase text-stone-700 bg-transparent border-none border-b border-stone-50 cursor-pointer hover:bg-stone-50 transition-colors"

                                >
                                    {item.label}
                                    <ChevronDown open={expandedCat === -1} className="opacity-40" />
                                </button>

                                {/* Categories accordion */}
                                <div
                                    className={`overflow-hidden transition-all duration-400 ease-out ${expandedCat === -1 ? "max-h-[2000px]" : "max-h-0"}`}
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
                                                            ? "text-amber-800 bg-amber-50 font-medium"
                                                            : "text-stone-600 bg-transparent hover:text-amber-800"
                                                        }`}

                                                >
                                                    {cat.name}
                                                    {cat.subcategories.length > 0 && (
                                                        <ChevronDown open={expandedSub === cat.id} className="opacity-40" />
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
                                                                    className="block px-10 py-2.5 text-sm text-stone-500 no-underline hover:text-amber-800 transition-colors"
                                                                    onClick={onClose}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                            <Link
                                                                href={cat.href}
                                                                className="block px-10 py-2.5 text-xs font-medium tracking-wider uppercase text-amber-800 no-underline hover:opacity-70 transition-opacity"
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
                                                        className="block px-10 py-0 pb-3 text-xs text-stone-400 no-underline hover:text-amber-800 transition-colors"
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
    categories,
    activeCat,
    onCatHover,
    onEnter,
    onLeave,
}: {
    isOpen: boolean;
    categories: Category[];
    activeCat: number | null;
    onCatHover: (id: number) => void;
    onEnter: () => void;
    onLeave: () => void;
}) {
    const activeCategory = categories.find((c) => c.id === activeCat);
    const [animKey, setAnimKey] = useState(0);

    useEffect(() => {
        setAnimKey((k) => k + 1);
    }, [activeCat]);

    return (
        <div
            className={`absolute top-full left-0 right-0 bg-white z-50 shadow-2xl transition-all duration-300 ease-out
        ${isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <div className="max-w-7xl mx-auto flex" style={{ minHeight: 480 }}>

                {/* Sidebar */}
                <div className="w-56 xl:w-64 shrink-0 bg-stone-50 border-r border-stone-100 py-6">
                    <div
                        className="px-6 xl:px-7 pb-5 mb-2 border-b border-stone-200 text-stone-700 text-lg font-semibold tracking-widest uppercase"

                    >
                        Obuwie
                    </div>

                    {categories.map((cat) => {
                        const isActive = activeCat === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onMouseEnter={() => onCatHover(cat.id)}
                                className={`group relative flex items-center justify-between w-full px-6 xl:px-7 py-3 text-left text-xs tracking-wider uppercase border-none cursor-pointer transition-all duration-200
                  ${isActive
                                        ? "text-amber-800 bg-amber-50 font-medium"
                                        : "text-stone-600 bg-transparent hover:text-amber-800 hover:bg-stone-100"
                                    }`}

                            >
                                <span
                                    className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-amber-700 transition-opacity duration-300
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
                                <span
                                    className="text-xl xl:text-2xl text-stone-900 font-semibold"

                                >
                                    {activeCategory.name}
                                </span>
                                <Link
                                    href={activeCategory.href}
                                    className="text-xs font-medium tracking-wider uppercase text-amber-800 no-underline border-b border-amber-800 pb-px hover:opacity-70 transition-opacity"
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
                                            className="group/link relative block py-2.5 pr-3 text-sm text-stone-600 no-underline hover:text-amber-800 hover:translate-x-1 transition-all duration-200"
                                        >
                                            <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-amber-700 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 gap-4 text-stone-400">
                                    <span
                                        className="text-xl font-medium text-stone-500"

                                    >
                                        Odkryj kolekcję {activeCategory.name}
                                    </span>
                                    <Link
                                        href={activeCategory.href}
                                        className="inline-block px-8 py-3 bg-stone-900 text-stone-100 text-xs font-medium tracking-widest uppercase no-underline rounded hover:bg-amber-800 transition-colors duration-300"
                                    >
                                        Przejdź do kategorii
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Image placeholder */}
                        <div className="hidden lg:flex w-60 xl:w-72 shrink-0 flex-col gap-3">
                            <div className="flex-1 bg-stone-50 rounded-lg border border-dashed border-stone-300 hover:border-amber-700 transition-colors duration-300 flex flex-col items-center justify-center gap-3 relative">
                                <Image src={activeCategory.image} alt="" fill></Image>
                            </div>
                            <Link
                                href={activeCategory.href}
                                className="block text-center py-3.5 bg-stone-900 text-stone-100 text-xs font-medium tracking-widest uppercase no-underline rounded hover:bg-amber-800 transition-colors duration-300"
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
    isMobileMenuOpen: boolean;
    onMobileMenuToggle?: (open: boolean) => void;
}
// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function CariniiMegaMenu({ isMobileMenuOpen = false, onMobileMenuToggle }: MenuProps) {
    const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);

    const isOpen = onMobileMenuToggle ? isMobileMenuOpen : internalMobileMenuOpen;
    const setIsOpen = onMobileMenuToggle ? onMobileMenuToggle : setInternalMobileMenuOpen;


    const [megaOpen, setMegaOpen] = useState(false);
    const [activeCat, setActiveCat] = useState<number | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        setMobileOpen(isMobileMenuOpen);
    }, [isMobileMenuOpen]);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isDesktop = useMediaQuery("(min-width: 1024px)");


    const menuItems = navigationData.mainMenu as MenuItem[];
    const megaItem = menuItems.find((m) => m.isMegaMenu);
    const categories = (megaItem?.categories || []) as Category[];

    useEffect(() => {
        if (megaOpen && activeCat === null && categories.length > 0) {
            setActiveCat(categories[0].id);
        }
    }, [megaOpen]);

    // Close mobile drawer when switching to desktop
    useEffect(() => {
        if (isDesktop) setMobileOpen(false);
    }, [isDesktop]);

    const openMega = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMegaOpen(true);
    }, []);

    const closeMega = useCallback(() => {
        timeoutRef.current = setTimeout(() => {
            setMegaOpen(false);

            setActiveCat(null);
        }, 180);
    }, []);

    const cancelClose = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, []);

    const handleCloseMobile = () => {
        setMobileOpen(false)
        setIsOpen(false)
    }
    return (
        <>
            <style>{`
        @keyframes slideContent { from { opacity:0; transform:translateX(10px); } to { opacity:1; transform:translateX(0); } }
        .anim-slide { animation: slideContent 0.28s cubic-bezier(0.16,1,0.3,1) both; }
      `}</style>

            <div className="relative z-5" >




                {/* ── DESKTOP NAV ── */}
                <nav className="hidden lg:block bg-white border-b border-stone-100 relative">
                    <div className="flex items-center justify-center max-w-7xl mx-auto px-6">
                        {menuItems.map((item, i) => {
                            if (item.isMegaMenu) {
                                return (
                                    <div
                                        key={i}
                                        className="relative"
                                        onMouseEnter={openMega}
                                        onMouseLeave={closeMega}
                                    >
                                        <button
                                            className="flex items-center gap-1 px-4 xl:px-5 py-4 text-xs font-medium tracking-widest uppercase text-stone-700 hover:text-amber-800 transition-colors duration-300 bg-transparent border-none cursor-pointer"

                                        >
                                            {item.label}
                                            <ChevronDown open={megaOpen} className="ml-1 opacity-40" />
                                        </button>
                                    </div>
                                );
                            }
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-1.5 px-4 xl:px-5 py-4 text-xs font-medium tracking-widest uppercase no-underline transition-colors duration-300 whitespace-nowrap
                    ${item.highlight
                                            ? "text-rose-600 font-semibold hover:opacity-70"
                                            : "text-stone-700 hover:text-amber-800"
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

                    {/* Mega panel */}
                    <DesktopMegaPanel
                        isOpen={megaOpen}
                        categories={categories}
                        activeCat={activeCat}
                        onCatHover={setActiveCat}
                        onEnter={cancelClose}
                        onLeave={closeMega}
                    />
                </nav>
            </div>

            {/* Desktop overlay */}
            {isDesktop && (
                <div
                    className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-1 transition-opacity duration-300
            ${megaOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                    onClick={() => { setMegaOpen(false); setActiveCat(null); }}
                />
            )}

            {/* Mobile drawer */}
            {!isDesktop && (
                <MobileDrawer
                    isOpen={mobileOpen}
                    onClose={() => handleCloseMobile()}
                    menuItems={menuItems}
                />
            )}
        </>
    );
}