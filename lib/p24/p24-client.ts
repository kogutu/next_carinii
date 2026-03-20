'use client';

import logger from "../logger";

/**
 * Klient API do komunikacji z endpointami Przelewy24
 */

interface P24Response<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  [key: string]: any;
}

class P24Client {
  private baseUrl: string;

  constructor() {
    this.baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  }

  /**
   * Wysyła żądanie BLIK charge
   */
  async blikCharge(sessionId: string, blikCode: string, checkoutData: any) {
    const email = checkoutData.customer.email;
    const amount: number = checkoutData.grandTotal;
    const description = "Zam #" + checkoutData.incrementId;
    const client = checkoutData.customer.firstName + " " + checkoutData.customer.lastName;
    const phone = checkoutData.customer.phone;
    const oid = checkoutData.incrementId;


    console.log('[lib/p24] BLIK Charge Request:', { sessionId, amount });
    const response = await fetch('/api/p24/blik', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, amount, blikCode, email, oid, client, phone, description }),
    });

    if (!response.ok) {
      let r = await response.json();
      console.log(r);

      throw (`${r.error}`);
    }

    return response.json();
  }

  /**
   * Sprawdza status transakcji BLIK
   */
  async getBlikStatus(sessionId: string, oidP24: string, checkoutData: any) {
    console.log('[lib/p24] Getting BLIK Status:', { sessionId });

    // if (sessionId) {
    //   const response = await fetch(`/api/p24/blik/status?sessionId=${encodeURIComponent(sessionId)}`);
    //   if (!response.ok) throw new Error('Failed to get BLIK status');
    //   return response.json();
    // }
    const orderId = oidP24;
    // Alternatywa - POST
    const response = await fetch('/api/p24/blik/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, orderId, checkoutData }),
    });

    if (!response.ok) throw new Error('Failed to get BLIK status');
    const r = await response.json();
    logger.log(r)
    return r
  }

  /**
   * Weryfikuje IPN od Przelewy24
   */
  async verifyNotification(data: Record<string, any>) {
    console.log('[v0] Verifying IPN Notification');
    const response = await fetch('/api/p24/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Wysyła transakcję Google Pay
   */
  async googlePayTransaction(
    sessionId: string,
    amount: number,
    googlePayToken: string,
    email?: string,
    description?: string,
    client?: string,
    phone?: string
  ) {
    console.log('[v0] Google Pay Transaction Request:', {
      sessionId,
      amount,
      email,
    });

    const methodRefId = googlePayToken;

    const response = await fetch('/api/p24/google-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        amount,
        email,
        methodRefId,
        description,
        client,
        phone
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Pay failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Weryfikuje transakcję Google Pay
   */
  async verifyGooglePayTransaction(transactionId: string, sessionId?: string) {
    console.log('[v0] Verifying Google Pay Transaction:', { transactionId });

    const response = await fetch('/api/p24/google-pay', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, sessionId }),
    });

    if (!response.ok) {
      throw new Error('Verification failed');
    }

    return response.json();
  }

  /**
   * Generuje URL bramki Przelewy24
   */
  async getGatewayUrl(
    sessionId: string,
    amount: number,
    email: string,
    description?: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ) {
    console.log('[v0] Getting Gateway URL:', { sessionId, amount });

    const response = await fetch('/api/p24/gateway', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        amount,
        email,
        description,
        firstName,
        lastName,
        phone,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get gateway URL');
    }

    return response.json();
  }

  /**
   * Pobiera konfigurację bramki
   */
  async getGatewayConfig() {
    console.log('[v0] Getting Gateway Config');
    const response = await fetch('/api/p24/gateway');

    if (!response.ok) {
      throw new Error('Failed to get gateway config');
    }

    return response.json();
  }
}

// Export singleton instance
export const p24Client = new P24Client();

// Export class dla testowania
export { P24Client };
