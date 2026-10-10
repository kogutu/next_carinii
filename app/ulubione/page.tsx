import type { Metadata } from 'next'
import WishlistPage from '@/components/wishlist/WishlistPage'

export const metadata: Metadata = {
  title: 'Ulubione | Carinii',
  description: 'Twoja lista ulubionych produktów Carinii.',
  robots: { index: false, follow: true },
}

export default function Page() {
  return <WishlistPage />
}
