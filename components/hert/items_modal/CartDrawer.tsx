// components/cart/CartDrawerContent.tsx (Client Component)
'use client'

import { Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useCartStore } from '@/stores/cartZustand'
import { useIsMobile } from '@/hooks/use-mobile'

export function CartDrawerContent() {
  const open = useCartStore((state: any) => state.showMiniCart)
  const setOpen = useCartStore((state: any) => state.setShowMiniCart)

  const isMobile = useIsMobile()

  const items = useCartStore((state: any) => state.items)
  const removeItem = useCartStore((state: any) => state.removeItemCart)
  const updateQty = useCartStore((state: any) => state.updateQty)
  const isHydrated = useCartStore((state: any) => state.isHydrated)

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
    <div className="flex flex-col h-full bg-white">
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Koszyk Zakupów</h2>
        <button onClick={() => setOpen(false)}>
          <X size={20} />
        </button>
      </div>

      {/* ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <div className="flex gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 rounded"
                  />
                )}

                <div className="flex-1">
                  <div className="flex justify-between">
                    <p className="text-sm font-semibold">
                      {item.name.split("CARINII--")[0]}
                      <div className="text-xs text-gray-500 font-normal"> {item.sku}</div>
                    </p>

                    <button
                      onClick={() => removeItem(item)}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* ATRYBUTY */}
                  {item.attrs && (
                    <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                      {Object.entries(item.attrs).map(([key, value]: any) => (
                        <div key={key}>
                          {key}: {value}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CENA JEDNOSTKOWA + ILOŚĆ + SUMA */}
                  <div className="mt-3 space-y-2">


                    {item.price != item.final_price && (
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>&nbsp;</span>
                        <span>
                          {item.price.toLocaleString('pl-PL', {
                            style: 'currency',
                            currency: 'PLN'
                          })}
                        </span>
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
            className="w-full bg-hert hover:bg-hert/90 h-12 font-semibold"
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
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
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
            <div className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-xl z-50">
              <CartContent />
            </div>
          </>
        )
      )}
    </>
  )
}