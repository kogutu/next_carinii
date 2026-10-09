import { NextResponse } from 'next/server'

interface SuccessPageProps {
    params: Promise<{
        orderid: string
    }>
}

// Dla pobierania danych użyj GET, nie POST
export async function GET(
    request: Request,
    { params }: SuccessPageProps
) {
    const { orderid } = await params
    console.log(orderid)

    // parametr _ omija cache odpowiedzi po stronie serwera sklepu (status płatności musi być aktualny)
    const url = "https://sklep.carinii.com.pl/directseo/nextjs/orders/?oid=" + orderid + "&_=" + Date.now();
    let data = await fetch(url, { cache: 'no-store' })
    let result = await data.json()
    return NextResponse.json((result));
    return NextResponse.json({ orderid })
    // nip = nip.replace(/\D/g, '');

    // // TU w realu podłączasz API GUS / REGON
    // // Poniżej mock:
    // console.log(nip)
    // if (nip === '5250001009') {
    //     return NextResponse.json({
    //         name: 'HERT Spółka z o.o.',
    //         street: 'ul. Przykładowa 10',
    //         city: 'Warszawa',
    //         postcode: '00-001'
    //     })
    // }
    // let data = await fetch("https://devback.it/GUS/getData.php?nip=" + nip)
    // let result = await data.json()
    // return NextResponse.json((result));
    // return NextResponse.json({ error: 'Nie znaleziono firmy' }, { status: 404 })
}

