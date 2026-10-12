import type { Metadata } from 'next'

// Panel administracyjny jest prywatny: bez indeksowania i bez śledzenia linków
export const metadata: Metadata = {
    title: 'Panel | Carinii',
    robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return children
}
