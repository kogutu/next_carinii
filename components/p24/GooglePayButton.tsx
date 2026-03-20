'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { P24 } from '@/lib/przelewy24';

interface GooglePayButtonProps {
  amount: number;
  sessionId: string;
  email?: string;
  onPayment?: () => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_PAY_CONFIG = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
        allowedCardNetworks: ['MASTERCARD', 'VISA'],
      },
      tokenizationSpecification: {
        type: 'PAYMENT_GATEWAY',
        parameters: {
          gateway: 'przelewy24',
          gatewayMerchantId: '125840',
        },
      },
    },
  ],
  merchantInfo: {
    merchantId: '125840',
    merchantName: 'Sklep Demo',
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    currencyCode: 'PLN',
    totalPrice: '0.00',
  },
};

export function GooglePayButton({
  amount,
  sessionId,
  email = 'customer@example.com',
  onPayment,
}: GooglePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [googlePayAvailable, setGooglePayAvailable] = useState(false);

  useEffect(() => {
    // Sprawdzaj dostępność Google Pay API
    const checkGooglePayAvailability = async () => {
      if (typeof window === 'undefined') return;

      // Załaduj Google Pay script
      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = async () => {
        try {
          if (!window.google?.payments?.api?.PaymentsClient) {
            console.warn('[v0] Google Pay API not available');
            return;
          }

          const client = new window.google.payments.api.PaymentsClient({
            environment: 'TEST', // TEST dla sandbox, PRODUCTION dla produkcji
          });

          const isReadyToPayRequest = {
            apiVersion: GOOGLE_PAY_CONFIG.apiVersion,
            apiVersionMinor: GOOGLE_PAY_CONFIG.apiVersionMinor,
            allowedPaymentMethods: GOOGLE_PAY_CONFIG.allowedPaymentMethods,
          };

          const response = await client.isReadyToPay(isReadyToPayRequest);
          setGooglePayAvailable(response.result);
          console.log('[v0] Google Pay available:', response.result);
        } catch (error) {
          console.error('[v0] Google Pay initialization error:', error);
          setGooglePayAvailable(false);
        }
      };
      document.head.appendChild(script);
    };

    checkGooglePayAvailability();
  }, []);

  const handleGooglePayClick = async () => {
    if (!window.google?.payments?.api?.PaymentsClient) {
      setStatus('error');
      setErrorMessage('Google Pay API nie jest dostępny');
      return;
    }

    setIsLoading(true);
    setStatus('processing');
    setErrorMessage('');

    try {
      const amountInGrosze = Math.round(amount);
      const amountInZloty = (amountInGrosze / 100).toFixed(2);

      const client = new window.google.payments.api.PaymentsClient({
        environment: 'TEST',
      });

      const paymentDataRequest = {
        ...GOOGLE_PAY_CONFIG,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          currencyCode: 'PLN',
          totalPrice: amountInZloty,
        },
      };

      console.log('[v0] Requesting Google Pay payment...', {
        amount: amountInZloty,
        sessionId,
        email,
      });

      const paymentData = await client.requestPaymentData(paymentDataRequest);

      // Uzyskaliśmy token od Google Pay
      if (paymentData && paymentData.paymentMethodData) {
        const token = paymentData.paymentMethodData.tokenizationData?.token;
        const description = paymentData.paymentMethodData.description || 'Google Pay';

        console.log('[v0] Google Pay token received:', {
          description,
          tokenLength: token?.length || 0,
        });

        // Przygotuj payload dla Przelewy24 z tokenem Google Pay
        const signature = P24.generateSignature(sessionId, amountInGrosze / 100);

        const p24Payload = {
          merchantId: P24.merchantId,
          posId: P24.merchantId,
          sessionId: sessionId,
          amount: amountInGrosze,
          currency: 'PLN',
          description: `Zapłata ${description} - ${sessionId.split('-')[0]}`,
          email: email,
          sign: signature,
          method: 215, // Google Pay method
          googlePayToken: token,
          orderCreateDate: new Date().toISOString(),
        };

        console.log('[v0] Prepared P24 payload:', {
          merchantId: p24Payload.merchantId,
          sessionId: p24Payload.sessionId,
          amount: p24Payload.amount,
          method: p24Payload.method,
        });

        // Symulacja wysłania do Przelewy24 backend
        // W rzeczywistej aplikacji: POST /api/payment/google-pay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setStatus('success');
        onPayment?.();
      }
    } catch (error: any) {
      console.error('[v0] Google Pay error:', error);

      if (error.statusCode === 'CANCELED') {
        setStatus('error');
        setErrorMessage('Płatność została anulowana');
      } else {
        setStatus('error');
        setErrorMessage(error.message || 'Błąd podczas przetwarzania płatności Google Pay');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm0 22c-5.52 0-10-4.48-10-10S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" />
          </svg>
          Google Pay
        </CardTitle>
        <CardDescription>Płatność poprzez Google Pay API integrowana z Przelewy24</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'success' && (
          <Alert className="border-green-300 bg-green-50 text-green-800 dark:bg-green-950 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Płatność Google Pay przesłana do Przelewy24! Kwota: {(amount / 100).toFixed(2)} zł
            </AlertDescription>
          </Alert>
        )}

        {errorMessage && status === 'error' && (
          <Alert className="border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {!googlePayAvailable && (
          <Alert className="border-yellow-300 bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Google Pay nie jest dostępny. Upewnij się, że masz zainstalowaną aplikację Google Pay lub usługę Google Wallet.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded text-sm dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-2">Jak to działa:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Kliknij przycisk aby otwórz Google Pay</li>
            <li>Wybierz kartę i potwierdź płatność w Google Pay</li>
            <li>Token zostanie przesłany do Przelewy24</li>
            <li>Płatność zostanie przetworzona i potwierdzona</li>
            <li>Status: {googlePayAvailable ? 'Dostępny' : 'Niedostępny w tym środowisku'}</li>
          </ul>
        </div>

        <Button
          onClick={handleGooglePayClick}
          disabled={isLoading || status === 'success' || !googlePayAvailable}
          className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Przetwarzanie...
            </>
          ) : status === 'success' ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Płatność zatwierdzona
            </>
          ) : (
            `Zapłać ${(amount / 100).toFixed(2)} zł za pomocą Google Pay`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
