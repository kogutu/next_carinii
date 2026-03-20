"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BadgeCheckIcon, Calculator, ShoppingCart } from "lucide-react"
import {
  CAInstallmentSimulator,
  CAInstallmentBadge,
  CABuyButton
} from "@/components/credit-agricole"
import { useMediaQuery } from "@/hooks/use-mobile"

interface ProductPriceProps {
  price: number
  regularPrice: number
  discount: number
  isPreSale?: boolean
  productName?: string
}

export function ProductPrice({ price, regularPrice, discount, isPreSale, productName }: ProductPriceProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("pl-PL", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }
  const [openRaty, setOpenRaty] = useState(false);
  const handleClose = () => {
    if (openRaty) {
      setOpenRaty(false)
    }
    else {
      setOpenRaty(true)
    }
  }

  const raty = price / 10;

  return (
    <div className=" space-y-3">
      {/* Price Header */}
      <div className="">
        <div className="flex items-center gap-2">

        </div>

      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">

        <div className="price grid  items-end gap-0">

          <div className="flex items-baseline gap-4">
            <div className="text-3xl md:text-4xl font-bold text-red-600">{formatPrice(price)} zł</div>

            {discount > 0 && (
              <sup className=" text-sm md:text-lg text-muted-foreground line-through ">
                {formatPrice(regularPrice)} zł
              </sup>
            )}
          </div>
          <div className="w-full text-sm md:text-base">
            lub        <span className="text-bold text-mpgreen">{raty} zł</span> x <span className="text-bold text-mpgreen">10 rat</span> <span className="text-mpgreen font-bold">0%</span>
          </div>
        </div>


        <div className="text-right" onClick={handleClose}>
          <div className="inline-flex items-center rounded-full bg-gray-100 ">
            <button
              className="px-4 py-2 text-xs md:text-sm font-semibold text-white rounded-full
           bg-mpgoldb shadow-sm transition">
              RATY
            </button>

            <button
              className="px-2 py-2 text-xs md:text-sm font-medium text-mpgoldb
           rounded-full transition hover:opacity-80">
              KALKULATOR
            </button>
          </div>

        </div>
      </div>
      {isDesktop ? (
        <Dialog open={openRaty} onOpenChange={(open) => !open && handleClose()}>
          <DialogContent className="sm:max-w-md p-4">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">

              </DialogTitle>
            </DialogHeader>

            <CAInstallmentSimulator
              shopId="PSP2012301"
              amount={price}
              productName={productName}
              minInstallments={2}
              maxInstallments={60}
            />
          </DialogContent>
        </Dialog>

      ) : (
        <Drawer open={openRaty} onOpenChange={handleClose} className="max-w-[450px] m-auto">
          <DrawerContent className="max-h-[85vh] max-w-[450px] m-auto flex flex-col">
            <DrawerHeader className="p-4 border-b border-gray-200">
              <DrawerTitle className="text-xl font-bold flex items-center gap-2 text-[#545454]">
                <ShoppingCart className="w-5 h-5 text-[#ee2008]" />
                Kalkulator ratalny
              </DrawerTitle>
            </DrawerHeader >

            <CAInstallmentSimulator
              shopId="PSP2012301"
              amount={price}
              productName={productName}
              minInstallments={2}
              maxInstallments={60}
            />
          </DrawerContent >
        </Drawer >

      )}

      {/* {discount > 0 && (
        <div className="bg-green-50 p-3 rounded border border-green-200">
          <div className="text-sm font-semibold text-green-700">Oszczędzasz: {formatPrice(regularPrice - price)} zł</div>
        </div>
      )} */}

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div>najniższa cena w ciągu ostatnich 30 dni: {formatPrice(price)} zł</div>
      </div>
    </div>
  )
}


