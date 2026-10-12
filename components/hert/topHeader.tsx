'use client'

import { TopBarView } from '@/components/promo/PromoViews'
import { useTopBar } from '@/components/promo/PromoProvider'

// Pasek z kodem rabatowym i licznikiem. Treść, kod, daty i kolory ustawia się w panelu /admin (zakładka Promo).
export default function TopHeader() {
  const { bar, visible } = useTopBar()
  if (!visible) return null
  return <TopBarView bar={bar} />
}
