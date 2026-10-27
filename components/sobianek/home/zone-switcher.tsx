"use client"

import { useState } from "react"
import { Sprout, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function ZoneSwitcher() {
  const [activeZone, setActiveZone] = useState<"agro" | "fuel">("agro")

  return (
    <div className="bg-card border-b border-border sticky top-[120px] sm:top-[140px] md:top-[160px] lg:top-[180px] z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-3 sm:py-4">
          <button
            onClick={() => setActiveZone("agro")}
            className={cn(
              "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all",
              activeZone === "agro"
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Sprout className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            <span>Strefa AGRO</span>
          </button>

          <div className="w-px h-8 sm:h-10 md:h-12 bg-border" />

          <button
            onClick={() => setActiveZone("fuel")}
            className={cn(
              "flex items-center gap-2 sm:gap-3 px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 rounded-lg font-semibold text-sm sm:text-base md:text-lg transition-all",
              activeZone === "fuel"
                ? "bg-accent text-accent-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80",
            )}
          >
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
            <span>Strefa OPAŁ</span>
          </button>
        </div>
      </div>
    </div>
  )
}
