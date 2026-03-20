import { NextResponse } from 'next/server'
// /api/magento/discount
export async function POST(req: Request) {
    let { oids, coupon } = await req.json()

    console.log(`http://sklep.carinii.com.pl/directseo/nextjs//orders/discount.php?product_ids=${oids}&coupon_code=${coupon}`);
    const url = `http://sklep.carinii.com.pl/directseo/nextjs//orders/discount.php?product_ids=${oids}&coupon_code=${coupon}`;
    console.log(url);
    let data = await fetch(url)
    let result = await data.json()
    console.log(result);
    return NextResponse.json((result));
    return NextResponse.json({ error: 'Nie znaleziono firmy' }, { status: 404 })
}
