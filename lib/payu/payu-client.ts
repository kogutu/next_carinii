/**
 * PayU REST API Client
 * Obsługa PayPo (Pay Later) przez PayU
 *
 * Dokumentacja: https://developers.payu.com/europe/docs/payment-solutions/credit/paylater/
 *
 * Flow:
 * 1. Frontend wywołuje API route -> tworzy zamówienie w PayU z payMethod: { type: "PBL", value: "dpp" }
 * 2. PayU zwraca redirectUri -> użytkownik jest przekierowany na stronę PayPo
 * 3. Użytkownik potwierdza na stronie PayPo
 * 4. PayU wysyła notyfikację (webhook) na notifyUrl ze statusem zamówienia
 * 5. Frontend sprawdza status zamówienia przez polling GET /api/v2_1/orders/{orderId}
 */

import logger from '@/lib/logger';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PayUConfig {
    /** PayU OAuth client_id (z panelu merchanta, POS) */
    clientId: string;
    /** PayU OAuth client_secret */
    clientSecret: string;
    /** Merchant POS ID */
    merchantPosId: string;
    /** Second key (MD5) - do weryfikacji podpisów notyfikacji */
    secondKey: string;
    /** Środowisko: sandbox lub production */
    environment: 'sandbox' | 'production';
}

export interface PayUBuyer {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    language?: string;
    delivery?: {
        street: string;
        postalCode: string;
        city: string;
        countryCode: string;
    };
}

export interface PayUProduct {
    name: string;
    unitPrice: string; // w groszach, np. "15000" = 150.00 PLN
    quantity: string;
}

export interface PayUCreateOrderRequest {
    notifyUrl: string;
    continueUrl: string; // URL powrotu po płatności
    customerIp: string;
    merchantPosId: string;
    description: string;
    currencyCode: string;
    totalAmount: string; // w groszach
    extOrderId: string;
    buyer: PayUBuyer;
    products: PayUProduct[];
    payMethods: {
        payMethod: {
            type: 'PBL';
            value: string; // "dpp" dla PayPo PL
        };
    };
}

export interface PayUCreateOrderResponse {
    status: {
        statusCode: string; // "SUCCESS", "WARNING_CONTINUE_REDIRECT"
    };
    redirectUri: string;
    orderId: string;
    extOrderId?: string;
}

export interface PayUOrderStatus {
    orders: Array<{
        orderId: string;
        extOrderId: string;
        orderCreateDate: string;
        notifyUrl: string;
        customerIp: string;
        merchantPosId: string;
        description: string;
        currencyCode: string;
        totalAmount: string;
        status: 'NEW' | 'PENDING' | 'WAITING_FOR_CONFIRMATION' | 'COMPLETED' | 'CANCELED' | 'REJECTED';
        buyer: PayUBuyer;
        products: PayUProduct[];
    }>;
    status: {
        statusCode: string;
    };
}

export type PayPoOrderStatus = 'NEW' | 'PENDING' | 'WAITING_FOR_CONFIRMATION' | 'COMPLETED' | 'CANCELED' | 'REJECTED';

// ─── PayU Notification (webhook) ─────────────────────────────────────────────

export interface PayUNotification {
    order: {
        orderId: string;
        extOrderId: string;
        orderCreateDate: string;
        notifyUrl: string;
        customerIp: string;
        merchantPosId: string;
        description: string;
        currencyCode: string;
        totalAmount: string;
        status: PayPoOrderStatus;
        buyer: PayUBuyer;
        payMethod: {
            type: string;
        };
        products: PayUProduct[];
    };
    localReceiptDateTime?: string;
    properties?: Array<{
        name: string;
        value: string;
    }>;
}

// ─── Client ──────────────────────────────────────────────────────────────────

class PayUClient {
    private config: PayUConfig;
    private accessToken: string | null = null;
    private tokenExpiresAt: number = 0;

    constructor(config: PayUConfig) {
        this.config = config;
    }

    private get baseUrl(): string {
        return this.config.environment === 'sandbox'
            ? 'https://secure.snd.payu.com'
            : 'https://secure.payu.com';
    }

    /**
     * Pobiera OAuth access token (cache'owany do wygaśnięcia)
     */
    async getAccessToken(): Promise<string> {
        if (this.accessToken && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const response = await fetch(`${this.baseUrl}/pl/standard/user/oauth/authorize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('PayU OAuth error', errorText);
            throw new Error(`PayU OAuth failed: ${response.status}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        // Token ważny 43199 sekund, odnawiamy 5 min wcześniej
        this.tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

        return this.accessToken!;
    }

    /**
     * Tworzy zamówienie PayPo
     * Zwraca redirectUri na który należy przekierować użytkownika
     */
    async createPayPoOrder(params: {
        sessionId: string;
        amount: number; // w złotych, np. 150.00
        description: string;
        buyer: PayUBuyer;
        products: PayUProduct[];
        notifyUrl: string;
        continueUrl: string;
        customerIp: string;
    }): Promise<PayUCreateOrderResponse> {
        const token = await this.getAccessToken();
        const totalAmountInCents = Math.round(params.amount * 100).toString();

        const orderRequest: PayUCreateOrderRequest = {
            notifyUrl: params.notifyUrl,
            continueUrl: params.continueUrl,
            customerIp: params.customerIp,
            merchantPosId: this.config.merchantPosId,
            description: params.description,
            currencyCode: 'PLN',
            totalAmount: totalAmountInCents,
            extOrderId: params.sessionId,
            buyer: params.buyer,
            products: params.products,
            payMethods: {
                payMethod: {
                    type: 'PBL',
                    value: 'dpp', // PayPo na polskim rynku
                },
            },
        };

        logger.log('PayU create order request', orderRequest);

        // WAŻNE: PayU zwraca 302 redirect - musimy wyłączyć auto-redirect
        const response = await fetch(`${this.baseUrl}/api/v2_1/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderRequest),
            redirect: 'manual', // Nie podążaj za redirectem!
        });

        // PayU zwraca 302 z Location header lub 200 z JSON
        if (response.status === 302) {
            const locationHeader = response.headers.get('Location');
            // Pobierz orderId z response body jeśli dostępny
            let orderId = '';
            try {
                const body = await response.json();
                orderId = body.orderId;
            } catch {
                // Jeśli body nie jest dostępny, wyciągnij orderId z Location URL
                if (locationHeader) {
                    const match = locationHeader.match(/orderId=([^&]+)/);
                    orderId = match ? match[1] : '';
                }
            }

            return {
                status: { statusCode: 'SUCCESS' },
                redirectUri: locationHeader || '',
                orderId,
            };
        }

        if (!response.ok && response.status !== 302) {
            const errorText = await response.text();
            logger.error('PayU create order error', errorText);
            throw new Error(`PayU order creation failed: ${response.status} - ${errorText}`);
        }

        const data: PayUCreateOrderResponse = await response.json();
        logger.log('PayU create order response', data);
        return data;
    }

    /**
     * Sprawdza status zamówienia (GET)
     */
    async getOrderStatus(orderId: string): Promise<PayUOrderStatus> {
        const token = await this.getAccessToken();

        const response = await fetch(`${this.baseUrl}/api/v2_1/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`PayU get order status failed: ${response.status}`);
        }

        return response.json();
    }

    /**
     * Weryfikuje podpis notyfikacji PayU (webhook)
     * Nagłówek: OpenPayu-Signature
     * Format: sender=checkout;signature=...;algorithm=MD5;content=DOCUMENT
     */
    verifyNotificationSignature(body: string, signatureHeader: string): boolean {
        const crypto = require('crypto');

        const parts = signatureHeader.split(';').reduce((acc: Record<string, string>, part) => {
            const [key, value] = part.split('=');
            acc[key] = value;
            return acc;
        }, {});

        const algorithm = parts.algorithm || 'MD5';
        const expectedSignature = parts.signature;

        // signature = algorithm(json_body + secondKey)
        const concatenated = body + this.config.secondKey;
        const computedSignature = crypto
            .createHash(algorithm.toLowerCase())
            .update(concatenated, 'utf-8')
            .digest('hex');

        return computedSignature === expectedSignature;
    }
}

// ─── Singleton instance ──────────────────────────────────────────────────────

const payuConfig: PayUConfig = {
    clientId: process.env.PAYU_CLIENT_ID || '',
    clientSecret: process.env.PAYU_CLIENT_SECRET || '',
    merchantPosId: process.env.PAYU_MERCHANT_POS_ID || '',
    secondKey: process.env.PAYU_SECOND_KEY || '',
    environment: (process.env.PAYU_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
};
console.log(payuConfig);
export const payuClient = new PayUClient(payuConfig);
export default payuClient;