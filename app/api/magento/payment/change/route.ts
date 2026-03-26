import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    let { oid, payment } = await req.json()

    const url = `http://sklep.carinii.com.pl/directseo/nextjs/orders/cpay.php?oid=${oid}&paymentnew=${payment}`;
    console.log(url);
    let data = await fetch(url)
    let result = await data.json()
    return NextResponse.json((result));
    return NextResponse.json({ error: 'Nie znaleziono firmy' }, { status: 404 })
}
