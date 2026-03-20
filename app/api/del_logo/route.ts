import { getLogos } from '@/data/brand/getBrand'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    // Pobranie parametru 'name' z URL
    const searchParams = req.nextUrl.searchParams
    const name = searchParams.get('name')

    if (!name) {
        return NextResponse.json(
            { message: 'Brak parametru name' },
            { status: 400 }
        )
    }



    try {
        const logs = getLogos();
        let n = name.toLowerCase().replaceAll(" ", "_");
        const logo = logs.filter(e => {
            if (e.includes(n)) {
                return e
            }
        })
        if (!logo[0]) {
            return new NextResponse('Nie znaleziono logo', { status: 404 })
        }



        return NextResponse.json(
            {
                success: true,
                logo: logo[0],
            },
            { status: 200 }
        )
    } catch (error) {
        console.error('[v0] Error processing order:', error)
        return NextResponse.json(
            { message: error instanceof Error ? error.message : 'Błąd serwera' },
            { status: 500 }
        )
    }



}

