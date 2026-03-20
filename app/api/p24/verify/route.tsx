'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const P24_CONFIG = {
  merchantId: 125840,
  crcKey: 'be058f2b5a885ed6',
};

/**
 * POST /api/p24/verify
 * Weryfikuje notyfikację IPN (Instant Payment Notification) od Przelewy24
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      p24_merchant_id,
      p24_session_id,
      p24_amount,
      p24_order_id,
      p24_sign,
      p24_transaction_id,
      p24_statement,
    } = body;

    console.log('[v0] IPN Verification Request:', {
      merchantId: p24_merchant_id,
      sessionId: p24_session_id,
      transactionId: p24_transaction_id,
      amount: p24_amount,
    });

    // Walidacja wymaganych pól
    if (!p24_merchant_id || !p24_session_id || !p24_amount || !p24_sign) {
      return NextResponse.json(
        { error: 'Brakuje wymaganych pól' },
        { status: 400 }
      );
    }

    // Walidacja merchant ID
    if (parseInt(p24_merchant_id) !== P24_CONFIG.merchantId) {
      console.error('[v0] Invalid merchant ID:', p24_merchant_id);
      return NextResponse.json(
        { error: 'Nieprawidłowe ID handlowca' },
        { status: 403 }
      );
    }

    // Weryfikacja sygnatury
    const signatureString = `${p24_merchant_id}|${p24_session_id}|${p24_amount}|${P24_CONFIG.crcKey}`;
    const expectedSignature = crypto.createHash('md5').update(signatureString).digest('hex');

    if (p24_sign !== expectedSignature) {
      console.error('[v0] Invalid signature:', {
        received: p24_sign,
        expected: expectedSignature,
      });
      return NextResponse.json(
        { error: 'Nieprawidłowa sygnatura' },
        { status: 403 }
      );
    }

    console.log('[v0] IPN Signature verified successfully');

    // Tutaj można zaktualizować status zamówienia w bazie danych
    // np: updateOrderStatus(p24_session_id, 'paid', p24_transaction_id)

    return NextResponse.json({
      success: true,
      message: 'Notyfikacja zweryfikowana pomyślnie',
      data: {
        sessionId: p24_session_id,
        transactionId: p24_transaction_id,
        amount: p24_amount,
        status: 'verified',
      },
    });
  } catch (error) {
    console.error('[v0] IPN Verification Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd weryfikacji' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/p24/verify
 * Health check dla endpoint weryfikacji
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'IPN Verification endpoint is running',
  });
}
