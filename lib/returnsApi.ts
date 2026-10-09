import type { NextRequest } from 'next/server'
import { getCustomerSession } from '@/lib/customerSession'

// Pomocnicze dane żądania zwrotu/reklamacji: kto pyta (sesja, jeśli jest) i z jakiego adresu IP.
export const getClientIp = (request: NextRequest): string => {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    return forwarded || request.headers.get('x-real-ip') || ''
}

export type ReturnsCaller = {
    customerId: number
    sessionEmail: string
    clientIp: string
}

export const getReturnsCaller = async (request: NextRequest): Promise<ReturnsCaller> => {
    const session = await getCustomerSession()
    return {
        customerId: session ? Number(session.customerId) : 0,
        sessionEmail: session?.email ?? '',
        clientIp: getClientIp(request),
    }
}
