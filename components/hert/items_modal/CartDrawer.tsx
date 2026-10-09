// components/cart/CartDrawerContent.tsx (Client Component)
'use client'

import { Minus, Plus, Trash2, X } from 'lucide-react'
import PayButton from '@/components/payments/PayButton'
import { SURFACE_CARD } from '@/components/ui/surface'
import { formatPrice } from '@/lib/formatPrice'
import { cn } from '@/lib/utils'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useCartStore } from '@/stores/cartZustand'
import { useIsMobile } from '@/hooks/use-mobile'
import DiscountCode from '@/components/checkout/DiscountCode'
import ExpressCheckout from '@/components/express/ExpressCheckout'
import { useEffect } from 'react'

export function CartDrawerContent() {
  const open = useCartStore((state: any) => state.showMiniCart)
  const setOpen = useCartStore((state: any) => state.setShowMiniCart)

  const isMobile = useIsMobile()

  const items = useCartStore((state: any) => state.items)
  const removeItem = useCartStore((state: any) => state.removeItemCart)
  const updateQty = useCartStore((state: any) => state.updateQty)
  const isHydrated = useCartStore((state: any) => state.isHydrated)
  const coupon = useCartStore((state: any) => state.coupon)
  const clearCart = useCartStore((state: any) => state.clearCart)

  // Fix dla klawiatury mobilnej - resetuj pozycję drawera po zamknięciu klawiatury
  useEffect(() => {
    if (!open) return

    const viewport = window.visualViewport
    if (!viewport) return

    let initialHeight = viewport.height
    let keyboardOpen = false

    const handleResize = () => {
      const currentHeight = viewport.height
      const heightDiff = initialHeight - currentHeight

      // Klawiatura otwarta (wysokość zmniejszona o > 150px)
      if (heightDiff > 150) {
        keyboardOpen = true
      }

      // Klawiatura zamknięta (wysokość wraca do normy)
      if (keyboardOpen && heightDiff < 100) {
        keyboardOpen = false

        // Wymuś pełny reset pozycji
        requestAnimationFrame(() => {
          // Reset scroll na body
          window.scrollTo(0, 0)
          document.documentElement.scrollTop = 0
          document.body.scrollTop = 0

          // Reset drawer
          const drawerOverlay = document.querySelector('[data-vaul-overlay]') as HTMLElement
          const drawerContent = document.querySelector('[data-vaul-drawer]') as HTMLElement

          if (drawerOverlay) {
            drawerOverlay.style.opacity = '1'
          }

          if (drawerContent) {
            drawerContent.style.transform = 'translate3d(0, 0, 0)'
            drawerContent.style.bottom = '0'
          }

          // Blur active element aby upewnić się, że klawiatura jest zamknięta
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
        })
      }

      initialHeight = Math.max(initialHeight, currentHeight)
    }

    const handleScroll = () => {
      // Zapobiegaj scrollowaniu body gdy drawer jest otwarty
      window.scrollTo(0, 0)
    }

    viewport.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, { passive: false })

    return () => {
      viewport.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [open])

  if (!isHydrated || isMobile === null) return null

  const totalPrice = items.reduce(
    (sum: number, item: any) => sum + item.final_price * item.qty,
    0
  )

  const totalItems = items.reduce(
    (sum: number, item: any) => sum + item.qty,
    0
  )

  const CartContent = () => (
    <div className="flex h-full flex-col bg-background" data-vaul-no-drag>
      {/* HEADER */}
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Koszyk</h2>
          {totalItems > 0 && (
            <p className="text-xs tabular-nums text-muted-foreground">{totalItems} szt.</p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Zamknij koszyk"
          className="-mr-2 flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      {/* ITEMS */}
      <div className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-5 pb-4">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-foreground">Koszyk jest pusty</p>
            <p className="mt-1 text-sm text-muted-foreground">Dodaj produkty, a pojawią się tutaj.</p>
          </div>
        ) : (
          items.map((item: any, index: number) => (
            <div
              key={`${item.pid}-${item.variant ?? ''}-${index}`}
              className={cn(SURFACE_CARD, 'p-3')}
            >
              <div className="flex gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    className="h-24 w-20 shrink-0 rounded-lg bg-muted object-cover outline outline-1 -outline-offset-1 outline-black/10"
                  />
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-balance text-sm font-medium text-foreground">
                        {item.name.split('CARINII--')[0]}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.sku}</p>
                      {item.variant?.size && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Rozmiar: <span className="font-semibold text-foreground">{item.variant.size}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      aria-label="Usuń produkt"
                      className="-mr-1.5 -mt-1.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQty(item, item.qty - 1)}
                        disabled={item.qty <= 1}
                        aria-label="Zmniejsz ilość"
                        className="flex size-9 items-center justify-center rounded-lg bg-muted transition-[transform,background-color] hover:bg-muted/70 active:scale-97 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100"
                      >
                        <Minus className="size-3.5" aria-hidden="true" />
                      </button>

                      <span className="w-8 text-center text-sm tabular-nums">{item.qty}</span>

                      <button
                        type="button"
                        onClick={() => updateQty(item, item.qty + 1)}
                        aria-label="Zwiększ ilość"
                        className="flex size-9 items-center justify-center rounded-lg bg-muted transition-[transform,background-color] hover:bg-muted/70 active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
                      >
                        <Plus className="size-3.5" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="text-right tabular-nums">
                      {item.price != item.final_price && (
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(item.price * item.qty)}</p>
                      )}
                      <p className="text-sm font-semibold text-foreground">{formatPrice(item.final_price * item.qty)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PODSUMOWANIE */}
      {items.length > 0 && (
        <div className="space-y-4 bg-background px-5 pb-5 pt-4 shadow-[0_-1px_0_rgb(0_0_0/0.06)]">
          <DiscountCode />

          <div className="flex items-baseline justify-between">
            <span className="text-base font-semibold text-foreground">Suma</span>
            <span className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {formatPrice(totalPrice)}
            </span>
          </div>

          <PayButton
            align="center"
            className="h-12 text-base"
            onClick={() => {
              window.location.href = '/checkout'
              setOpen(false)
            }}
          >
            Przejdź do kasy
          </PayButton>

          <ExpressCheckout
            getItems={() => items}
            coupon={coupon}
            onOrderPlaced={() => {
              clearCart()
              setOpen(false)
            }}
          />
        </div>
      )}
    </div>
  )

  return (
    <>
      {isMobile ? (
        // 📱 MOBILE DRAWER
        <Drawer
          open={open}
          onOpenChange={setOpen}
          modal={true}
          noBodyStyles={true}
        >
          <DrawerContent
            className="h-[100dvh] max-h-[100dvh] pb-[env(safe-area-inset-bottom)] [&_input]:text-base [&_input]:!text-[16px]"
            onInteractOutside={(e) => e.preventDefault()}
          >
            <DrawerTitle className="sr-only">Koszyk Zakupów</DrawerTitle>
            <CartContent />
          </DrawerContent>
        </Drawer>
      ) : (
        // 🖥 DESKTOP SIDEBAR
        open && (
          <>
            <div
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40"
            />
            <div className="fixed right-0 top-0 z-50 h-full w-[420px] overflow-y-auto bg-background shadow-xl">
              <CartContent />
            </div>
          </>
        )
      )}
    </>
  )
}
