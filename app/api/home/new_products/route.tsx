import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const page = searchParams.get('page') || '1'

        const response = await fetch(
            `https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/carinii_prs/documents/search?q=*&filter_by=new:%3D1&page=1&per_page=10&exhaustive_search=true`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TYPESENSE-API-KEY': 'xyz'
                }

            }
        )

        const data = await response.json()
        return NextResponse.json(data)

    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch products' },
            { status: 500 }
        )
    }
}