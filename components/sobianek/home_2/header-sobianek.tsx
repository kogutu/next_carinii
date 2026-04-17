"use client"

import Link from "next/link"
import Image from "next/image"
import { Search, ShoppingCart, User, ChevronDown, X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CartIcon } from "@/components/hert/items_modal/CartIcon"
import { CartDrawerContent } from "@/components/hert/items_modal/CartDrawer"
import { AccountModal } from "@/components/hert/items_modal/AccountModal"
import SearchBar from "@/components/hert/searchBar"
import { useState } from "react"
import CariniiMegaMenu from "@/components/hert/Menu"
import { SupportModal } from "@/components/hert/items_modal/SupportModal"

export function HeaderSobianek() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handeMobileMenuToggle = () => {
    setIsMenuOpen(false)
  }
  return (
    <header className="bg-white sticky top-0 z-50 shadow-xs">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="block md:flex items-center gap-3">
            <Image src="/logo.png" alt="Sobianek" width={200} height={60} priority className=" max-h-14 w-auto" />
            <div className="hidden md:flex  items-center gap-2 text-sm text-gray-600 border-l border-gray-300 pl-3">
              <ShoppingCart className="h-4 w-4" />
              <span>Lider na rynku sprzedaży węgla i produktów agro</span>
            </div>
          </Link>
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <SearchBar type={'desktop'} />
              {/* <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input placeholder="Szukaj w sklepie" className="pl-10 pr-4 h-11 border-gray-300 focus:border-primary" /> */}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <AccountModal />
            <SupportModal />


            <CartIcon />
            <CartDrawerContent />

          </div>
        </div>
        <div className="flex items-center mt-4  ">
          <SearchBar type={'mobile'} />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex items-center bg-sgreen text-white rounded-lg  p-2"
          >
            {isMenuOpen ? <X size={34} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      <CariniiMegaMenu isMobileMenuOpen={isMenuOpen} onMobileMenuToggle={() => handeMobileMenuToggle()}></CariniiMegaMenu>

    </header>
  )
}
