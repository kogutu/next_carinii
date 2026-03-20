'use client';

import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import { Cookie } from 'next/font/google';

type Currency = any;

export function CurrencySelector({ currency_cookies }: { currency_cookies: any }) {
  const [mounted, setMounted] = useState(false); // Dodajemy ten stan
  const [currency, setCurrency] = useState<Currency>(currency_cookies);
  const [open, setOpen] = useState(false);

  // useEffect uruchamia się TYLKO w przeglądarce
  useEffect(() => {
    setMounted(true);
  }, []);

  const currencies: { code: Currency; label: string; symbol: string; flag: string }[] = [
    { code: 'PLN', label: 'Polski (PLN)', symbol: 'zł', flag: '🇵🇱' },
    { code: 'EUR', label: 'Euro (EUR)', symbol: '€', flag: '🇪🇺' },
  ];

  const handleCurrencyChange = async (newCurrency: Currency) => {
    setCurrency(newCurrency);
    setOpen(false);


    document.cookie = `currency=${newCurrency}; path=/; max-age=31536000`;


    // You can dispatch an event or update global state here
    window.dispatchEvent(
      new CustomEvent('currencyChanged', { detail: { currency: newCurrency } })
    );
  };


  const selectedCurrency = currencies.find((c) => c.code === currency);
  if (!mounted) {
    return (<button key="curr" className="flex items-center space-x-1 border-l pl-4 ml-2 text-[11px] font-medium text-gray-600 hover:text-hert transition">
      <img
        src={`/images/flags/${selectedCurrency?.code === 'PLN' ? 'pl' : 'eu'}.webp`}
        alt={selectedCurrency?.label}
        width={20}
        height={13}
        className="h-3"
      />
      <span>{selectedCurrency?.code}</span>
      <ChevronDown size={12} className={`transition ${open ? 'rotate-180' : ''}`} />
    </button>); // Lub po prostu return null;
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button key="curr" className="flex items-center space-x-1 border-l pl-4 ml-2 text-[11px] font-medium text-gray-600 hover:text-hert transition">
          <img
            src={`/images/flags/${selectedCurrency?.code === 'PLN' ? 'pl' : 'eu'}.webp`}
            alt={selectedCurrency?.label}
            width={20}
            height={13}
            className="h-3"
          />
          <span>{selectedCurrency?.code}</span>
          <ChevronDown size={12} className={`transition ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0">
        <div className="divide-y">
          {currencies.map((curr) => (
            <button
              key={curr.code}
              onClick={() => handleCurrencyChange(curr.code)}
              className={`w-full px-4 py-2 text-sm font-medium flex items-center justify-between hover:bg-purple-50 transition ${currency === curr.code ? 'bg-purple-50 text-hert' : 'text-gray-700'
                }`}
            >
              <div className="flex items-center gap-2">
                <img
                  src={`/images/flags/${curr.code === 'PLN' ? 'pl' : 'eu'}.webp`}
                  alt={curr.label}
                  className="h-3"
                  width={20}
                  height={13}
                />
                <span>{curr.label}</span>
              </div>
              {currency === curr.code && <Check size={16} className="text-hert" />}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
