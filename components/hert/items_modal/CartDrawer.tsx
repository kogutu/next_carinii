// components/cart/CartDrawerContent.tsx (Client Component)
'use client'

import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useCartStore } from '@/stores/cartZustand'
import { useIsMobile } from '@/hooks/use-mobile'
import DiscountCode from '@/components/checkout/DiscountCode'
import { useEffect } from 'react'

export function CartDrawerContent() {
  const open = useCartStore((state: any) => state.showMiniCart)
  const setOpen = useCartStore((state: any) => state.setShowMiniCart)

  const isMobile = useIsMobile()

  const items = useCartStore((state: any) => state.items)
  const removeItem = useCartStore((state: any) => state.removeItemCart)
  const updateQty = useCartStore((state: any) => state.updateQty)
  const isHydrated = useCartStore((state: any) => state.isHydrated)

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
    <div className="flex flex-col h-full bg-white" data-vaul-no-drag>
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Koszyk Zakupów</h2>
        <button onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-contain">
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            Koszyk jest pusty
          </div>
        ) : (
          items.map((item: any, index: number) => (
            <div
              key={`${item.pid}-${item.variant ?? ''}-${index}`}
              className="border rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-26 h-auto rounded"
                  />
                )}

                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-semibold">
                        {item.name.split("CARINII--")[0]}<br />
                        <span className="text-xs text-gray-500 font-normal"> {item.sku}</span>
                      </p>
                      {/* ATRYBUTY */}
                      {item.variant.attrs && (
                        <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                          {Object.entries(item.variant.attrs).map(([key, value]: any) => (
                            <div key={key}>
                              {key}: {value}
                            </div>
                          ))}
                        </div>
                      )}

                    </div>

                    <button
                      onClick={() => removeItem(item)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* CENA JEDNOSTKOWA + ILOŚĆ + SUMA */}
                  <div className="mt-3 space-y-2">
                    {item.price != item.final_price && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>&nbsp;</span>
                        <s>
                          {item.price.toLocaleString('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          })}
                        </s>
                      </div>
                    )}
                    {/* Ilość + suma pozycji */}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => updateQty(item, item.qty - 1)}
                        className="px-2 border rounded"
                      >
                        −
                      </button>

                      <span className="w-6 text-center">
                        {item.qty}
                      </span>

                      <button
                        onClick={() => updateQty(item, item.qty + 1)}
                        className="px-2 border rounded"
                      >
                        +
                      </button>

                      <span className="ml-auto font-semibold">
                        {(item.final_price * item.qty).toLocaleString(
                          'pl-PL',
                          { style: 'currency', currency: 'PLN' }
                        )}
                      </span>
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
        <div className="p-4 border-t space-y-3">
          <div className="border-b pb-4">
            {/* 👈 Tutaj jest DiscountCode z inputem */}
            <DiscountCode />
          </div>

          <div className="flex justify-between font-semibold text-lg">
            <span>Suma:</span>
            <span>
              {totalPrice.toLocaleString('pl-PL', {
                style: 'currency',
                currency: 'PLN'
              })}
            </span>
          </div>

          <Button
            onClick={() => {
              window.location.href = '/checkout'
              setOpen(false)
            }}
            className="w-full bg-sobianek hover:bg-sobianek/90 h-12 font-semibold"
          >
            Przejdź do Kasy
          </Button>
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
              className="fixed inset-0 bg-black/40 z-40"
            />
            <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50 overflow-y-auto">
              <CartContent />
            </div>
          </>
        )
      )}
    </>
  )
}
