import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WITHDRAW_PATH } from '@/lib/withdrawal'

type WygodneZwrotyBadgeProps = {
    // dark: czarne tło (strefa Maison), light: reszta sklepu
    tone?: 'light' | 'dark'
    className?: string
}

// Informacja dla klienta, że zwroty obsługuje Wygodne Zwroty — widoczna zawsze. Zdanie o nadaniu paczki online dodajemy
// dopiero po włączeniu integracji (NEXT_PUBLIC_WZ_RETURNS=on, to samo, co odblokowuje przycisk nadania paczki w formularzu
// odstąpienia) — nie obiecujemy funkcji, której klient nie może jeszcze użyć.
const SHIPMENT_ENABLED = process.env.NEXT_PUBLIC_WZ_RETURNS === 'on'

export default function WygodneZwrotyBadge({ tone = 'light', className }: WygodneZwrotyBadgeProps) {
    const dark = tone === 'dark'

    return (
        <Link
            href={WITHDRAW_PATH}
            className={cn(
                'group flex items-center gap-3 border px-4 py-3 transition-colors',
                dark ? 'border-[#2a2a2a] text-white hover:border-white' : 'rounded-xl border-gray-200 bg-white text-gray-900 hover:border-gray-900',
                className,
            )}
        >
            {/* logo na białej płytce, żeby czarny napis i kolory marki były czytelne także na czarnym tle strefy Maison */}
            <span className="flex shrink-0 items-center rounded-md bg-white px-2 py-1.5">
                <img src="/wygodne-zwroty/logo.svg" alt="Wygodne Zwroty" width={216} height={52} className="h-6 w-auto" />
            </span>
            <span className="min-w-0 text-left normal-case tracking-normal">
                <span className="block text-sm font-semibold">Zwroty w oparciu o system Wygodne Zwroty</span>
                <span className={cn('block text-xs', dark ? 'text-[#a8a8a8]' : 'text-gray-600')}>
                    {SHIPMENT_ENABLED ? 'Zgłoś odstąpienie online i nadaj zwrot paczki w kilku krokach.' : 'Masz 14 dni na odstąpienie od umowy — zgłosisz je online, bez podawania przyczyny.'}
                </span>
            </span>
        </Link>
    )
}
