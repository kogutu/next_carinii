'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    CheckCircle2,
    AlertCircle,
    Clock,
    X,
    ExternalLink,
    ShieldCheck,
} from 'lucide-react';
import { CheckoutData } from '@/lib/p24/checkout-types';
import logger from '@/lib/logger';

// ─── PayPo Logo ──────────────────────────────────────────────────────────────

const PayPoLogo = ({ className = 'w-16 h-8' }: { className?: string }) => (
    <svg viewBox="0 0 120 40" className={className} xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="40" rx="6" fill="#00C853" />
        <text
            x="60"
            y="26"
            textAnchor="middle"
            fontFamily="'Segoe UI', Tahoma, sans-serif"
            fontWeight="700"
            fontSize="20"
            fill="#FFFFFF"
            letterSpacing="1"
        >
            PayPo
        </text>
    </svg>
);

// ─── Types ───────────────────────────────────────────────────────────────────

interface PayPoButtonProps {
    checkoutData: CheckoutData;
    sessionId: string;
    onPaymentSuccess?: () => void;
    onPaymentFailed?: (error: string) => void;
    onPaymentStart?: () => void;
}

type PayPoFlowState =
    | 'idle'
    | 'creating'       // tworzenie zamówienia w PayU
    | 'redirecting'     // przekierowanie na stronę PayPo
    | 'polling'         // sprawdzanie statusu po powrocie
    | 'success'
    | 'failed'
    | 'canceled';

// ─── Component ───────────────────────────────────────────────────────────────

export function PayPoButton({
    checkoutData,
    sessionId,
    onPaymentSuccess,
    onPaymentFailed,
    onPaymentStart,
}: PayPoButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [flowState, setFlowState] = useState<PayPoFlowState>('idle');
    const [payuOrderId, setPayuOrderId] = useState('');
    const [redirectUri, setRedirectUri] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [pollingCount, setPollingCount] = useState(0);

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const maxPollingAttempts = 120; // 2 minuty (polling co 1s)

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        };
    }, []);

    // ─── Sprawdź czy wracamy z redirect PayPo ──────────────────────────────────
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const sessionParam = urlParams.get('session');
        const errorParam = urlParams.get('error');

        if (sessionParam === sessionId) {
            // Wracamy z PayPo - sprawdź status
            if (errorParam) {
                setFlowState('failed');
                setErrorMessage('Płatność PayPo została anulowana lub odrzucona');
                setShowModal(true);
            } else {
                // Rozpocznij polling statusu
                setShowModal(true);
                setFlowState('polling');
                // Pobierz orderId z localStorage (zapisane przed redirect)
                const savedOrderId = localStorage.getItem(`paypo_order_${sessionId}`);
                if (savedOrderId) {
                    setPayuOrderId(savedOrderId);
                    startPolling(savedOrderId);
                }
            }

            // Wyczyść URL params
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }, [sessionId]);

    // ─── Create order & redirect ───────────────────────────────────────────────

    const handlePayPoSubmit = async () => {
        setFlowState('creating');
        setErrorMessage('');
        onPaymentStart?.();

        try {
            // Walidacja kwoty (PayPo: 10-8000 PLN)
            if (checkoutData.grandTotal < 10 || checkoutData.grandTotal > 8000) {
                throw new Error('PayPo dostępne dla zamówień od 10 do 8000 zł');
            }

            const response = await fetch('/api/payu/paypo/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    amount: checkoutData.grandTotal,
                    description: `Zamówienie ${sessionId}`,
                    buyer: {
                        email: checkoutData.customer.email || '',
                        phone: checkoutData.customer.phone || '',
                        firstName: checkoutData.billingAddress.firstName || '',
                        lastName: checkoutData.billingAddress.lastName || '',
                    },
                    products: checkoutData.items?.map((item: any) => ({
                        name: item.name || 'Produkt',
                        unitPrice: Math.round((item.price || 0) * 100).toString(),
                        quantity: (item.quantity || 1).toString(),
                    })) || [
                            {
                                name: `Zamówienie ${sessionId}`,
                                unitPrice: Math.round(checkoutData.grandTotal * 100).toString(),
                                quantity: '1',
                            },
                        ],
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Błąd tworzenia zamówienia');
            }

            const { redirectUri: uri, orderId } = result.data;

            if (!uri) {
                throw new Error('Brak adresu przekierowania z PayU');
            }

            setPayuOrderId(orderId);
            setRedirectUri(uri);
            setFlowState('redirecting');

            // Zapisz orderId przed redirect (potrzebne po powrocie)
            localStorage.setItem(`paypo_order_${sessionId}`, orderId);

            // Przekieruj na stronę PayPo (z krótkim opóźnieniem żeby user widział info)
            setTimeout(() => {
                window.location.href = uri;
            }, 1500);
        } catch (error: any) {
            logger.error('PayPo error', error);
            setFlowState('failed');
            setErrorMessage(error.message || 'Wystąpił błąd');
            onPaymentFailed?.(error.message || 'Błąd PayPo');
        }
    };

    // ─── Polling ───────────────────────────────────────────────────────────────

    const startPolling = useCallback((orderId: string) => {
        setFlowState('polling');
        setPollingCount(0);
        let count = 0;

        pollingIntervalRef.current = setInterval(async () => {
            try {
                const response = await fetch(`/api/payu/paypo/status?orderId=${orderId}`);
                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.error);
                }

                const { status } = result.data;
                count++;
                setPollingCount(count);

                logger.log(`PayPo status poll #${count}: ${status}`);

                if (status === 'COMPLETED') {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setFlowState('success');
                    setIsPaid(true);
                    localStorage.removeItem(`paypo_order_${sessionId}`);

                    successTimeoutRef.current = setTimeout(() => {
                        handleClose();
                    }, 6000);

                    onPaymentSuccess?.();
                } else if (status === 'CANCELED' || status === 'REJECTED') {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setFlowState('failed');
                    localStorage.removeItem(`paypo_order_${sessionId}`);
                    setErrorMessage(
                        status === 'CANCELED'
                            ? 'Płatność została anulowana'
                            : 'PayPo odrzuciło wniosek o płatność'
                    );
                    onPaymentFailed?.(status);
                } else if (count >= maxPollingAttempts) {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setFlowState('failed');
                    setErrorMessage('Przekroczono czas oczekiwania na potwierdzenie');
                    onPaymentFailed?.('Timeout');
                }
                // PENDING / WAITING_FOR_CONFIRMATION / NEW -> kontynuuj polling
            } catch (error: any) {
                logger.error('PayPo polling error', error);
                // Nie przerywaj pollingu przy pojedynczym błędzie
                count++;
                setPollingCount(count);
                if (count >= maxPollingAttempts) {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setFlowState('failed');
                    setErrorMessage('Błąd sprawdzania statusu płatności');
                }
            }
        }, 2000); // co 2 sekundy
    }, [sessionId, onPaymentSuccess, onPaymentFailed]);

    // ─── Handlers ──────────────────────────────────────────────────────────────

    const handleClose = () => {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
        setShowModal(false);
        setFlowState('idle');
        setErrorMessage('');
        setPollingCount(0);
    };

    const handleOpenModal = () => {
        setShowModal(true);
        setFlowState('idle');
        setErrorMessage('');
    };

    const formatAmount = (amount: number) => amount.toFixed(2);

    // ═══════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════

    // ─── Success screen ────────────────────────────────────────────────────────
    if (showModal && flowState === 'success') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-sm mx-4 space-y-6 text-center">

                    <div className="flex justify-center">
                        <PayPoLogo className="w-24 h-10" />
                    </div>

                    <div className="flex justify-center">
                        <div className="relative flex items-center justify-center">
                            <div
                                className="absolute w-24 h-24 rounded-full border-4 border-green-300"
                                style={{
                                    animation: 'paypo-pulse-ring 1.5s ease-out infinite',
                                    opacity: 0,
                                }}
                            />
                            <div
                                className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center"
                                style={{ animation: 'paypo-scale-in 0.4s ease-out forwards' }}
                            >
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
                                        animation: 'paypo-draw-check 0.5s ease-out 0.3s forwards',
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
                            style={{ animation: 'paypo-fade-in-up 0.4s ease-out 0.5s both' }}
                        >
                            Płatność zakończona!
                        </h2>
                        <p
                            className="text-gray-600 dark:text-gray-300 text-sm"
                            style={{ animation: 'paypo-fade-in-up 0.4s ease-out 0.7s both' }}
                        >
                            Zamówienie zostało poprawnie opłacone przez PayPo.
                        </p>
                        <p
                            className="text-gray-500 dark:text-gray-400 text-xs"
                            style={{ animation: 'paypo-fade-in-up 0.4s ease-out 0.8s both' }}
                        >
                            Kwota: {formatAmount(checkoutData.grandTotal)} zł — zapłacisz za 30 dni
                        </p>
                    </div>

                    <Button
                        onClick={handleClose}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        style={{ animation: 'paypo-fade-in-up 0.4s ease-out 0.9s both' }}
                    >
                        Zamknij
                    </Button>

                    <p
                        className="text-xs text-gray-400 dark:text-gray-500"
                        style={{ animation: 'paypo-fade-in-up 0.4s ease-out 1s both' }}
                    >
                        Okno zamknie się automatycznie...
                    </p>

                    <style>{`
            @keyframes paypo-scale-in {
              0% { transform: scale(0); opacity: 0; }
              60% { transform: scale(1.15); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes paypo-draw-check {
              to { stroke-dashoffset: 0; }
            }
            @keyframes paypo-pulse-ring {
              0% { transform: scale(0.8); opacity: 0.6; }
              100% { transform: scale(1.6); opacity: 0; }
            }
            @keyframes paypo-fade-in-up {
              0% { opacity: 0; transform: translateY(10px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}</style>
                </div>
            </div>
        );
    }

    // ─── Modal: creating / redirecting / polling / failed ──────────────────────
    if (showModal) {
        return (
            <div>
                {/* Przycisk pod modalem (loading state) */}
                {(flowState === 'creating' || flowState === 'redirecting' || flowState === 'polling') && (
                    <Button
                        disabled
                        className="w-auto bg-[#00C853] hover:bg-[#00B848] cursor-not-allowed text-white"
                        size="lg"
                    >
                        <Loader2 className="w-5 h-5 text-white animate-spin mr-2" />
                        Przetwarzanie...
                    </Button>
                )}

                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm mx-4 space-y-4">
                        {/* Header */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <PayPoLogo className="w-16 h-8" />
                                <h2 className="text-xl font-bold">PayPo</h2>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* ─── Idle: info + confirm ─── */}
                        {flowState === 'idle' && (
                            <div className="space-y-4">
                                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                        <div className="space-y-1">
                                            <p className="font-semibold text-green-900 dark:text-green-100 text-sm">
                                                Kup teraz, zapłać za 30 dni
                                            </p>
                                            <p className="text-green-800 dark:text-green-200 text-xs">
                                                PayPo umożliwia odroczenie płatności o 30 dni bez dodatkowych kosztów.
                                                Po tym terminie możesz rozłożyć płatność na raty.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Instrukcja:
                                    </p>
                                    <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal list-inside space-y-1">
                                        <li>Kliknij &quot;Zapłać z PayPo&quot;</li>
                                        <li>Zostaniesz przekierowany na stronę PayPo</li>
                                        <li>Zaloguj się lub podaj dane</li>
                                        <li>Potwierdź płatność i wróć do sklepu</li>
                                    </ol>
                                </div>

                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {formatAmount(checkoutData.grandTotal)} zł
                                    </p>
                                    <p className="text-xs text-gray-500">do zapłaty za 30 dni</p>
                                </div>

                                <Button
                                    onClick={handlePayPoSubmit}
                                    className="w-full bg-[#00C853] hover:bg-[#00B848] text-white font-semibold"
                                    size="lg"
                                >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Zapłać z PayPo
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={handleClose}
                                    className="w-full"
                                >
                                    Anuluj
                                </Button>
                            </div>
                        )}

                        {/* ─── Creating order ─── */}
                        {flowState === 'creating' && (
                            <div className="space-y-4 text-center py-4">
                                <Loader2 className="w-10 h-10 text-[#00C853] animate-spin mx-auto" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        Przygotowywanie płatności...
                                    </p>
                                    <p className="text-sm text-gray-500">Trwa tworzenie zamówienia w PayU</p>
                                </div>
                            </div>
                        )}

                        {/* ─── Redirecting ─── */}
                        {flowState === 'redirecting' && (
                            <div className="space-y-4 text-center py-4">
                                <div className="flex justify-center">
                                    <div className="relative">
                                        <ExternalLink className="w-10 h-10 text-[#00C853]" />
                                        <div
                                            className="absolute inset-0 w-10 h-10"
                                            style={{
                                                animation: 'paypo-redirect-pulse 1s ease-in-out infinite',
                                            }}
                                        >
                                            <ExternalLink className="w-10 h-10 text-[#00C853] opacity-30" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                                        Przekierowanie na PayPo...
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Za chwilę zostaniesz przekierowany na stronę PayPo
                                    </p>
                                </div>
                                <style>{`
                  @keyframes paypo-redirect-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.3; }
                    50% { transform: scale(1.3); opacity: 0; }
                  }
                `}</style>
                            </div>
                        )}

                        {/* ─── Polling (po powrocie z redirect) ─── */}
                        {flowState === 'polling' && (
                            <div className="space-y-4">
                                <Alert className="border-blue-300 bg-blue-50 dark:bg-blue-950">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                                        Sprawdzanie statusu płatności PayPo...
                                    </AlertDescription>
                                </Alert>

                                <div className="flex items-center justify-center gap-3 py-2">
                                    <Loader2 className="w-6 h-6 text-[#00C853] animate-spin" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Oczekiwanie na potwierdzenie ({pollingCount}s)
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                                        <div
                                            className="bg-[#00C853] h-1.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.min((pollingCount / maxPollingAttempts) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <Button variant="outline" onClick={handleClose} className="w-full">
                                    Anuluj sprawdzanie
                                </Button>
                            </div>
                        )}

                        {/* ─── Failed / Canceled ─── */}
                        {(flowState === 'failed' || flowState === 'canceled') && (
                            <div className="space-y-4">
                                <Alert className="border-red-300 bg-red-50 dark:bg-red-950">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                    <AlertDescription className="text-red-800 dark:text-red-200">
                                        {errorMessage || 'Płatność PayPo nie powiodła się'}
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    onClick={() => {
                                        setFlowState('idle');
                                        setErrorMessage('');
                                    }}
                                    className="w-full bg-[#00C853] hover:bg-[#00B848] text-white"
                                >
                                    Spróbuj ponownie
                                </Button>

                                <Button variant="outline" onClick={handleClose} className="w-full">
                                    Zamknij
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Main button: paid ─────────────────────────────────────────────────────
    if (isPaid) {
        return (
            <Button
                disabled
                className="w-auto bg-[#00C853] text-white cursor-not-allowed opacity-90"
                size="lg"
            >
                <PayPoLogo className="w-12 h-6 mr-2" />
                <CheckCircle2 className="text-white w-4 h-4 mr-2" />
                Zapłacono ({formatAmount(checkoutData.grandTotal)} zł)
            </Button>
        );
    }

    // ─── Main button: default ──────────────────────────────────────────────────
    return (
        <div>
            <Button
                onClick={handleOpenModal}
                className="w-auto bg-[#00C853] hover:bg-[#00B848] cursor-pointer text-white"
                size="lg"
            >
                <PayPoLogo className="!h-6 !w-auto mr-2" />
                Zapłać za 30 dni ({formatAmount(checkoutData.grandTotal)} zł)
            </Button>
        </div>
    );
}