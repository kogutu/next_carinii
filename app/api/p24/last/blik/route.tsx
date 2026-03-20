// app/api/p24/blik/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { blikChargeByCode } from '../../../../../lib/p24/p24-sdk';

export async function POST(req: NextRequest) {
  try {
    const { token, blikCode } = await req.json();

    if (!token || !blikCode) {
      return NextResponse.json(
        { error: 'Wymagane pola: token, blikCode' },
        { status: 400 }
      );
    }

    // Walidacja kodu BLIK - musi być 6-cyfrowy
    if (!/^\d{6}$/.test(blikCode)) {
      return NextResponse.json(
        { error: 'Kod BLIK musi składać się z 6 cyfr' },
        { status: 400 }
      );
    }

    const result = await blikChargeByCode(token, blikCode);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: unknown) {
    console.error('BLIK Charge Error:', error);
    const message = error instanceof Error ? error.message : 'Błąd płatności BLIK';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
