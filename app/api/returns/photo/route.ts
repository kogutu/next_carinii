import { NextRequest, NextResponse } from 'next/server'
import { customerApi } from '@/lib/customerApi'
import { getClientIp } from '@/lib/returnsApi'

// Vercel przyjmuje do ok. 4,5 MB na żądanie; przeglądarka zmniejsza zdjęcia do ok. 0,5 MB przed wysłaniem.
const MAX_BYTES = 4 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Jedno zdjęcie do zgłoszenia: trafia do katalogu tymczasowego w Magento, a zgłoszenie dostaje jego token.
export async function POST(request: NextRequest) {
    const form = await request.formData().catch(() => null)
    const file = form?.get('file')

    if (!(file instanceof File)) {
        return NextResponse.json({ success: false, message: 'Nie odebrano zdjęcia' }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, message: 'Dozwolone są zdjęcia JPG, PNG lub WebP' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
        return NextResponse.json({ success: false, message: 'Zdjęcie jest za duże (maksymalnie 4 MB)' }, { status: 413 })
    }

    const outgoing = new FormData()
    outgoing.append('file', file, 'photo.jpg')
    outgoing.append('clientIp', getClientIp(request))

    try {
        const result = await customerApi('returns/upload.php', {}, { formData: outgoing })
        return NextResponse.json(
            { success: result.success, message: result.message, data: result.data },
            { status: result.success ? 200 : result.status || 500 },
        )
    } catch (error) {
        console.error('[returns] photo upload failed:', error)
        return NextResponse.json({ success: false, message: 'Nie udało się wysłać zdjęcia' }, { status: 502 })
    }
}
