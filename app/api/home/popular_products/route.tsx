import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const query = searchParams.get('q') || ''
        const page = searchParams.get('page') || '1'

        const response = await fetch(
            `http://46.224.114.11:8108/collections/hert/documents/search?q=%2A&page=1&per_page=10&filter_by=popular_product:true`,
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