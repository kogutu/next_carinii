"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { User, ShoppingBag, RotateCcw, List, Eye, Package } from "lucide-react"
import { Loader2 } from "lucide-react"

const navigation = [
  { name: "Mój profil", href: "/klient/panel/profil", icon: User },
  { name: "Moje zamówienia", href: "/klient/panel/zamowienia", icon: ShoppingBag },
  // { name: "Zwroty/reklamacje", href: "/klient/panel/zwroty-reklamacje", icon: RotateCcw },
  // { name: "Moje listy zakupowe", href: "/shopping-lists", icon: List },
  // { name: "Ostatnio oglądane", href: "/klient/panel/ostatnio-ogladane", icon: Eye },
  // { name: "Zamówienia hurtowe", href: "/klient/panel/hurt", icon: Package },
]

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    router.push("/")
    return null
  }

  return (
    <div className=" bg-gray-50">
      <div className="container mx-auto px-4 py-8 bg-white min-h-screen">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <h2 className="font-bold text-lg mb-4">Panel klienta</h2>
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-primary text-primary-foreground" : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  )
}
