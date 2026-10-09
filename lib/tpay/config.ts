import { tpayPublicConfig } from '@/lib/payments/config'

// Identyfikatory grup/kanałów Tpay (dokumentacja: docs-api.tpay.com)
export const TPAY_GROUP = {
    blik: 150,
    card: 103,
    googlePay: 166,
} as const

export const TPAY_CHANNEL = {
    applePay: 75,
} as const

const URLS = {
    sandbox: {
        api: 'https://openapi.sandbox.tpay.com',
        secure: 'https://secure.sandbox.tpay.com',
    },
    production: {
        api: 'https://api.tpay.com',
        secure: 'https://secure.tpay.com',
    },
} as const

export const getTpayConfig = () => {
    const environment = tpayPublicConfig.environment
    return {
        environment,
        apiUrl: URLS[environment].api,
        secureUrl: URLS[environment].secure,
        clientId: process.env.TPAY_CLIENT_ID ?? '',
        clientSecret: process.env.TPAY_CLIENT_SECRET ?? '',
        appUrl: (process.env.NEXT_PUBLIC_APP_URL ?? '').replace(/\/$/, ''),
        paypoChannelId: Number(process.env.TPAY_PAYPO_CHANNEL_ID) || null,
        appleDomain: process.env.APPLE_PAY_DOMAIN ?? '',
        appleDisplayName: process.env.APPLE_PAY_DISPLAY_NAME || 'Carinii',
    }
}
