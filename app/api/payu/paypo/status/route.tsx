/**
 * GET /api/payu/paypo/status?orderId=XXX
 *
 * Sprawdza aktualny status zamówienia PayPo w PayU
 * Używane do pollingu z frontendu po powrocie z redirect
 */
import { NextRequest, NextResponse } from 'next/server';
import payuClient from '@/lib/payu/payu-client';

export async function GET(request: NextRequest) {
    try {
        const orderId = request.nextUrl.searchParams.get('orderId');

        if (!orderId) {
            return NextResponse.json({ error: 'Brak orderId' }, { status: 400 });
        }

        const result = await payuClient.getOrderStatus(orderId);

        if (!result.orders || result.orders.length === 0) {
            return NextResponse.json({ error: 'Zamówienie nie znalezione' }, { status: 404 });
        }

        const order = result.orders[0];

        return NextResponse.json({
            success: true,
            data: {
                orderId: order.orderId,
                extOrderId: order.extOrderId,
                status: order.status,
                totalAmount: order.totalAmount,
                currencyCode: order.currencyCode,
            },
        });
    } catch (error: any) {
        console.error('[PayPo] Status check error:', error);
        return NextResponse.json(
            { error: error.message || 'Błąd sprawdzania statusu' },
            { status: 500 }
        );
    }
}