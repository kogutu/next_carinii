import { ApplePayMark, GooglePayMark } from './BrandIcons'
import PayButton from './PayButton'

type WalletPlaceholderProps = {
    wallet: 'googlepay' | 'applepay'
    // krótka etykieta w przycisku, np. „wkrótce” albo „Safari / iOS”
    note?: string
}

// Wyłączony przycisk portfela tam, gdzie płatność jeszcze nie działa (lub nie działa na tym urządzeniu):
// klient i właściciel sklepu widzą, gdzie przycisk będzie.
export default function WalletPlaceholder({ wallet, note = 'wkrótce' }: WalletPlaceholderProps) {
    const label = wallet === 'googlepay' ? 'Google Pay' : 'Apple Pay'

    return (
        <PayButton align="center" disabled aria-label={`${label}: ${note}`}>
            {wallet === 'googlepay' ? <GooglePayMark className="text-base" /> : <ApplePayMark className="text-base" />}
            <span className="rounded-full bg-primary-foreground/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">{note}</span>
        </PayButton>
    )
}
