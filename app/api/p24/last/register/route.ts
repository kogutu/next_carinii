// app/api/p24/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { registerTransaction } from '../../../../../lib/p24/p24-sdk';;
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            amount,
            description,
            email,
            client,
            method, // 154 = BLIK, 266 = Google Pay, undefined = bramka
        } = body;

        if (!amount || !email) {
            return NextResponse.json(
                { error: 'Wymagane pola: amount, email' },
                { status: 400 }
            );
        }

        // Generate unique sessionId
        const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const result = await registerTransaction({
            sessionId,
            amount: Math.round(amount * 100), // konwersja PLN -> grosze
            description: description || 'Zamówienie',
            email,
            client,
            urlReturn: `${appUrl}/payment/return?sessionId=${sessionId}`,
            urlStatus: `${appUrl}/api/p24/verify`,
            method,
            // Kanały: 1=karty, 2=przelewy, 4=tradycyjny, 8=N/A, 16=wszystkie 24/7,
            // 32=PayU, 64=Raty, 128=koszyk, 256=Pay by link, 4096=GooglePay, 8192=BLIK
            channel: method === 154 ? 8192 : undefined,
        });

        return NextResponse.json({
            token: result.token,
            redirectUrl: result.redirectUrl,
            sessionId,
        });
    } catch (error: unknown) {
        console.error('P24 Register Error:', error);
        const message = error instanceof Error ? error.message : 'Błąd rejestracji transakcji';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}