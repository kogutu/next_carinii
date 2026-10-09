// Listy wyboru formularza zwrotów i reklamacji — wartości muszą się zgadzać z docs/php/returns/_lib.php.

export type ReturnType = 'zwrot' | 'reklamacja'

type Option = { value: string; label: string }

export const REASONS: Record<ReturnType, Option[]> = {
    zwrot: [
        { value: 'size_too_small', label: 'Rozmiar za mały' },
        { value: 'size_too_big', label: 'Rozmiar za duży' },
        { value: 'not_as_expected', label: 'Produkt nie spełnia oczekiwań' },
        { value: 'changed_mind', label: 'Rezygnacja z zakupu' },
        { value: 'other', label: 'Inny powód' },
    ],
    reklamacja: [
        { value: 'damage', label: 'Uszkodzenie (pęknięcie, rozdarcie)' },
        { value: 'sole_heel', label: 'Podeszwa lub obcas (odklejenie, zużycie)' },
        { value: 'material_seams', label: 'Wada materiału lub szwów' },
        { value: 'fittings', label: 'Zamek, sprzączka, element ozdobny' },
        { value: 'wrong_item', label: 'Niezgodność z zamówieniem' },
        { value: 'other', label: 'Inna wada' },
    ],
}

export const RESOLUTIONS: Record<ReturnType, Option[]> = {
    zwrot: [
        { value: 'refund', label: 'Zwrot pieniędzy' },
        { value: 'exchange', label: 'Wymiana na inny rozmiar lub produkt' },
    ],
    reklamacja: [
        { value: 'repair', label: 'Naprawa' },
        { value: 'replace', label: 'Wymiana na nowy produkt' },
        { value: 'discount', label: 'Obniżenie ceny' },
        { value: 'refund', label: 'Zwrot pieniędzy' },
    ],
}

export const MAX_PHOTOS = 6

// Dane zwracane przez /api/returns/lookup
export type ReturnOrderItem = {
    itemId: number
    name: string
    sku: string
    size: string
    qtyOrdered: number
    qtyAvailable: number
    price: number
    image: string
}

export type ReturnOrder = {
    orderNumber: string
    createdAt: string
    status: string
    firstName: string
    eligible: boolean
    ineligibleReason: string
    daysSinceReceived: number
    returnWindowDays: number
    withinReturnWindow: boolean
    items: ReturnOrderItem[]
    existing: { ref: string; type: ReturnType; status: string; createdAt: string; itemCount: number }[]
}

export const STATUS_LABELS: Record<string, string> = {
    new: 'Przyjęte',
    in_progress: 'W trakcie',
    accepted: 'Zaakceptowane',
    rejected: 'Odrzucone',
    done: 'Zakończone',
}
