import { NextResponse } from 'next/server'
import { getHomeBlock } from '@/lib/homeBlock'

// Blok strony głównej z Magento (CMS block 856): za każdym razem świeżo pobrany i przetworzony na sekcje dla Next.js.
// Wynik cache'uje się na 5 minut (lib/homeBlock.ts); gdy sklep nie odpowiada, zwracamy zapasową kopię (source: "snapshot").
export async function GET() {
    const block = await getHomeBlock()
    return NextResponse.json(block, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
}
