'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Send, AlertCircle } from 'lucide-react';
import { P24 } from '@/lib/przelewy24';

interface GatewayPayloadProps {
  amount: number;
  sessionId: string;
  email?: string;
}

export function GatewayPayload({
  amount,
  sessionId,
  email = 'customer@example.com',
}: GatewayPayloadProps) {
  const [payload, setPayload] = useState(
    JSON.stringify(
      {
        merchantId: P24.merchantId,
        posId: P24.merchantId,
        sessionId: sessionId,
        amount: Math.round(amount),
        currency: 'PLN',
        description: 'Zakup w sklepie online',
        email: email,
        customerIp: '127.0.0.1',
        language: 'pl',
        urlReturn: `${typeof window !== 'undefined' ? window.location.origin : ''}/payment/success`,
        urlStatus: `${typeof window !== 'undefined' ? window.location.origin : ''}/api/payment/notify`,
        timeLimit: Math.floor(Date.now() / 1000) + 600, // 10 minut
        sign: P24.generateSignature(sessionId, Math.round(amount) / 100),
      },
      null,
      2
    )
  );

  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidatePayload = () => {
    try {
      const parsed = JSON.parse(payload);
      setError('');
      alert('JSON jest prawidłowy! ✓');
    } catch (err: any) {
      setError(`Błąd JSON: ${err.message}`);
    }
  };

  const handleSendPayload = () => {
    try {
      const parsed = JSON.parse(payload);
      
      // Generuj URL do bramki z parametrami z payload
      const params = new URLSearchParams({
        p24_merchant_id: parsed.merchantId.toString(),
        p24_pos_id: parsed.posId.toString(),
        p24_session_id: parsed.sessionId,
        p24_amount: parsed.amount.toString(),
        p24_currency: parsed.currency,
        p24_description: parsed.description,
        p24_email: parsed.email,
        p24_sign: parsed.sign,
        p24_url_return: parsed.urlReturn,
        p24_url_status: parsed.urlStatus,
        p24_time_limit: parsed.timeLimit.toString(),
        p24_language: parsed.language,
      });

      const paymentUrl = `https://sandbox.przelewy24.pl/trnRequest/${params.toString()}`;
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(`Błąd: ${err.message}`);
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10">
      <CardHeader>
        <CardTitle>JSON Payload Przelewy24</CardTitle>
        <CardDescription>
          Edytuj dane żądania płatności lub wyślij bezpośrednio do bramki
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-300 bg-red-50 text-red-800 dark:bg-red-950 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold">Payload żądania (JSON):</label>
          <Textarea
            value={payload}
            onChange={(e) => {
              setPayload(e.target.value);
              setError('');
            }}
            className="font-mono text-xs min-h-96 bg-background"
            placeholder="Wklej JSON payload..."
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={handleValidatePayload}
            variant="outline"
            className="w-full"
          >
            Waliduj JSON
          </Button>
          <Button
            onClick={handleCopyPayload}
            variant="outline"
            className="w-full"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Skopiowano' : 'Kopiuj'}
          </Button>
          <Button
            onClick={handleSendPayload}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Wyślij
          </Button>
        </div>

        <div className="bg-blue-100 border border-blue-300 text-blue-800 px-4 py-3 rounded text-sm dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
          <p className="font-semibold mb-2">Opis pól:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li><code>merchantId</code> - ID sprzedawcy Przelewy24</li>
            <li><code>sessionId</code> - Unikalne ID sesji zamówienia</li>
            <li><code>amount</code> - Kwota w groszach (PLN * 100)</li>
            <li><code>sign</code> - Podpis MD5 (merchantId|sessionId|amount|crcKey)</li>
            <li><code>urlReturn</code> - URL powrotu po płatności</li>
            <li><code>urlStatus</code> - URL dla powiadomienia IPN</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
