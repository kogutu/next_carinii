'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { blikChargeByCode, P24TransactionResponse, registerTransaction } from '@/lib/p24/p24-sdk';
import { setSessionIdPayment } from '@/lib/p24/payment_calbacks';


/**
 * POST /api/p24/blik/charge
 * Wysyła żądanie do Przelewy24 o opłacenie transakcji kodem BLIK
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(body);

    const { sessionId, blikCode, email, oid, description, client } = body;





    const amount = body.amount * 100;
    // Walidacja danych
    if (!sessionId || !amount || !blikCode) {
      return NextResponse.json(
        { error: 'Wymagane pola: sessionId, amount, blikCode' },
        { status: 400 }
      );
    }

    // Walidacja kodu BLIK
    if (!/^\d{6}$/.test(blikCode)) {
      return NextResponse.json(
        { error: 'Kod BLIK musi składać się z 6 cyfr' },
        { status: 400 }
      );
    }



    console.log('[v0] BLIK Charge Request:', {
      sessionId,
      amount,
      description,
      email,
      client,
      method: 154, // Google Pay method ID w P24
      blikCode: '***' + blikCode.slice(-2),
    });



    const res = await registerTransaction({
      sessionId,
      amount,
      description,
      oid,
      email,
      client,
      method: 154, // Google Pay method ID w P24
    }) as P24TransactionResponse;



    const result: any = await blikChargeByCode(res.token, blikCode);
    console.log("---blikChargeByCode---");
    console.log(result);
    console.log("---END blikChargeByCode---");

    await setSessionIdPayment(oid, sessionId, amount + "", result.data.orderId)

    return NextResponse.json({
      success: true,
      ...result
    });
  } catch (error: any) {


    var message = error instanceof Error ? error.message : 'Błąd podczas przetwarzania płatności BLIK';

    if (error.toString().includes("28")) message = 'Nieprawiłowy kod BLIK';



    return NextResponse.json({ error: message }, { status: 500 });
  }
}
