'use server';

import logger from '@/lib/logger';
import { setUrlsP24, verifyTransaction } from '@/lib/p24/p24-sdk';
import { NextRequest, NextResponse } from 'next/server';

interface BlikStatusRecord {
  [key: string]: {
    status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
    transactionId: string;
    amount: number;
    createdAt: number;
    attempts: number;
  };
}

// Simulated in-memory store for BLIK transactions
const blikTransactions: BlikStatusRecord = {};

/**
 * POST /api/p24/blik/status
 * Sprawdza status transakcji BLIK
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, orderId, checkoutData } = body;

    if (!sessionId && orderId && !checkoutData) {
      return NextResponse.json(
        { error: 'Wymagane: sessionId lub checkoutData' },
        { status: 400 }
      );
    }

    console.log(orderId);

    setUrlsP24(checkoutData.incrementId);
    // ─── Verify Transaction ──────────────────────────────────────────
    // Called when P24 sends notification to urlStatus
    const transaction: any = await verifyTransaction({
      sessionId,
      orderId: orderId,
      amount: checkoutData.grandTotal * 100,
      currency: 'PLN',
    });




    // Symulacja progresji statusu
    let status = transaction.status;






    console.log({
      success: true,
      sessionId,
      transactionId: transaction.transactionId,
      status,
      attempts: transaction.attempts,
      message: getStatusMessage(status),
    })
    return NextResponse.json({
      success: true,
      sessionId,
      transactionId: transaction.transactionId,
      status,
      attempts: transaction.attempts,
      message: getStatusMessage(status),
    });


  } catch (error) {
    console.error('[v0] BLIK Status Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd sprawdzenia statusu' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/p24/blik/status?sessionId=...
 */
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Wymagany parametr: sessionId' },
        { status: 400 }
      );
    }

    const transaction = blikTransactions[sessionId];

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transakcja nie znaleziona' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId,
      ...transaction,
      message: getStatusMessage(transaction.status),
    });
  } catch (error) {
    console.error('[v0] BLIK Status GET Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Błąd' },
      { status: 500 }
    );
  }
}

function getStatusMessage(status: string): string {
  const messages: { [key: string]: string } = {
    pending: 'Oczekiwanie na potwierdzenie w aplikacji bankowej',
    processing: 'Transakcja jest przetwarzana',
    success: 'Transakcja zakończona sukcesem',
    failed: 'Transakcja nie powiodła się',
    expired: 'Transakcja wygasła - limit czasu przekroczony',
  };
  return messages[status] || 'Nieznany status';
}
