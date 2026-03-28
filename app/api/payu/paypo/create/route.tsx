/**
 * POST /api/payu/paypo/create
 *
 * Tworzy zamówienie PayPo w PayU i zwraca redirectUri
 */
import { NextRequest, NextResponse } from 'next/server';
import payuClient from '@/lib/payu/payu-client';
import type { PayUBuyer, PayUProduct } from '@/lib/payu/payu-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            sessionId,
            amount,
            description,
            buyer,
            products,
        }: {
            sessionId: string;
            amount: number;
            description: string;
            buyer: PayUBuyer;
            products: PayUProduct[];
        } = body;

        // Walidacja kwoty PayPo (10 - 8000 PLN)
        if (amount < 10 || amount > 8000) {
            return NextResponse.json(
                { error: 'PayPo dostępne dla kwot 10-8000 PLN' },
                { status: 400 }
            );
        }

        if (!sessionId || !buyer?.email || !buyer?.firstName || !buyer?.lastName) {
            return NextResponse.json(
                { error: 'Brakujące dane zamówienia' },
                { status: 400 }
            );
        }

        const customerIp =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            '127.0.0.1';

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const result = await payuClient.createPayPoOrder({
            sessionId,
            amount,
            description,
            buyer,
            products,
            notifyUrl: `${baseUrl}/api/payu/notify`,
            continueUrl: `${baseUrl}/payment/status?session=${sessionId}`,
            customerIp,
        });

        return NextResponse.json({
            success: true,
            data: {
                redirectUri: result.redirectUri,
                orderId: result.orderId,
            },
        });
    } catch (error: any) {
        console.error('[PayPo] Create order error:', error);
        return NextResponse.json(
            { error: error.message || 'Błąd tworzenia zamówienia PayPo' },
            { status: 500 }
        );
    }
}