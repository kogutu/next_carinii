"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { ImageIcon, Loader2, Plus, RotateCcw } from "lucide-react"
import { STATUS_LABELS, type ReturnType } from "@/components/returns/returnOptions"
import { ENTER, EYEBROW, SurfaceCard } from "@/components/ui/surface"
import { cn } from "@/lib/utils"

type ReturnEntry = {
  ref: string
  orderNumber: string
  type: ReturnType
  status: string
  reason: string
  resolution: string
  items: { name: string; size: string; qty: number }[]
  photoCount: number
  createdAt: string
}

const STATUS_TONES: Record<string, string> = {
  new: "bg-warning-soft text-warning",
  in_progress: "bg-warning-soft text-warning",
  accepted: "bg-success-soft text-success",
  done: "bg-success-soft text-success",
  rejected: "bg-muted text-muted-foreground",
}

const formatDate = (value: string): string => {
  const date = new Date(value.replace(" ", "T"))
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })
}

export default function ReturnsPage() {
  const { status } = useSession()
  const [entries, setEntries] = useState<ReturnEntry[]>([])
  const [state, setState] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (status !== "authenticated") return

    const load = async () => {
      try {
        const response = await fetch("/api/returns", { cache: "no-store" })
        const json = await response.json()
        if (!response.ok || !json.success) throw new Error(json.message ?? "Błąd")
        setEntries(json.data.returns)
        setState("ready")
      } catch {
        setState("error")
      }
    }
    load()
  }, [status])

  return (
    <div className="space-y-6">
      <header className={cn(ENTER, "flex flex-wrap items-end justify-between gap-4")}>
        <div>
          <p className={EYEBROW}>Panel klienta</p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Zwroty i reklamacje</h1>
        </div>
        <Link href="/zwrot-reklamacja" className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 hover:bg-menuhover active:scale-97 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:active:scale-100">
          <Plus className="size-4" aria-hidden="true" />
          Nowe zgłoszenie
        </Link>
      </header>

      {state === "loading" && (
        <div className="flex items-center justify-center py-16" role="status" aria-label="Wczytywanie zgłoszeń">
          <Loader2 className="size-8 animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
        </div>
      )}

      {state === "error" && (
        <SurfaceCard className="text-center sm:p-10" role="alert">
          <p className="font-semibold text-foreground">Nie udało się pobrać zgłoszeń</p>
          <p className="mt-1 text-sm text-muted-foreground">Odśwież stronę lub spróbuj ponownie za chwilę.</p>
        </SurfaceCard>
      )}

      {state === "ready" && entries.length === 0 && (
        <SurfaceCard className="text-center sm:p-12">
          <RotateCcw className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-4 text-lg font-semibold text-foreground">Nie masz jeszcze zgłoszeń</p>
          <p className="mt-1 text-sm text-muted-foreground">Zwrot lub reklamację zgłosisz w kilka minut, także ze zdjęciami.</p>
        </SurfaceCard>
      )}

      {state === "ready" && entries.length > 0 && (
        <ul className="space-y-4">
          {entries.map((entry) => (
            <li key={entry.ref}>
              <SurfaceCard className="sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                  <div>
                    <p className="text-lg font-semibold tabular-nums tracking-tight text-foreground">{entry.ref}</p>
                    <p className="text-sm text-muted-foreground">
                      {entry.type === "zwrot" ? "Zwrot" : "Reklamacja"} · zamówienie{" "}
                      <Link href={`/success/oid/${encodeURIComponent(entry.orderNumber)}`} className="text-foreground underline underline-offset-4">{entry.orderNumber}</Link>
                      {" · "}{formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <span className={cn("inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold", STATUS_TONES[entry.status] ?? "bg-muted text-muted-foreground")}>
                    {STATUS_LABELS[entry.status] ?? entry.status}
                  </span>
                </div>

                <ul className="mt-4 space-y-1 text-sm text-foreground">
                  {entry.items.map((item) => (
                    <li key={`${entry.ref}-${item.name}`}>
                      {item.qty} × {item.name.split("CARINII--")[0]}
                      {item.size && <span className="text-muted-foreground"> · rozmiar {item.size}</span>}
                    </li>
                  ))}
                </ul>

                <p className="mt-3 text-sm text-muted-foreground">
                  {entry.reason}
                  {entry.resolution ? ` · ${entry.resolution}` : ""}
                </p>
                {entry.photoCount > 0 && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImageIcon className="size-3.5" aria-hidden="true" />
                    {entry.photoCount} {entry.photoCount === 1 ? "zdjęcie" : "zdjęcia"}
                  </p>
                )}
              </SurfaceCard>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
