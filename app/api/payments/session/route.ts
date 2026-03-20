import { setSessionIdPayment } from '@/lib/p24/payment_calbacks';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    let { oid, sessionId, amount } = await req.json();

    setSessionIdPayment(oid, sessionId, amount, "");

    return NextResponse.json(({ "success": true }));

}
