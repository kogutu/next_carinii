'use server';

import { NextRequest, NextResponse } from 'next/server';
import { registerTransaction } from '@/lib/p24/p24-sdk';

/**
 * POST /api/p24/register
 * Wysyła żądanie do Przelewy24 w kwestii rejestracji transakcji i zwraca url
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      sessionId,
      amount,
      currency,
      description,
      email,
      oid,
      client,
      country,
      language,
      method,
      channel,
      methodRefId,
      timeLimit,
    } = body;

    if (!sessionId || !amount || !description || !email || !oid) {
      return NextResponse.json(
        { error: 'Brak wymaganych pól: sessionId, amount, description, email, oid' },
        { status: 400 }
      );
    }

    const result = await registerTransaction({
      sessionId,
      amount,
      currency,
      description,
      email,
      oid,
      client,
      country,
      language,
      method,
      channel,
      methodRefId,
      timeLimit,
    });

    return NextResponse.json({
      token: result.token,
      redirectUrl: result.redirectUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Błąd rejestracji transakcji';
    console.error('P24 register error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}