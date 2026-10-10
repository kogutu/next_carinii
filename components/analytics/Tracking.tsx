'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { initAnalytics, trackPageView } from '@/lib/analytics'

// Podłącza analitykę do wyboru z banera cookies i zgłasza odsłonę przy każdej zmianie strony (nawigacja bez przeładowania).
export default function Tracking() {
    const pathname = usePathname()

    useEffect(() => initAnalytics(), [])

    useEffect(() => {
        // tytuł dokumentu aktualizuje się tuż po zmianie adresu — zgłaszamy odsłonę po nim
        const timer = setTimeout(trackPageView, 150)
        return () => clearTimeout(timer)
    }, [pathname])

    return null
}
