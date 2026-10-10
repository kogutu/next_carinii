"use client"

import type React from "react"
import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Heart, Loader2, RotateCcw, ShoppingBag, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Mój profil", href: "/klient/panel/profil", icon: User },
  { name: "Moje zamówienia", href: "/klient/panel/zamowienia", icon: ShoppingBag },
  { name: "Ulubione", href: "/ulubione", icon: Heart },
  { name: "Zwroty i reklamacje", href: "/klient/panel/zwroty-reklamacje", icon: RotateCcw },
]

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  // niezalogowany klient wraca na stronę główną (przekierowanie poza renderem)
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/")
  }, [status, router])

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Wczytywanie panelu">
        <Loader2 className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-14">
        <nav aria-label="Panel klienta" className="-mx-4 mb-8 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <ul className="flex w-max gap-2 sm:w-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none",
                      isActive ? "bg-primary text-primary-foreground" : "surface-card bg-background text-foreground hover:bg-muted",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <main>{children}</main>
      </div>
    </div>
  )
}
