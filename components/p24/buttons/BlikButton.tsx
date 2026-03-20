'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';
import { CheckoutData } from '@/lib/p24/checkout-types';
import { p24Client } from '@/lib/p24/p24-client';
import logger from '@/lib/logger';

const BlikLogo = ({ className = "w-16 h-8" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 135.64 64.18" className={className}>
    <linearGradient id="blik-a" x1="67.82" y1="63.051" x2="67.82" y2="1.128" gradientUnits="userSpaceOnUse">
      <stop stopColor="#5a5a5a" offset="0" />
      <stop stopColor="#484848" offset="0.146" />
      <stop stopColor="#212121" offset="0.52" />
      <stop stopColor="#080808" offset="0.817" />
      <stop offset="1" />
    </linearGradient>
    <linearGradient id="blik-o" x1="39.667" y1="19.898" x2="49.695" y2="9.87" gradientUnits="userSpaceOnUse">
      <stop stopColor="#e52f08" offset="0" />
      <stop stopColor="#e94f96" offset="1" />
    </linearGradient>
    <filter id="blik-b" x="21.709" y="10.07" width="99.399" height="50.159" filterUnits="userSpaceOnUse">
      <feOffset dx="2.379" dy="2.973" />
      <feGaussianBlur result="blur" stdDeviation="0.743" />
      <feFlood floodOpacity="0.949" />
      <feComposite in2="blur" operator="in" result="result1" />
      <feComposite in="SourceGraphic" in2="result1" />
    </filter>
    <path fill="url(#blik-a)" d="M 127.725,0.827 H 7.915 A 7.083,7.083 0 0 0 0.828,7.906 v 48.368 a 7.082,7.082 0 0 0 7.087,7.078 h 119.81 a 7.082,7.082 0 0 0 7.086,-7.078 V 7.906 a 7.083,7.083 0 0 0 -7.086,-7.079 z" />
    <path fill="url(#blik-o)" d="m 51.769,14.884 a 7.088,7.088 0 0 1 -7.088,7.088 7.088,7.088 0 0 1 -7.088,-7.088 7.088,7.088 0 0 1 7.088,-7.088 7.088,7.088 0 0 1 7.088,7.088 z" />
    <path fill="#ffffff" filter="url(#blik-b)" d="m 106.28,55.03 h 10.206 L 104.224,39.193 115.343,25.585 h -9.257 L 95.167,39.278 v -29.2 H 87.242 V 55.03 h 7.925 L 95.161,39.316 Z M 72.294,25.58 h 7.923 V 55.025 H 72.294 Z M 57.34,10.069 h 7.923 V 55.025 H 57.34 Z M 36.741,25.286 a 14.968,14.968 0 0 0 -7.108,1.784 v -17 H 21.709 V 40.312 A 15.03,15.03 0 1 0 36.741,25.286 Z m 0,22.26 a 7.233,7.233 0 1 1 7.233,-7.234 7.231,7.231 0 0 1 -7.233,7.234 z" />
  </svg>
);

interface BlikButtonProps {
  checkoutData: CheckoutData;
  sessionId: string;
  onPaymentSuccess?: () => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentStart?: () => void;
}

interface BlikStatus {
  transactionId: string;
  code: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  message: string;
}

export function BlikButton({
  checkoutData,
  sessionId,
  onPaymentSuccess,
  onPaymentFailed,
  onPaymentStart,
}: BlikButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [blikCode, setBlikCode] = useState('777123');
  const [orderIdP24, setOrderIdP24] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [blikStatus, setBlikStatus] = useState<BlikStatus | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [pollingCount, setPollingCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollingAttempts = 30;

  const fetchBlikStatus = async (oidP24: string) => {
    try {

      setOrderIdP24(oidP24);
      logger.success("OidP24", oidP24);
      if (!oidP24) throw 'Bład p24';

      logger.log(orderIdP24);
      const response = await p24Client.getBlikStatus(sessionId, oidP24, checkoutData);
      console.log('[v0] BLIK Status Response:', response);

      return {
        transactionId: response.transactionId,
        code: blikCode,
        status: response.status,
        message: response.message,
      };
    } catch (error) {
      console.error('[v0] Error fetching BLIK status:', error);
      throw error;
    }
  };

  const startPolling = async (oidP24: string) => {
    setIsPolling(true);
    setPollingCount(0);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const currentStatus = await fetchBlikStatus(oidP24);
        setBlikStatus(
          {
            transactionId: sessionId,
            code: blikCode,
            status: currentStatus.status,
            message: 'Zamówienie zostało opłacone, dziękujemy',
          }

        );
        logger.success("Blik status", currentStatus);
        logger.success("Blik status", currentStatus.status);


        console.log(`[v0] BLIK Status Poll #${pollingCount + 1}:`, currentStatus.status);

        setPollingCount((prev) => prev + 1);

        if (currentStatus.status === 'success') {

          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

          setIsPaid(true);

          // Auto-close after 6 seconds
          successTimeoutRef.current = setTimeout(() => {
            handleCancel();
          }, 6000);

          onPaymentSuccess?.();
        } else if (currentStatus.status === 'failed') {
          setIsPolling(false);
          setErrorMessage(currentStatus.message);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          onPaymentFailed?.(currentStatus.message);
        } else if (pollingCount >= maxPollingAttempts) {
          setIsPolling(false);
          setErrorMessage('Transakcja BLIK przekroczyła limit czasu');
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          onPaymentFailed?.('Timeout');
        }
      } catch (error) {
        console.error('[v0] BLIK polling error:', error);
        setIsPolling(false);
        setErrorMessage('Błąd podczas pobierania statusu BLIK');
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const handleBlikSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (blikCode.length !== 6 || !/^\d+$/.test(blikCode)) {
      setErrorMessage('Kod BLIK musi zawierać 6 cyfr');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    onPaymentStart?.();



    try {
      // console.log(checkoutData);
      // throw 'check';
      // Wysyłanie kodu BLIK do API
      var r = await p24Client.blikCharge(sessionId, blikCode, checkoutData);
      logger.log(r);
      if (!r.data.orderId) throw new Error("Wystąpił problem z bramką płatniczą");

      setOrderIdP24(r.data.orderId)
      setBlikStatus({
        transactionId: sessionId,
        code: blikCode,
        status: 'pending',
        message: 'Kod BLIK otrzymany. Oczekiwanie na potwierdzenie...',
      });


      await startPolling(r.data.orderId);
    } catch (error: any) {
      setIsSubmitting(false);

      // alert(JSON.stringify(error));
      if (error == "400") error = "Wystąpił błąd, spróbuj jeszcze raz";
      setErrorMessage(error.toString());
      onPaymentFailed?.('Błąd wysyłania');
    }
  };

  const handleCancel = () => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setIsPolling(false);
    setShowModal(false);
    setBlikCode('');
    setBlikStatus(null);
    setPollingCount(0);
    setErrorMessage('');
  };

  const btnBlik = (load: boolean = true) => {
    return (
      (!load) ? (
        <Button
          onClick={() => setShowModal(true)}
          className="w-auto bg-[#050505] hover:bg-gray-800 cursor-pointer text-white"
          size="lg"
        >
          <BlikLogo className="!h-6 !w-auto mr-2" />
          Płać BLIK ({checkoutData.grandTotal.toFixed(2)} zł)
        </Button>
      ) :
        (
          <Button
            onClick={() => setShowModal(true)}
            className="w-auto bg-[#050505] hover:bg-gray-800 cursor-pointer text-white"
            size="lg"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
              <span className="text-white text-base font-medium">Przetwarzanie...</span>
            </div>
          </Button>

        )


    );
  };

  // ─── Success screen with animated confirmation ───
  if (showModal && blikStatus?.status === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-sm mx-4 space-y-6 text-center">
          {/* BLIK Logo */}
          <div className="flex justify-center">
            <BlikLogo className="w-24 h-12" />
          </div>

          {/* Animated success icon */}
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center">
              {/* Pulsing ring */}
              <div
                className="absolute w-24 h-24 rounded-full border-4 border-green-300"
                style={{
                  animation: 'blik-pulse-ring 1.5s ease-out infinite',
                  opacity: 0,
                }}
              />
              {/* Outer circle */}
              <div
                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                style={{
                  animation: 'blik-scale-in 0.4s ease-out forwards',
                }}
              >
                {/* Animated checkmark */}
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 30,
                    strokeDashoffset: 30,
                    animation: 'blik-draw-check 0.5s ease-out 0.3s forwards',
                  }}
                >
                  <polyline points="5 13 10 18 20 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2
              className="text-2xl font-bold text-green-700 dark:text-green-400"
              style={{ animation: 'blik-fade-in-up 0.4s ease-out 0.5s both' }}
            >
              Płatność zakończona!
            </h2>
            <p
              className="text-gray-600 dark:text-gray-300 text-sm"
              style={{ animation: 'blik-fade-in-up 0.4s ease-out 0.7s both' }}
            >
              Zamówienie zostało poprawnie opłacone.
            </p>
            <p
              className="text-gray-500 dark:text-gray-400 text-xs"
              style={{ animation: 'blik-fade-in-up 0.4s ease-out 0.8s both' }}
            >
              Kwota: {(checkoutData.grandTotal).toFixed(2)} zł
            </p>
          </div>

          <Button
            onClick={handleCancel}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            style={{ animation: 'blik-fade-in-up 0.4s ease-out 0.9s both' }}
          >
            Zamknij
          </Button>

          <p
            className="text-xs text-gray-400 dark:text-gray-500"
            style={{ animation: 'blik-fade-in-up 0.4s ease-out 1s both' }}
          >
            Okno zamknie się automatycznie...
          </p>

          {/* Inline keyframes for animations */}
          <style>{`
            @keyframes blik-scale-in {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.15); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes blik-draw-check {
              to { stroke-dashoffset: 0; }
            }
            @keyframes blik-pulse-ring {
              0% { transform: scale(0.8); opacity: 0.6; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes blik-fade-in-up {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // ─── Polling screen (pending / processing / failed) ───
  if (showModal && isPolling) {
    return (

      <div>
        {btnBlik()}

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <BlikLogo className="w-16 h-8" />
                <h2 className="text-xl font-bold">Płatność BLIK</h2>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {blikStatus && (
              <div className="space-y-3">
                {blikStatus.status === 'pending' && (
                  <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      {blikStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                {blikStatus.status === 'processing' && (
                  <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
                    <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                    <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                      {blikStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                {blikStatus.status === 'failed' && (
                  <Alert className="border-red-300 bg-red-50 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {blikStatus.message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Próba {pollingCount + 1}/{maxPollingAttempts}</span>
                    <span>{Math.round((pollingCount / maxPollingAttempts) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(pollingCount / maxPollingAttempts) * 100}%` }}
                    />
                  </div>
                </div>

                {blikStatus.status !== 'failed' && (
                  <Button variant="outline" onClick={handleCancel} className="w-full">
                    Anuluj
                  </Button>
                )}

                {blikStatus.status === 'failed' && (
                  <Button onClick={handleCancel} className="w-full bg-blue-600 hover:bg-blue-700">
                    Zamknij
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div >
    );
  }

  // ─── BLIK code input screen ───
  if (showModal && !isPolling) {
    return (

      <div>
        {btnBlik()}

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <BlikLogo className="w-16 h-8" />
                <h2 className="text-xl font-bold">Płatność BLIK</h2>
              </div>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBlikSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kod BLIK (6 cyfr)</label>
                <Input
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={blikCode}
                  onChange={(e) => {
                    setBlikCode(e.target.value.slice(0, 6).replace(/\D/g, ''));
                    setErrorMessage('');
                  }}
                  maxLength={6}
                  className="text-3xl tracking-widest text-center font-mono"
                  disabled={isSubmitting}
                />
                {errorMessage && (
                  <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-800 rounded p-3 text-sm">
                <p className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Instrukcja:</p>
                <ol className="text-blue-800 dark:text-blue-200 list-decimal list-inside space-y-1 text-xs">
                  <li>Otwórz aplikację bankową</li>
                  <li>Przejdź do BLIK</li>
                  <li>Wygeneruj kod</li>
                  <li>Wpisz powyżej</li>
                </ol>
              </div>

              <Button
                type="submit"
                disabled={blikCode.length !== 6 || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wysyłanie...
                  </>
                ) : (
                  `Zapłać ${(checkoutData.grandTotal).toFixed(2)} zł`
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full"
              >
                Anuluj
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main button ───
  if (isPaid) {
    return (
      <Button
        disabled
        className="w-auto bg-[#050505] text-white cursor-not-allowed opacity-90"
        size="lg"
      >

        <BlikLogo className="w-12 h-6 mr-2" />
        <CheckCircle2 className="text-green-500 w-4 h-4 mr-2" />
        Zapłacono ({(checkoutData.grandTotal).toFixed(2)} zł)
      </Button>
    );
  }

  return (
    <div>
      {btnBlik(false)}
    </div>
  );
}