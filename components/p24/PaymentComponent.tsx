'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BlikPayment } from './BlikPayment';
import { GooglePayButton } from './GooglePayButton';
import { GatewayPayment } from './GatewayPayment';
import { GatewayPayload } from './GatewayPayload';
import { CartItem } from './ProductCart';
import { P24 } from '@/lib/przelewy24';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentComponentProps {
  cartItems: CartItem[];
  email?: string;
}

export function PaymentComponent({ cartItems, email = '' }: PaymentComponentProps) {
  const [sessionId, setSessionId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'idle' | 'success' | 'pending' | 'error';
    message?: string;
    paymentMethod?: string;
  }>({ type: 'idle' });

  // Generuj session ID przy montowaniu
  useEffect(() => {
    setSessionId(P24.generateSessionId());
  }, []);

  // Oblicz totalną kwotę w groszach
  const totalAmountGrosze = cartItems.reduce(
    (sum, item) => sum + Math.round(item.product.price * item.quantity * 100),
    0
  );

  const handleBlikSuccess = (code: string) => {
    setPaymentStatus({
      type: 'success',
      message: `Płatność BLIK została zatwierdzona! Kod: ${code}`,
      paymentMethod: 'BLIK',
    });
  };

  const handleGooglePaySuccess = () => {
    setPaymentStatus({
      type: 'success',
      message: 'Płatność Google Pay została zatwierdzona!',
      paymentMethod: 'Google Pay',
    });
  };

  return (
    <div className="space-y-6">
      {/* Podsumowanie zamówienia */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie zamówienia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-sm">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="font-semibold">
                  {(item.product.price * item.quantity).toFixed(2)} zł
                </span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg">Razem do zapłacenia:</span>
                <span className="text-2xl font-bold text-primary">
                  {(totalAmountGrosze / 100).toFixed(2)} zł
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status płatności */}
      {paymentStatus.type === 'success' && (
        <Alert className="border-green-300 bg-green-50 text-green-800 dark:bg-green-950 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{paymentStatus.message}</AlertDescription>
        </Alert>
      )}

      {paymentStatus.type === 'error' && (
        <Alert className="border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{paymentStatus.message || 'Wystąpił błąd podczas płatności'}</AlertDescription>
        </Alert>
      )}

      {/* Metody płatności */}
      <Card>
        <CardHeader>
          <CardTitle>Wybierz metodę płatności</CardTitle>
          <CardDescription>Dostępne są trzy sposoby płatności</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="gateway" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="gateway">Bramka Przelewy24</TabsTrigger>
              <TabsTrigger value="payload">JSON Payload</TabsTrigger>
              <TabsTrigger value="blik">BLIK</TabsTrigger>
              <TabsTrigger value="googlepay">Google Pay</TabsTrigger>
            </TabsList>

            {/* Tab: Bramka Przelewy24 */}
            <TabsContent value="gateway" className="mt-4">
              <GatewayPayment
                amount={totalAmountGrosze}
                sessionId={sessionId}
                email={email}
                description={`Zamówienie ${sessionId.split('-')[0]}`}
                useSandbox={true}
              />
            </TabsContent>

            {/* Tab: JSON Payload */}
            <TabsContent value="payload" className="mt-4">
              <GatewayPayload
                amount={totalAmountGrosze}
                sessionId={sessionId}
                email={email}
              />
            </TabsContent>

            {/* Tab: BLIK */}
            <TabsContent value="blik" className="mt-4">
              <BlikPayment 
                amount={totalAmountGrosze} 
                sessionId={sessionId}
                onPayment={handleBlikSuccess} 
              />
            </TabsContent>

            {/* Tab: Google Pay */}
            <TabsContent value="googlepay" className="mt-4">
              <GooglePayButton 
                amount={totalAmountGrosze} 
                sessionId={sessionId}
                email={email}
                onPayment={handleGooglePaySuccess} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Informacja o bezpieczeństwie */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="text-2xl">🔒</div>
            <div>
              <h4 className="font-semibold mb-1">Twoja płatność jest bezpieczna</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Wszystkie transakcje są szyfrowane i przetwarzane przez zaufanych operatorów
                płatności. Twoje dane karty nigdy nie są przechowywane na naszych serwerach.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
