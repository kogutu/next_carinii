import crypto from 'crypto';

// Dane konfiguracyjne Przelewy24
const P24_CONFIG = {
  merchantId: 125840,
  orderKey: '0b98e5f4',
  crcKey: 'be058f2b5a885ed6',
  apiKey: 'f0d3213a2591b9fd232fd93fbc8a874a',
};

// Przelewy24 API endpoints
const P24_SANDBOX_URL = 'https://sandbox.przelewy24.pl';
const P24_PRODUCTION_URL = 'https://secure.przelewy24.pl';

/**
 * Generate signature for Przelewy24 requests
 * Signature = md5(merchantId|sessionId|amount|crcKey)
 */
export function generateSignature(sessionId: string, amount: number): string {
  const signatureString = `${P24_CONFIG.merchantId}|${sessionId}|${amount}|${P24_CONFIG.crcKey}`;
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

/**
 * Generate payment gateway URL for redirect payment
 */
export function generatePaymentGatewayUrl(
  sessionId: string,
  amount: number,
  email: string,
  description: string,
  useSandbox = true
): string {
  const signature = generateSignature(sessionId, amount);
  const baseUrl = useSandbox ? P24_SANDBOX_URL : P24_PRODUCTION_URL;

  const params = new URLSearchParams({
    p24_merchant_id: P24_CONFIG.merchantId.toString(),
    p24_pos_id: P24_CONFIG.merchantId.toString(),
    p24_session_id: sessionId,
    p24_amount: (amount * 100).toString(), // amount in groszy (cents)
    p24_currency: 'PLN',
    p24_description: description,
    p24_email: email,
    p24_sign: signature,
    p24_method: '0', // all payment methods
  });

  return `${baseUrl}/trnRequest/${params.toString()}`;
}

/**
 * Verify Przelewy24 notification signature
 * Used for IPN (Instant Payment Notification) verification
 */
export function verifyNotificationSignature(
  merchantId: string,
  sessionId: string,
  amount: string,
  signature: string
): boolean {
  const expectedSignature = generateSignature(sessionId, parseInt(amount) / 100);
  return signature === expectedSignature && merchantId === P24_CONFIG.merchantId.toString();
}

/**
 * Generate session ID for payment
 */
export function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const P24 = {
  merchantId: P24_CONFIG.merchantId,
  generateSignature,
  generatePaymentGatewayUrl,
  verifyNotificationSignature,
  generateSessionId,
};
