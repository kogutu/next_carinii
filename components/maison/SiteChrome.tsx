"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

// Strefa /maison ma własny nagłówek i stopkę — globalny pasek sklepu i stopka się w niej nie pokazują.
export default function SiteChrome({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    if (pathname === "/maison" || pathname?.startsWith("/maison/")) return null
    return <>{children}</>
}
