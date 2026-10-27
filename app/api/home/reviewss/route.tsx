import { getDataTypesense } from '@/lib/typesense'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const page = searchParams.get('page') || '1'

        const response = await getDataTypesense({
            "searches": [
                {
                    "collection": "sobianek_revs",
                    "q": "*",
                    "sort_by": "created_at:desc",
                    "per_page": 4,
                    "page": 1
                }
            ]
        })

        //     await fetch(
        //     `https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/sobianek_prs/documents/search?q=*&filter_by=new:%3D1&page=1&per_page=10&exhaustive_search=true`,
        //     {
        //         method: 'GET',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'X-TYPESENSE-API-KEY': 'xyz'
        //         }

        //     }
        // )


        return NextResponse.json(response)

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}