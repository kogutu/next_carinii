'use client'

import { createContext, useContext, type ReactNode } from 'react'

// Typ strony (pageMetadata.type z detectPageType) ustalany w layoucie [...slug]; loading.tsx leży pod tym layoutem,
// więc dzięki kontekstowi pokazuje szkielet właściwy dla produktu, kategorii albo strony CMS — bez zgadywania po adresie.
const PageKindContext = createContext<string | null>(null)

type PageKindProviderProps = { kind: string; children: ReactNode }

export function PageKindProvider({ kind, children }: PageKindProviderProps) {
    return <PageKindContext.Provider value={kind}>{children}</PageKindContext.Provider>
}

export const usePageKind = () => useContext(PageKindContext)
