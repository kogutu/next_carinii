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
                    "collection": "sobianek_prs",
                    "q": "*",
                    "query_by": "name",
                    "filter_by": "in_stock:=true",
                    "sort_by": "tsales:desc",
                    "per_page": 20,
                    "page": 1
                }
            ]
        })



        return NextResponse.json(response)

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}