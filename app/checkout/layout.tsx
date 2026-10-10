import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Finalizacja zamówienia | Carinii',
  description: 'Dokończ zakupy w sklepie Carinii: dane dostawy, sposób wysyłki i płatność.',
  robots: { index: false, follow: false },
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children
}
