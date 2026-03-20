import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    let { uid } = await req.json()
    console.log(uid)
    const response = await fetch('https://sklep.carinii.com.pl/directseo/nextjs/user/getUser.php?t=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            uid: uid
        }),

        cache: 'no-store' // to rozwiązuje problem cache
    })

    const result = await response.json()
    return NextResponse.json((result));
    return NextResponse.json({ error: 'Nie znaleziono firmy' }, { status: 404 })
}
