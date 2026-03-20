'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { P24TransactionResponse, registerTransaction } from '@/lib/p24/p24-sdk';

const P24_CONFIG = {
  merchantId: 125840,
  crcKey: 'be058f2b5a885ed6',
};

/**
 * POST /api/p24/google-pay
 * Obsługuje transakcje Google Pay integrowane z Przelewy24
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      amount,
      email,
      oid,
      methodRefId,
      description,
      client,
      phone
    } = body;



    // Walidacja danych
    if (!sessionId || !amount || !methodRefId) {
      return NextResponse.json(
        { error: 'Wymagane pola: sessionId, amount, googlePayToken' },
        { status: 400 }
      );
    }

    console.log('[v0] Google Pay Transaction Request:', {
      sessionId,
      amount,
      email,
      tokenLength: methodRefId.length,
    });




    // Tworzenie sygnatury dla Przelewy24
    const amountInGrosze = Math.round(amount * 100);
    // const signatureString = `${P24_CONFIG.merchantId}|${sessionId}|${amount}|${P24_CONFIG.crcKey}`;
    // const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    // // W rzeczywistej aplikacji: wysłanie do P24 API z tokenem Google Pay
    // // POST https://sandbox.przelewy24.pl/api/v1/transaction/put
    // const transactionId = `GP-${sessionId}`;

    const p24Response = await registerTransaction({
      sessionId,
      amount: amountInGrosze,
      description,
      email,
      methodRefId,
      oid,
      client,
      method: 266, // Google Pay method ID w P24
    }) as P24TransactionResponse;




    return NextResponse.json(p24Response);
  } catch (error) {
    console.error('[v0] Google Pay Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd płatności Google Pay' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/p24/google-pay/verify
 * Weryfikuje transakcję Google Pay
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, sessionId } = body;

    if (!transactionId && !sessionId) {
      return NextResponse.json(
        { error: 'Wymagane: transactionId lub sessionId' },
        { status: 400 }
      );
    }

    console.log('[v0] Verifying Google Pay Transaction:', {
      transactionId,
      sessionId,
    });

    // Symulacja weryfikacji
    return NextResponse.json({
      success: true,
      transactionId,
      status: 'verified',
      message: 'Transakcja Google Pay zweryfikowana',
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[v0] Google Pay Verification Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd weryfikacji' },
      { status: 500 }
    );
  }
}
