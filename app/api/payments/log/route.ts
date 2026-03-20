import { setLogPayment } from '@/lib/p24/payment_calbacks';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    let { oid, log } = await req.json();

    setLogPayment(oid, log);

    return NextResponse.json(({ "success": true }));

}
