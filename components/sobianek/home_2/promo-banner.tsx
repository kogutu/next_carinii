"use client"

import { X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gray-900 text-white py-2.5 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-sm">
          <span>Teraz węgiel taniej o 100 zł/tona z kodem:</span>
          <span className="font-bold bg-white text-gray-900 px-3 py-1 rounded">SobianekZima2024</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 text-white hover:bg-white/20"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
