"use client"

import { useState } from "react"
import { Sprout, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function ZoneSwitcher() {
  const [activeZone, setActiveZone] = useState<"agro" | "fuel">("agro")

  return (
    <div className="bg-card border-b border-border sticky top-[180px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 py-4">
          <button
            onClick={() => setActiveZone("agro")}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all",
              activeZone === "agro"
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Sprout className="h-6 w-6" />
            <span>Strefa AGRO</span>
          </button>

          <div className="w-px h-12 bg-border" />

          <button
            onClick={() => setActiveZone("fuel")}
            className={cn(
              "flex items-center gap-3 px-8 py-4 rounded-lg font-semibold text-lg transition-all",
              activeZone === "fuel"
                ? "bg-accent text-accent-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Flame className="h-6 w-6" />
            <span>Strefa OPAŁ</span>
          </button>
        </div>
      </div>
    </div>
  )
}
