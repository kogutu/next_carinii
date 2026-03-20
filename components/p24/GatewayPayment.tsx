'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { P24 } from '@/lib/przelewy24';

interface GatewayPaymentProps {
  amount: number;
  sessionId: string;
  email?: string;
  description?: string;
  useSandbox?: boolean;
}

export function GatewayPayment({
  amount,
  sessionId,
  email = 'customer@example.com',
  description = 'Zakup w sklepie online',
  useSandbox = true,
}: GatewayPaymentProps) {
  const handleRedirectToGateway = () => {
    const paymentUrl = P24.generatePaymentGatewayUrl(
      sessionId,
      amount / 100,
      email,
      description,
      useSandbox
    );

    // Otwórz w nowym oknie lub przekieruj
    window.location.href = paymentUrl;
  };

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardHeader>
        <CardTitle>Bramka Przelewy24</CardTitle>
        <CardDescription>Wszystkie metody płatności dostępne w Przelewy24</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded text-sm">
            <p className="font-semibold mb-2">Dostępne metody płatności:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Karty kredytowe i debetowe (Visa, MasterCard)</li>
              <li>Przelewy bankowe</li>
              <li>Portfele elektroniczne</li>
              <li>BLIK</li>
              <li>Google Pay i Apple Pay</li>
              <li>PayPal</li>
              <li>Inne metody płatności</li>
            </ul>
          </div>

          <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded text-sm">
            <p className="font-semibold mb-2">Informacja:</p>
            <p>
              Po kliknięciu przycisku zostaniesz przekierowany do oficjalnej bramki Przelewy24,
              gdzie możesz wybrać preferowaną metodę płatności i potwierdzić transakcję.
            </p>
            {useSandbox && (
              <p className="mt-2">
                <strong>Tryb testowy:</strong> Używasz konta sandbox Przelewy24.
              </p>
            )}
          </div>

          <Button
            onClick={handleRedirectToGateway}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            size="lg"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Przejdź do bramki Przelewy24
            <span className="ml-auto text-sm opacity-90">{(amount / 100).toFixed(2)} zł</span>
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            ID zamówienia: <code className="bg-gray-200 px-2 py-1 rounded">{sessionId}</code>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
