import { useCallback, useEffect, useRef, useState } from 'react'
import { isValidNip } from '@/lib/nip'

export type GusCompany = {
    nip: string
    companyName: string
    street: string
    postcode: string
    city: string
    active: boolean
}

export type GusStatus = 'idle' | 'loading' | 'found' | 'not-found' | 'error'

const DEBOUNCE_MS = 400

// Pobiera dane firmy z GUS po NIP (przez /api/gus). Wywołuj `lookup` przy każdej
// zmianie NIP — hook sam debounce'uje, anuluje poprzednie zapytanie i ignoruje
// niepełne/nieprawidłowe numery.
export const useGusLookup = (onFound: (company: GusCompany) => void) => {
    const [status, setStatus] = useState<GusStatus>('idle')
    const [inactive, setInactive] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const abortRef = useRef<AbortController | null>(null)
    const onFoundRef = useRef(onFound)

    useEffect(() => {
        onFoundRef.current = onFound
    }, [onFound])

    const cancel = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current)
        abortRef.current?.abort()
    }, [])

    useEffect(() => cancel, [cancel])

    const fetchCompany = useCallback(async (nip: string) => {
        const controller = new AbortController()
        abortRef.current = controller

        try {
            const res = await fetch('/api/gus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nip }),
                signal: controller.signal,
            })

            if (res.status === 404) return setStatus('not-found')
            if (!res.ok) return setStatus('error')

            const company: GusCompany = await res.json()
            onFoundRef.current(company)
            setInactive(!company.active)
            setStatus('found')
        } catch (error) {
            if ((error as Error).name === 'AbortError') return
            setStatus('error')
        }
    }, [])

    const lookup = useCallback((nip: string) => {
        cancel()
        setInactive(false)

        if (!isValidNip(nip)) {
            setStatus('idle')
            return
        }

        setStatus('loading')
        timerRef.current = setTimeout(() => fetchCompany(nip), DEBOUNCE_MS)
    }, [cancel, fetchCompany])

    return { status, inactive, lookup }
}
