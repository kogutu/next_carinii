'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { CheckoutData } from '@/lib/p24/checkout-types';
import { p24Client } from '@/lib/p24/p24-client';
import { BASE_URL, P24_CONFIG } from '@/lib/p24/p24-sdk';

interface GooglePayButtonProps {
  checkoutData: CheckoutData;
  sessionId: string;
  onPaymentSuccess?: () => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentStart?: () => void;
}

declare global {
  interface Window {
    google?: {
      payments?: {
        api: {
          PaymentsClient: new (config: { environment: string }) => any;
        };
      };
    };
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
          gatewayMerchantId: '' + P24_CONFIG.merchantId,
        },
      },
    },
  ],
  merchantInfo: {
    merchantId: '' + P24_CONFIG.merchantId,
    merchantName: '' + P24_CONFIG.merchantName,
  },
  transactionInfo: {
    totalPriceStatus: 'FINAL',
    currencyCode: 'PLN',
    totalPrice: '0.00',
  },
};

// Google "G" logo — colored
function GoogleGLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" />
      <path fill="#34A853" d="M6.3 14.7l7 5.1C15 15.6 19.1 12 24 12c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.6 6.3 14.7z" />
      <path fill="#FBBC04" d="M24 46c5.4 0 10.3-1.8 14.1-5l-6.5-5.5C29.5 37.4 26.9 38 24 38c-6 0-11.1-4-12.9-9.5l-7 5.4C7.6 41.4 15.2 46 24 46z" />
      <path fill="#EA4335" d="M44.5 20H24v8.5h11.8c-1 3.2-3 5.8-5.7 7.5l6.5 5.5C40.6 37.5 46 31.5 46 24c0-1.3-.2-2.7-.5-4z" />
    </svg>
  );
}

// Visa network icon
function VisaIcon() {
  return (
    <svg width="28" height="18" viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" rx="40" fill="#1A1F71" />
      <path
        d="M293.2 348.7l33.4-195.8h53.4l-33.4 195.8zM540.7 157.2c-10.6-4-27.2-8.3-47.9-8.3-52.8 0-90 26.6-90.2 64.7-.3 28.2 26.5 43.9 46.8 53.3 20.8 9.6 27.8 15.8 27.7 24.4-.1 13.2-16.6 19.2-32 19.2-21.4 0-32.7-3-50.3-10.2l-6.9-3.1-7.5 44c12.5 5.5 35.6 10.2 59.6 10.5 56.1 0 92.5-26.3 92.9-67 .2-22.3-14-39.3-44.8-53.3-18.6-9.1-30.1-15.1-30-24.3 0-8.1 9.7-16.8 30.6-16.8 17.4-.3 30.1 3.5 39.9 7.5l4.8 2.3 7.3-42.9zM676.3 152.9h-41.3c-12.8 0-22.4 3.5-28 16.3l-79.3 179.5h56.1s9.2-24.1 11.2-29.4c6.1 0 60.7.1 68.5.1 1.6 6.9 6.5 29.3 6.5 29.3h49.6l-43.3-195.8zm-65.8 126.3c4.4-11.3 21.4-54.8 21.4-54.8-.3.5 4.4-11.4 7.1-18.8l3.6 17s10.3 47 12.5 56.6h-44.6zM231.4 152.9l-52.3 133.5-5.6-27.1c-9.7-31.2-39.9-65.1-73.7-82l47.8 171.3 56.5-.1 84.1-195.7h-56.8z"
        fill="#fff"
      />
      <path
        d="M131.9 152.9H46.3l-.7 4c67 16.2 111.3 55.3 129.7 102.3l-18.7-90c-3.2-12.4-12.6-16-24.7-16.3z"
        fill="#F9A533"
      />
    </svg>
  );
}

// Mastercard network icon
function MastercardIcon() {
  return (
    <svg width="28" height="18" viewBox="0 0 780 500" xmlns="http://www.w3.org/2000/svg">
      <rect width="780" height="500" rx="40" fill="#000" />
      <circle cx="310" cy="250" r="170" fill="#EB001B" />
      <circle cx="470" cy="250" r="170" fill="#F79E1B" />
      <path
        d="M390 120.8c-44.5 35.1-73 89.4-73 150.2s28.5 115.1 73 150.2c44.5-35.1 73-89.4 73-150.2S434.5 155.9 390 120.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function CardNetworkIcon({ network }: { network: string }) {
  switch (network.toUpperCase()) {
    case 'VISA':
      return <VisaIcon />;
    case 'MASTERCARD':
      return <MastercardIcon />;
    default:
      return (
        <div className="w-7 h-[18px] bg-gray-600 rounded-sm flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">{network.slice(0, 4)}</span>
        </div>
      );
  }
}

export function GooglePayButton({
  checkoutData,
  sessionId,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentStart,
}: GooglePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState('');
  const [paymentsClient, setPaymentsClient] = useState<any>(null);
  const [cardInfo, setCardInfo] = useState<{
    lastFour: string;
    network: string;
  } | null>(null);

  useEffect(() => {
    const checkGooglePayAvailability = async () => {
      if (typeof window === 'undefined') return;

      if (document.querySelector('script[src*="pay.google.com"]')) {
        initClient();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://pay.google.com/gp/p/js/pay.js';
      script.async = true;
      script.onload = () => initClient();
      document.head.appendChild(script);
    };

    const initClient = async () => {
      try {
        if (!window.google?.payments?.api?.PaymentsClient) return;

        const client = new window.google.payments.api.PaymentsClient({
          environment: 'TEST',
        });

        const response = await client.isReadyToPay({
          apiVersion: GOOGLE_PAY_CONFIG.apiVersion,
          apiVersionMinor: GOOGLE_PAY_CONFIG.apiVersionMinor,
          allowedPaymentMethods: GOOGLE_PAY_CONFIG.allowedPaymentMethods,
        });

        if (response.result) {
          setPaymentsClient(client);
          setIsAvailable(true);
        }
      } catch (err) {
        console.error('[v0] Google Pay initialization error:', err);
        setIsAvailable(false);
      }
    };

    checkGooglePayAvailability();

  }, []);

  const RegisterGPayIn24 = (token) => {
    return new Promise((resolve, reject) => {

      const js = document.createElement("script");
      js.type = "text/javascript";
      js.src = `${BASE_URL}/bundle/payWithGoogle/${token}`;

      js.onload = function () {

        if (typeof Przelewy24PayWithGoogle === "undefined") {
          reject("Brak obiektu Przelewy24PayWithGoogle");
          return;
        }

        Przelewy24PayWithGoogle.config({
          errorCallback: function () {
            alert("error");
            reject("error");
          },
          exceptionCallback: function () {
            alert("exception");
            reject("exception");
          },
          requestFailedCallback: function () {
            alert("requestFailed");
            reject("requestFailed");
          },
          completePaymentCallback: function () {
            alert("success");
            resolve("success");
          }
        });

        Przelewy24PayWithGoogle.charge();
      };

      js.onerror = function () {
        reject("Nie udało się załadować skryptu");
      };

      document.body.appendChild(js);
    });
  };

  const handleGooglePayClick = async () => {
    if (!paymentsClient) {
      setError('Google Pay API nie jest dostępny');
      return;
    }

    setIsLoading(true);
    setError('');
    onPaymentStart?.();

    try {
      const amountInZloty = checkoutData.grandTotal.toFixed(2);

      const paymentDataRequest = {
        ...GOOGLE_PAY_CONFIG,
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          currencyCode: 'PLN',
          totalPrice: amountInZloty,
        },
      };

      const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);

      if (paymentData?.paymentMethodData) {
        const methodRefId = paymentData.paymentMethodData.tokenizationData?.token;


        const info = paymentData.paymentMethodData.info;

        // Extract card info for display
        if (info) {
          setCardInfo({
            lastFour: info.cardDetails || '••••',
            network: info.cardNetwork || '',
          });
        }

        const description = "Zam #" + checkoutData.incrementId;
        const client = checkoutData.customer.firstName + " " + checkoutData.customer.lastName;
        const phone = checkoutData.customer.phone;


        try {
          const response = await p24Client.googlePayTransaction(
            sessionId,
            checkoutData.grandTotal,
            methodRefId,
            checkoutData.customer.email,
            description,
            client,
            phone
          );

          console.log('[v0] Google Pay Transaction Response:', response);
          const token = response.token;
          alert(token)
          RegisterGPayIn24(token);
          setIsLoading(false);
          onPaymentSuccess?.();
        } catch (apiError) {
          console.error('[v0] Google Pay API Error:', apiError);
          setError('Błąd wysyłania do Przelewy24');
          onPaymentFailed?.(apiError instanceof Error ? apiError.message : 'Błąd API');
          setIsLoading(false);
        }
      }
    } catch (error: any) {
      console.error('[v0] Google Pay error:', error);

      if (error.statusCode === 'CANCELED') {
        setError('Płatność została anulowana');
      } else {
        setError(error.message || 'Błąd podczas przetwarzania płatności Google Pay');
      }

      onPaymentFailed?.(error.message || 'Błąd płatności');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-auto">
      {error && (
        <Alert className="mb-3 border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Google Pay Button — official style */}
      <button
        onClick={handleGooglePayClick}
        disabled={isLoading || !isAvailable}
        className="
          w-auto h-14 px-6
          bg-black hover:bg-neutral-800 active:bg-neutral-900
          disabled:opacity-50 disabled:cursor-not-allowed
          rounded-full
          flex items-center justify-center gap-3
          transition-colors duration-150
          shadow-lg hover:shadow-xl
          border border-neutral-700
          focus:outline-none focus:ring-2 focus:ring-white/30
        "
      >
        {isLoading ? (
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
            <span className="text-white text-base font-medium">Przetwarzanie...</span>
          </div>
        ) : (
          <div className="flex items-center gap-0">
            {/* G Pay logo */}
            <div className="flex items-center gap-1.5">
              <GoogleGLogo size={22} />
              <span className="text-white text-lg font-medium tracking-tight">Pay</span>
            </div>

            {/* Separator + card info (if available) */}
            {cardInfo ? (
              <>
                <div className="w-px h-8 bg-neutral-600 mx-4" />
                <div className="flex items-center gap-2.5">
                  <CardNetworkIcon network={cardInfo.network} />
                  <span className="text-white text-base tracking-widest">
                    ····&nbsp;{cardInfo.lastFour}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-8 bg-neutral-600 mx-4" />
                <span className="text-neutral-300 text-sm font-normal">
                  {checkoutData.grandTotal.toFixed(2)} zł
                </span>
              </>
            )}
          </div>
        )}
      </button>

      {!isAvailable && !isLoading && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center flex items-center justify-center gap-1.5">
          <GoogleGLogo size={14} />
          <span>Pay nie jest dostępny w tym środowisku</span>
        </p>
      )}
    </div>
  );
}