import { NextResponse } from 'next/server'
import { getFreshPromoConfig } from '@/lib/siteSettings'

// Aktualna konfiguracja promocji dla przeglądarki. Strony bywają serwowane z cache (statyczne, CDN), więc przeglądarka
// dopytuje o świeże dane tutaj — dzięki temu kampania z panelu /admin jest widoczna w ciągu kilku sekund, a nie dopiero
// po odświeżeniu cache. Nie cache'ujemy odpowiedzi; bazę chroni krótka pamięć w instancji (lib/siteSettings.ts).
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const config = await getFreshPromoConfig()
        return NextResponse.json({ success: true, config }, { headers: { 'Cache-Control': 'no-store' } })
    } catch (error) {
        // przy błędzie bazy przeglądarka zostaje przy konfiguracji z serwera (nie podstawiamy „pustej”)
        console.error('[promo] odczyt nie powiódł się:', error)
        return NextResponse.json({ success: false }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
}
