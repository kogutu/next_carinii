'use client'

import { useState, useEffect } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronDown, Check } from 'lucide-react'

type Currency = 'PLN' | 'EUR'

const currencies = [
    { code: 'PLN' as Currency, label: 'Polski (PLN)', flag: 'pl' },
    { code: 'EUR' as Currency, label: 'Euro (EUR)', flag: 'eu' },
]

export function CurrencySelectorClient() {
    const [currency, setCurrency] = useState<Currency>('PLN')
    const [open, setOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem('selected-currency') as Currency | null
        if (saved === 'PLN' || saved === 'EUR') setCurrency(saved)
    }, [])

    const handleChange = (newCurrency: Currency) => {
        setCurrency(newCurrency)
        setOpen(false)
        localStorage.setItem('selected-currency', newCurrency)
        window.dispatchEvent(
            new CustomEvent('currencyChanged', { detail: { currency: newCurrency } })
        )
    }

    const selected = currencies.find(c => c.code === currency)!

    // Przed hydracją — nie renderuj nic, widoczny jest server placeholder
    if (!mounted) return null

    return (
        // absolute + inset-0 — nakłada się dokładnie na server placeholder
        <div className="absolute inset-0">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="flex items-center space-x-1 text-[11px] font-medium text-gray-600 hover:text-hert transition h-full">
                        <img
                            src={`https://flagcdn.com/w20/${selected.flag}.png`}
                            alt={selected.label}
                            className="h-3"
                        />
                        <span>{selected.code}</span>
                        <ChevronDown size={12} className={`transition ${open ? 'rotate-180' : ''}`} />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-0">
                    <div className="divide-y">
                        {currencies.map(curr => (
                            <button
                                key={curr.code}
                                onClick={() => handleChange(curr.code)}
                                className={`w-full px-4 py-2 text-sm font-medium flex items-center justify-between hover:bg-purple-50 transition ${currency === curr.code ? 'bg-purple-50 text-hert' : 'text-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <img
                                        src={`https://flagcdn.com/w20/${curr.flag}.png`}
                                        alt={curr.label}
                                        className="h-3"
                                    />
                                    <span>{curr.label}</span>
                                </div>
                                {currency === curr.code && <Check size={16} className="text-hert" />}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}