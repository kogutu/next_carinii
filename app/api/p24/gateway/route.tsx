'use server';

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const P24_CONFIG = {
  merchantId: 125840,
  crcKey: 'be058f2b5a885ed6',
};

const P24_SANDBOX_URL = 'https://sandbox.przelewy24.pl';

/**
 * POST /api/p24/gateway
 * Generuje URL do bramki Przelewy24 dla metody redirect
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      amount,
      email,
      description,
      firstName,
      lastName,
      phone,
      orderId,
    } = body;

    // Walidacja danych
    if (!sessionId || !amount || !email) {
      return NextResponse.json(
        { error: 'Wymagane pola: sessionId, amount, email' },
        { status: 400 }
      );
    }


    // Tworzenie sygnatury
    const amountInGrosze = Math.round(amount * 100);
    const signatureString = `${P24_CONFIG.merchantId}|${sessionId}|${amount}|${P24_CONFIG.crcKey}`;
    const signature = crypto.createHash('md5').update(signatureString).digest('hex');

    console.log('[v0] Gateway Payment Request:', {
      sessionId,
      amount,
      amountInGrosze,
      email,
      description,
    });

    // Parametry do bramki
    const params = new URLSearchParams({
      p24_merchant_id: P24_CONFIG.merchantId.toString(),
      p24_pos_id: P24_CONFIG.merchantId.toString(),
      p24_session_id: sessionId,
      p24_amount: amountInGrosze.toString(),
      p24_currency: 'PLN',
      p24_description: description || `Zamówienie ${sessionId.split('-')[0]}`,
      p24_email: email,
      p24_first_name: firstName || 'Klient',
      p24_last_name: lastName || 'Test',
      p24_phone: phone || '',
      p24_sign: signature,
      p24_method: '0', // wszystkie metody
      p24_url_return: `${req.nextUrl.origin}/payment/return`,
      p24_url_status: `${req.nextUrl.origin}/api/p24/verify`,
      p24_language: 'pl',
    });

    const gatewayUrl = `${P24_SANDBOX_URL}/trnRequest/${params.toString()}`;

    return NextResponse.json({
      success: true,
      url: gatewayUrl,
      sessionId,
      amount: amountInGrosze,
      signature,
      message: 'URL bramki wygenerowany pomyślnie',
    });
  } catch (error) {
    console.error('[v0] Gateway Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd generowania bramki' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/p24/gateway/config
 * Zwraca konfigurację bramki
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    config: {
      merchantId: P24_CONFIG.merchantId,
      sandboxUrl: P24_SANDBOX_URL,
      apiVersion: 'v1',
      supportedMethods: [
        'all', // Wszystkie metody
        'creditCard', // Karty kredytowe
        'bankTransfer', // Przelewy bankowe
        'googlePay', // Google Pay
        'applePay', // Apple Pay
        'blik', // BLIK
      ],
    },
  });
}
