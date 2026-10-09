import { NextResponse } from 'next/server'
import { getP24BaseUrl, getP24Config } from '@/lib/p24/gpay'

// GET /api/p24/gpay/config — jawne dane potrzebne przeglądarce do Google Pay przez P24 (jedno źródło prawdy z serwera).
export async function GET() {
    const config = getP24Config()

    return NextResponse.json({
        merchantId: String(config.merchantId),
        merchantName: config.merchantName,
        environment: config.sandbox ? 'TEST' : 'PRODUCTION',
        baseUrl: getP24BaseUrl(config),
    })
}
