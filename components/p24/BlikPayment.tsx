'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface BlikPaymentProps {
  amount: number;
  sessionId: string;
  onPayment?: (code: string) => void;
}

interface BlikStatus {
  transactionId: string;
  code: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'expired';
  message: string;
  timestamp: number;
}

export function BlikPayment({ amount, sessionId, onPayment }: BlikPaymentProps) {
  const [blikCode, setBlikCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'polling' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [blikStatus, setBlikStatus] = useState<BlikStatus | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const maxPollingAttempts = 30; // 30 sekund (co 1 sekundę)

  // Symulacja pobierania statusu BLIK z backendu
  const fetchBlikStatus = async (transactionId: string): Promise<BlikStatus> => {
    // W rzeczywistej aplikacji: GET /api/payment/blik/status?transactionId=...
    // Tutaj symulujemy odpowiedź serwera
    
    const responses: BlikStatus[] = [
      {
        transactionId,
        code: blikCode,
        status: 'pending',
        message: 'Oczekiwanie na potwierdzenie w aplikacji mobilnej...',
        timestamp: Date.now(),
      },
      {
        transactionId,
        code: blikCode,
        status: 'processing',
        message: 'Przetwarzanie transakcji BLIK...',
        timestamp: Date.now(),
      },
      {
        transactionId,
        code: blikCode,
        status: 'success',
        message: 'Transakcja BLIK została zatwierdzona!',
        timestamp: Date.now(),
      },
    ];

    // Symulacja: losowy wybór statusu (90% sukcess, 10% failure po kilku próbach)
    const randomIndex = Math.floor(Math.random() * 100);
    if (randomIndex > 90 && pollingCount > 8) {
      return {
        transactionId,
        code: blikCode,
        status: 'failed',
        message: 'Transakcja BLIK została odrzucona. Spróbuj ponownie.',
        timestamp: Date.now(),
      };
    }

    // Symulacja progresji statusu
    if (pollingCount < 2) {
      return responses[0]; // pending
    } else if (pollingCount < 5) {
      return responses[1]; // processing
    } else {
      return responses[2]; // success
    }
  };

  // Funkcja do rozpoczęcia polingu
  const startPolling = async () => {
    setIsPolling(true);
    setStatus('polling');
    setPollingCount(0);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const currentStatus = await fetchBlikStatus(sessionId);
        setBlikStatus(currentStatus);
        
        console.log(`[v0] BLIK Status Poll #${pollingCount + 1}:`, {
          status: currentStatus.status,
          message: currentStatus.message,
          attempt: pollingCount + 1,
        });

        setPollingCount((prev) => prev + 1);

        // Koniec polingu na powodzenie lub błąd
        if (currentStatus.status === 'success') {
          setStatus('success');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
          onPayment?.(blikCode);
        } else if (currentStatus.status === 'failed') {
          setStatus('error');
          setErrorMessage(currentStatus.message);
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        } else if (pollingCount >= maxPollingAttempts) {
          // Timeout - zbyt wiele prób
          setStatus('error');
          setErrorMessage('Transakcja BLIK przekroczyła limit czasu. Spróbuj ponownie.');
          setIsPolling(false);
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
          }
        }
      } catch (error) {
        console.error('[v0] BLIK polling error:', error);
        setStatus('error');
        setErrorMessage('Błąd podczas pobierania statusu BLIK');
        setIsPolling(false);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
      }
    }, 1000); // Pobieraj status co 1 sekundę
  };

  // Cleanup przy unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleBlikSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (blikCode.length !== 6 || !/^\d+$/.test(blikCode)) {
      setErrorMessage('Kod BLIK musi zawierać 6 cyfr');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Symulacja wysłania kodu BLIK do backendu
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setBlikStatus({
        transactionId: sessionId,
        code: blikCode,
        status: 'pending',
        message: 'Kod BLIK otrzymany. Oczekiwanie na potwierdzenie...',
        timestamp: Date.now(),
      });

      setStatus('submitted');
      setIsLoading(false);

      // Rozpocznij polling
      await startPolling();
    } catch (error) {
      setStatus('error');
      setErrorMessage('Błąd podczas wysyłania kodu BLIK');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    setIsPolling(false);
    setStatus('idle');
    setBlikCode('');
    setBlikStatus(null);
    setPollingCount(0);
    setErrorMessage('');
  };

  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          Płatność BLIK
        </CardTitle>
        <CardDescription>
          {isPolling
            ? 'Oczekiwanie na potwierdzenie z aplikacji mobilnej...'
            : 'Wprowadź 6-cyfrowy kod z aplikacji moBankingu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleBlikSubmit} className="space-y-4">
          {/* Input do kodu BLIK - widoczny tylko w początkowym stanie */}
          {!isPolling && status === 'idle' && (
            <div>
              <Label htmlFor="blik-code">Kod BLIK</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="blik-code"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={blikCode}
                  onChange={(e) => {
                    setBlikCode(e.target.value.slice(0, 6).replace(/\D/g, ''));
                    setStatus('idle');
                    setErrorMessage('');
                  }}
                  maxLength={6}
                  className="text-2xl tracking-widest text-center font-mono"
                  disabled={isLoading}
                />
              </div>
              {errorMessage && (
                <p className="text-red-600 text-sm mt-2">{errorMessage}</p>
              )}
            </div>
          )}

          {/* Status podczas polingu */}
          {(isPolling || status === 'submitted') && blikStatus && (
            <div className="space-y-3">
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 dark:bg-gray-900 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">ID Transakcji:</p>
                <p className="font-mono text-sm">{blikStatus.transactionId}</p>
              </div>

              {blikStatus.status === 'pending' && (
                <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 dark:text-blue-200">
                    {blikStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              {blikStatus.status === 'processing' && (
                <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                    {blikStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              {blikStatus.status === 'success' && (
                <Alert className="border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {blikStatus.message} Kwota: {(amount / 100).toFixed(2)} zł
                  </AlertDescription>
                </Alert>
              )}

              {blikStatus.status === 'failed' && (
                <Alert className="border-red-300 bg-red-50 dark:bg-red-950 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {blikStatus.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Progress bar polingu */}
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
            </div>
          )}

          {/* Instrukcja */}
          {status === 'idle' && (
            <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded text-sm dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200">
              <p className="font-semibold mb-2">Instrukcja:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Otwórz aplikację mBanku na swoim telefonie</li>
                <li>Przejdź do sekcji BLIK</li>
                <li>Wygeneruj 6-cyfrowy kod</li>
                <li>Wpisz kod poniżej</li>
              </ol>
            </div>
          )}

          {/* Przyciski */}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={blikCode.length !== 6 || isLoading || isPolling}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                `Zapłać ${(amount / 100).toFixed(2)} zł`
              )}
            </Button>

            {isPolling && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                size="lg"
              >
                Anuluj
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
