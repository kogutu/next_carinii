"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useCartStore } from "@/stores/cartZustand"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const totalCart = useCartStore(store => store.grandTotal);

  // totalCart

  const navItems = [
    { href: "/ekogroszek", label: "Ekogroszek" },
    { href: "/pellet", label: "Pellet" },
    { href: "/kotly-pompy", label: "Kotły i pompy ciepła" },
    { href: "/material-siewny", label: "Materiał siewny" },
    { href: "/nawozy", label: "Nawozy" },
    { href: "/srodki-ochrony", label: "Środki ochrony" },
    { href: "/inhibitory", label: "Inhibitory" },
  ]

  return (
    <header className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3 shrink-0">
            <Image src="/logo.png" alt="Sobianek" width={200} height={60} priority className="h-10 md:h-14 w-auto" />
            <div className="hidden xl:flex items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-3">
              <ShoppingCart className="h-4 w-4" />
              <span>Lider na rynku sprzedaży węgla i produktów agro</span>
            </div>
          </Link>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Szukaj w sklepie" className="pl-10 pr-4 h-10 md:h-11 border-gray-300 focus:border-primary w-full" />
            </div>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Mobile search button */}
            <Button variant="ghost" size="icon" className="md:hidden h-10 w-10 hover:bg-gray-100">
              <Search className="h-5 w-5 text-gray-700" />
            </Button>

            <Button variant="ghost" size="icon" className="hidden sm:flex h-10 md:h-12 w-10 md:w-12 hover:bg-gray-100">
              <User className="h-6 md:h-7 w-6 md:w-7 text-gray-700" />
            </Button>
            <Button variant="ghost" size="icon" className="relative h-10 md:h-12 w-10 md:w-12 hover:bg-gray-100">
              <ShoppingCart className="h-6 md:h-7 w-6 md:w-7 text-gray-700" />
              <span className="absolute top-0.5 md:top-1 right-0.5 md:right-1 bg-primary text-white text-xs font-bold rounded-full w-4 md:w-5 h-4 md:h-5 flex items-center justify-center">
                1
              </span>
            </Button>
            <div className="hidden lg:block text-right ml-2">
              <div className="text-xs text-gray-500">Twój koszyk+</div>
              <div className="font-bold text-gray-900">{totalCart}</div>
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-10 w-10 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input placeholder="Szukaj w sklepie" className="pl-10 pr-4 h-10 border-gray-300 focus:border-primary w-full" />
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <nav className="hidden lg:block border-t border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 xl:px-4 py-4 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors"
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </Link>
              </li>
            ))}
            <li className="ml-auto">
              <Link
                href="/promocje"
                className="flex items-center px-4 py-4 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
              >
                Promocje
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className={cn(
        "lg:hidden border-t border-gray-200 bg-white overflow-hidden transition-all duration-300",
        mobileMenuOpen ? "max-h-[500px]" : "max-h-0"
      )}>
        <ul className="container mx-auto px-4 py-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between px-2 py-3 text-sm font-medium text-gray-700 hover:text-primary hover:bg-gray-50 transition-colors rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
                <ChevronDown className="h-4 w-4" />
              </Link>
            </li>
          ))}
          <li className="border-t border-gray-100 mt-2 pt-2">
            <Link
              href="/promocje"
              className="flex items-center px-2 py-3 text-sm font-bold text-accent hover:text-accent/80 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Promocje
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
