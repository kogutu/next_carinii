import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getReturnsCaller } from '@/lib/returnsApi'
import { SITE_URL } from '@/lib/seo'
import { createReturnDraft, getWygodneZwrotyConfig, WygodneZwrotyError, type DraftOrder } from '@/lib/wygodneZwroty'

// „Nadaj paczkę przez Wygodne Zwroty” po złożeniu oświadczenia o odstąpieniu: dane zamówienia pobieramy z Magento
// (tylko pozycje objęte oświadczeniem), tworzymy draft zwrotu i oddajemy klientowi adres formularza do przekierowania.
export const runtime = 'nodejs'

const UNAVAILABLE = 'Nadanie paczki online jest chwilowo niedostępne. Odeślij towar na adres z potwierdzenia.'

export async function POST(request: NextRequest) {
    if (!getWygodneZwrotyConfig()) {
        return NextResponse.json({ success: false, message: UNAVAILABLE }, { status: 503 })
    }

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
        return NextResponse.json({ success: false, message: 'Nieprawidłowe żądanie' }, { status: 400 })
    }

    const caller = await getReturnsCaller(request)
    const orderNumber = String(body.orderNumber ?? '').trim()
    const ref = String(body.ref ?? '').trim()
    if (!orderNumber || !ref) {
        return NextResponse.json({ success: false, message: 'Brak numeru zamówienia lub potwierdzenia' }, { status: 400 })
    }

    try {
        // Magento sprawdza zamówienie (numer + e-mail albo właściciel konta) i że oświadczenie ref należy do tego zamówienia
        const prepared = await customerApi<{ order: DraftOrder }>('returns/wz_draft_data.php', {
            orderNumber,
            ref,
            email: String(body.email ?? caller.sessionEmail).trim(),
            customerId: caller.customerId,
            clientIp: caller.clientIp,
        })
        if (!prepared.success || !prepared.data?.order) {
            return NextResponse.json({ success: false, message: prepared.message || UNAVAILABLE }, { status: prepared.status || 502 })
        }

        const { redirectUrl } = await createReturnDraft({
            order: prepared.data.order,
            flow: 'shipment',
            callbackUrl: process.env.WYGODNE_ZWROTY_CALLBACK_URL || `${SITE_URL}/zwroty-reklamacje`,
        })
        return NextResponse.json({ success: true, data: { redirectUrl } })
    } catch (error) {
        const status = error instanceof WygodneZwrotyError ? error.status : 0
        console.error('[wygodnezwroty] draft failed:', status, error instanceof WygodneZwrotyError ? error.code : 'błąd')

        // 400: błędne dane albo wyczerpany limit darmowych draftów dla zamówienia
        if (status === 400) {
            return NextResponse.json(
                { success: false, message: 'Formularz nadania dla tego zamówienia był już otwierany. Sprawdź e-mail od Wygodnych Zwrotów albo odeślij towar na adres z potwierdzenia.' },
                { status: 409 },
            )
        }
        return NextResponse.json({ success: false, message: UNAVAILABLE }, { status: 502 })
    }
}
