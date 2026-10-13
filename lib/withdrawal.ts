// Funkcja odstąpienia od umowy zawartej online (art. 11a dyrektywy 2011/83/UE, zmienionej dyrektywą 2023/2673).
// Etykiety i adres w jednym miejscu: przycisk musi mieć w całym sklepie to samo, jednoznaczne oznaczenie.

export const WITHDRAW_PATH = '/odstapienie-od-umowy'

/** Przycisk uruchamiający funkcję odstąpienia (krok 1). */
export const WITHDRAW_LABEL = 'Odstąp od umowy tutaj'

/** Przycisk potwierdzający oświadczenie (krok 2). */
export const CONFIRM_LABEL = 'Potwierdź odstąpienie od umowy'

export const WITHDRAW_DAYS = 14

// Ten sam adres co w regulaminie, na stronie zasad zwrotów i w docs/php/returns/_lib.php (RETURNS_ADDRESS)
export const RETURN_ADDRESS = 'Carinii – Magazyn, ul. Przemysłowa 40, 08-410 Wola Rębkowska'

/** Adres funkcji; z numerem zamówienia (np. z panelu klienta) formularz startuje już z wybranym zamówieniem. */
export const withdrawHref = (orderNumber?: string): string =>
    orderNumber ? `${WITHDRAW_PATH}?order=${encodeURIComponent(orderNumber)}` : WITHDRAW_PATH

// Odpowiedź /api/withdrawal (docs/php/returns/withdraw.php)
export type WithdrawalResult = {
    alreadySubmitted: boolean
    ref: string
    orderNumber: string
    scope: 'full' | 'items' | ''
    itemCount?: number
    // chwila złożenia: ISO (UTC) i tekst po polsku z sekundami i strefą
    withdrawnAt: string | null
    withdrawnAtLocal?: string
    email: string
    // czy udało się wysłać potwierdzenie e-mailem
    ackSent?: boolean
    outOfWindow?: boolean
    returnAddress: string
}
