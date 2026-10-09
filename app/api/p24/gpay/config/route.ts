import { NextResponse } from 'next/server'
import { getP24BaseUrl, getP24Config } from '@/lib/p24/gpay'

// GET /api/p24/gpay/config — jawne dane potrzebne przeglądarce do Google Pay przez P24 (jedno źródło prawdy z serwera).
export async function GET() {
    const config = getP24Config()

    // bez konfiguracji P24 (np. brak zmiennych na nowym środowisku) przycisk Google Pay się nie pokazuje, zamiast działać „na ślepo”
    if (!Number.isFinite(config.merchantId) || config.merchantId <= 0 || !config.apiKey || !config.crcKey) {
        return NextResponse.json({ error: 'Przelewy24 nie jest skonfigurowane' }, { status: 503 })
    }

    return NextResponse.json({
        merchantId: String(config.merchantId),
        merchantName: config.merchantName,
        environment: config.sandbox ? 'TEST' : 'PRODUCTION',
        baseUrl: getP24BaseUrl(config),
    })
}
