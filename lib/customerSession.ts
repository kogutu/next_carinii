import { auth } from '@/lib/auth'

export type CustomerSession = {
    // identyfikator klienta w Magento — zawsze z zalogowanej sesji, nigdy z treści żądania
    customerId: string
    email: string
}

/** Zalogowany klient albo null. Identyfikator Magento to liczba całkowita (inne wartości odrzucamy). */
export async function getCustomerSession(): Promise<CustomerSession | null> {
    const session = await auth()
    const customerId = session?.user?.id
    const email = session?.user?.email

    if (!customerId || !email || !/^\d{1,12}$/.test(customerId)) return null
    return { customerId, email }
}
