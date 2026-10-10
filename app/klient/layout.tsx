import type { Metadata } from 'next'

// Panel klienta jest prywatny — nie indeksujemy go
export const metadata: Metadata = {
  title: 'Moje konto | Carinii',
  robots: { index: false, follow: false },
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return children
}
