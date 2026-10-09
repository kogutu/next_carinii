"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Loader2, PackageOpen } from "lucide-react"
import OrderCard from "@/components/panel/OrderCard"
import type { PanelOrder } from "@/components/panel/panelOrders"
import { ENTER, EYEBROW, SurfaceCard } from "@/components/ui/surface"
import { cn } from "@/lib/utils"

type Pagination = { current_page: number; total_pages: number; total_count: number; has_next: boolean; has_prev: boolean }

const PAGE_SIZE = 10

export default function OrdersPage() {
  const { status } = useSession()
  const [orders, setOrders] = useState<PanelOrder[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")

  const load = useCallback(async (pageNumber: number) => {
    setState("loading")
    try {
      const response = await fetch(`/api/user/orders?page=${pageNumber}&limit=${PAGE_SIZE}`, { cache: "no-store" })
      const json = await response.json()
      if (!response.ok || !json.success) throw new Error(json.message ?? "Błąd")
      setOrders(json.data.orders)
      setPagination(json.data.pagination)
      setState("ready")
    } catch {
      setState("error")
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") load(page)
  }, [status, page, load])

  return (
    <div className="space-y-6">
      <header className={cn(ENTER)}>
        <p className={EYEBROW}>Panel klienta</p>
        <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Moje zamówienia</h1>
      </header>

      {state === "loading" && (
        <div className="flex items-center justify-center py-16" role="status" aria-label="Wczytywanie zamówień">
          <Loader2 className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
        </div>
      )}

      {state === "error" && (
        <SurfaceCard className="text-center sm:p-10" role="alert">
          <p className="font-semibold text-foreground">Nie udało się pobrać zamówień</p>
          <p className="mt-1 text-sm text-muted-foreground">Spróbuj ponownie za chwilę.</p>
          <button type="button" onClick={() => load(page)} className="mt-5 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Spróbuj ponownie
          </button>
        </SurfaceCard>
      )}

      {state === "ready" && orders.length === 0 && (
        <SurfaceCard className="text-center sm:p-12">
          <PackageOpen className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold text-foreground">Nie masz jeszcze zamówień</p>
          <p className="mt-1 text-sm text-muted-foreground">Zamówienia złożone po zalogowaniu pojawią się tutaj.</p>
          <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-menuhover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Przejdź do sklepu
          </Link>
        </SurfaceCard>
      )}

      {state === "ready" && orders.length > 0 && (
        <>
          <ul className="space-y-4">
            {orders.map((order, index) => (
              <li key={order.order_id} className={cn(ENTER, index === 0 ? "" : index === 1 ? "delay-100" : "delay-200")}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>

          {pagination && pagination.total_pages > 1 && (
            <nav aria-label="Strony zamówień" className="flex items-center justify-between gap-4">
              <button type="button" disabled={!pagination.has_prev} onClick={() => setPage((current) => current - 1)} className="surface-card inline-flex h-11 items-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Nowsze
              </button>
              <span className="text-sm tabular-nums text-muted-foreground">
                {pagination.current_page} / {pagination.total_pages}
              </span>
              <button type="button" disabled={!pagination.has_next} onClick={() => setPage((current) => current + 1)} className="surface-card inline-flex h-11 items-center rounded-xl bg-background px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Starsze
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
