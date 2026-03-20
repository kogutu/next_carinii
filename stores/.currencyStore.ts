// store/currencyStore.ts - ulepszona wersja
import { create } from 'zustand';
import { Currency } from '@/lib/currency/types';
import { getClientCurrency, setClientCurrency } from '@/lib/currency/client';

interface CurrencyStore {
    currency: Currency;
    isHydrated: boolean;
    setCurrency: (currency: Currency) => void;
    hydrate: () => void;
}

export const useCurrencyStore = create<CurrencyStore>()((set) => ({
    currency: typeof window !== 'undefined' && window.__INITIAL_CURRENCY
        ? window.__INITIAL_CURRENCY
        : 'PLN',
    isHydrated: false,

    setCurrency: (currency) => {
        set({ currency });
        setClientCurrency(currency);

        if (typeof window !== 'undefined') {
            window.dispatchEvent(
                new CustomEvent('currencyChanged', { detail: { currency } })
            );
        }
    },

    hydrate: () => {
        if (typeof window !== 'undefined') {
            const savedCurrency = getClientCurrency();
            // Używamy savedCurrency tylko jeśli różni się od initial
            set((state) => ({
                currency: savedCurrency !== state.currency ? savedCurrency : state.currency,
                isHydrated: true
            }));
        }
    },
}));

// Dodaj typ dla window
declare global {
    interface Window {
        __INITIAL_CURRENCY?: Currency;
    }
}