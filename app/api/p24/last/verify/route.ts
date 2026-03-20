// app/api/p24/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyTransaction } from '../../../../../lib/p24/p24-sdk';

// Adresy IP Przelewy24 - whitelist do weryfikacji notyfikacji
const P24_IPS = [
  '91.216.191.181',
  '91.216.191.182',
  '91.216.191.183',
  '91.216.191.184',
  '91.216.191.185',
  '5.252.202.255',
];

export async function POST(req: NextRequest) {
  try {
    // Opcjonalnie: weryfikacja IP nadawcy
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor?.split(',')[0]?.trim();

    // W produkcji odkomentuj poniższy blok:
    // if (clientIp && !P24_IPS.includes(clientIp)) {
    //   console.warn(`P24 Verify: nieautoryzowany IP: ${clientIp}`);
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const body = await req.json();
    const { merchantId, posId, sessionId, amount, originAmount, currency, orderId, methodId, statement, sign } = body;

    console.log('P24 Notification received:', {
      sessionId,
      orderId,
      amount,
      currency,
      methodId,
      statement,
    });

    // Weryfikuj transakcję w P24
    const result = await verifyTransaction({
      sessionId,
      orderId,
      amount,
      currency,
    });

    console.log('P24 Verification result:', result);

    // ─── Tu dodaj swoją logikę biznesową ─────────────────────
    // np. zaktualizuj status zamówienia w bazie danych
    // await db.order.update({ where: { sessionId }, data: { status: 'PAID', p24OrderId: orderId } });

    return NextResponse.json({ status: 'OK' });
  } catch (error: unknown) {
    console.error('P24 Verify Error:', error);
    const message = error instanceof Error ? error.message : 'Błąd weryfikacji transakcji';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
