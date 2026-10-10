import type { Metadata } from 'next'

// Wyniki wyszukiwania nie trafiają do indeksu (nieskończona liczba fraz, treść zależy od zapytania)
export const metadata: Metadata = {
  title: 'Wyszukiwanie | Carinii',
  description: 'Wyniki wyszukiwania w sklepie Carinii: buty damskie, torebki i dodatki.',
  robots: { index: false, follow: true },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
