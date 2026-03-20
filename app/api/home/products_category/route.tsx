import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const cid = searchParams.get('cid') || ''
        console.log("---------------------CIO");

        console.log(cid);


        const response = await fetch(
            `https://sklep.carinii.com.pl/directseo/nextjs/api/?path=collections/carinii_prs/documents/search?q=*&filter_by=cids:[${cid}]&page=1&per_page=9&exhaustive_search=true`,
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