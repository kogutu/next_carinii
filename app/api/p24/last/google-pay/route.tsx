// app/api/p24/google-pay/route.ts
import { NextRequest, NextResponse } from 'next/server';


import { registerTransaction } from '../../../../../lib/p24/p24-sdk';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { amount, email, description, client, googlePayToken } = await req.json();

    if (!amount || !email) {
      return NextResponse.json(
        { error: 'Wymagane pola: amount, email' },
        { status: 400 }
      );
    }

    const sessionId = `gpay_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Rejestracja transakcji z methodId 266 (Google Pay w P24)
    const result = await registerTransaction({
      sessionId,
      amount: Math.round(amount * 100),
      description: description || 'Zamówienie - Google Pay',
      email,
      client,
      urlReturn: `${appUrl}/payment/return?sessionId=${sessionId}`,
      urlStatus: `${appUrl}/api/p24/verify`,
      method: 266, // Google Pay method ID w P24
    });

    // Dla Google Pay przekierowujemy na bramkę P24
    // P24 automatycznie obsłuży Google Pay po stronie swojej formatki
    return NextResponse.json({
      token: result.token,
      redirectUrl: result.redirectUrl,
      sessionId,
    });
  } catch (error: unknown) {
    console.error('Google Pay P24 Error:', error);
    const message = error instanceof Error ? error.message : 'Błąd płatności Google Pay';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
