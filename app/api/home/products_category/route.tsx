import { NextResponse } from 'next/server'
import { buildPopularitySortBy, getPopularitySkus } from '@/lib/popularity'

// Lista SKU potrafi mieć tysiące pozycji — zapytanie z sortowaniem wg popularności
// nie mieści się w GET (limit 4000 znaków), więc idzie przez multi_search (POST).
const TYPESENSE_URL = 'http://46.224.114.11:8108/multi_search'
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'xyz'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const cid = searchParams.get('cid') || ''
        if (!/^\d+$/.test(cid)) {
            return NextResponse.json({ error: 'Invalid cid' }, { status: 400 })
        }

        const skus = await getPopularitySkus(cid)

        const response = await fetch(TYPESENSE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-TYPESENSE-API-KEY': TYPESENSE_API_KEY,
            },
            body: JSON.stringify({
                searches: [
                    {
                        collection: 'carinii_prs',
                        q: '*',
                        filter_by: `cids:[${cid}]`,
                        sort_by: skus.length > 0 ? buildPopularitySortBy(skus) : 'createdat:desc',
                        page: 1,
                        per_page: 9,
                        exhaustive_search: true,
                    },
                ],
            }),
        })

        if (!response.ok) {
            throw new Error(`Typesense error: ${response.status}`)
        }

        const data = await response.json()
        return NextResponse.json(data.results[0])
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}
