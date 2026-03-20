import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    let { oid, payment } = await req.json()

    const url = `http://dev2.hert.pl/devback/Nextjs-api/orders/cpay.php?oid=${oid}&paymentnew=${payment}`;

    let data = await fetch(url)
    let result = await data.json()
    return NextResponse.json((result));
    return NextResponse.json({ error: 'Nie znaleziono firmy' }, { status: 404 })
}
