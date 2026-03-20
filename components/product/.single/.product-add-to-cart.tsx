"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Minus, Plus, Package, Info, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import _ from "lodash"
import { AddToListButton } from "@/components/shopping-lists/add-to-list-button"
import { useCart } from "@/context/CartContext"
import { CartPanel } from "@/components/header/CartPanel"

interface ProductAddToCartProps {
  productId: string
  productName: string
  ean: string
  productImage: string
  price: number
  stock: number
  isPreSale?: boolean
  enabled: boolean
  packInfo: PackInfo
}

interface PackInfo {
  packs: number
  per_in_box: number[]
  price: number
}

export function ProductAddToCart({
  productId,
  productName,
  productImage,
  ean,
  price,
  stock,
  isPreSale,
  enabled,
  packInfo,
}: ProductAddToCartProps) {
  const [quantity, setQuantity] = useState(1)
  const [showInfo, setShowInfo] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notifyEmail, setNotifyEmail] = useState("")
  const [notifyStatus, setNotifyStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

  const { addToCart } = useCart()

  const packInfor: any = packInfo
  const like_product = {
    id: productId,
    ean: ean,
    img: productImage,
    name: productName,
  }

  const shippingCalculation = useMemo(() => {
    const totalPacks = quantity * packInfo.packs
    const remainingPacks = totalPacks
    let boxesNeeded = 0
    if (_.isArray(packInfo.per_in_box))
      packInfo.per_in_box = packInfo.per_in_box.reduce((total, current) => {
        return total + current
      }, 0)

    boxesNeeded = Math.ceil(quantity / packInfo.per_in_box)

    const shippingCost = boxesNeeded * packInfo.price
    setShowInfo(false)
    console.log(packInfo.price !== shippingCost)

    if (packInfo.price !== shippingCost) setShowInfo(true)
    return {
      totalPacks,
      boxesNeeded,
      shippingCost,
    }
  }, [quantity, packInfo])

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1)
  }

  const handleIncrease = () => {
    if (quantity < stock) setQuantity(quantity + 1)
  }

  const [refreshKey, setRefreshKey] = useState(0)

  const handleListUpdated = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const handleAddToCart = () => {
    alert("Dodano do koszyka")
    addToCart(
      {
        id: productId,
        name: productName,
        price: price,
        image: productImage,
        ean: ean,
      },
      quantity,
    )

    // setIsCartOpen(true)
    // setQuantity(1)
  }

  const handleNotifyMe = async () => {
    if (!notifyEmail || !notifyEmail.includes("@")) {
      setNotifyStatus("error")
      return
    }

    setNotifyStatus("loading")

    try {
      const response = await fetch("/api/notify-availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: notifyEmail,
          productId,
          productName,
          ean,
        }),
      })
      console.clear();
      console.log(response.ok);
      if (response.ok) {
        setNotifyStatus("success")
        setNotifyEmail("")
      } else {
        setNotifyStatus("error")
      }
    } catch (error) {
      console.error("Error submitting notification request:", error)
      setNotifyStatus("error")
    }

    // setTimeout(() => setNotifyStatus("idle"), 4000)
  }

  return (
    <div className={stock === 0 ? "border-2 border-orange-600 rounded-lg p-4 bg-red-50/30 space-y-4" : "border-2 border-red-600 rounded-lg p-4 bg-red-50/30 space-y-4"}>

      {showInfo && stock > 0 && (
        <div className="bg-white rounded-md p-3 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-sm">Informacje o wysyłce</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-auto">
                    <Info className="h-4 w-4 text-blue-600 hover:text-blue-700" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">Jak działa wysyłka?</p>
                    <p className="text-sm">
                      <strong>Paczki</strong> – ilość opakowań w jednym produkcie (np. produkt = 2 paczki)
                    </p>
                    <p className="text-sm">
                      <strong>Boxy</strong> – zbiorcze opakowanie zawierające produkty (np. 1 box = 2 produkty)
                    </p>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Koszt wysyłki liczony jest za boxy, nie za paczki produktu
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <TooltipProvider>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-muted-foreground">Paczki:</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-3.5 w-3.5 text-blue-600 hover:text-blue-700" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">Ilość opakowań w jednym produkcie (np. produkt = 2 paczki)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="font-bold">{shippingCalculation.totalPacks}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-muted-foreground">Boxy:</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-3.5 w-3.5 text-blue-600 hover:text-blue-700" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">
                        Zbiorcze opakowanie zawierające produkty (np. 1 box = 2 produkty)
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="font-bold">{shippingCalculation.boxesNeeded}</p>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-muted-foreground">Koszt wysyłki:</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="inline-flex">
                        <Info className="h-3.5 w-3.5 text-blue-600 hover:text-blue-700" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm max-w-xs">Koszt wysyłki liczony jest za boxy, nie za paczki produktu</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="font-bold text-red-600">{shippingCalculation.shippingCost.toFixed(2)} zł</p>
              </div>
            </div>
          </TooltipProvider>
        </div>
      )}
      {stock === 0 ? (
        <div className="bg-white">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-orange-600" />
            <h3 className="font-semibold text-sm">Produkt chwilowo niedostępny</h3>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Podaj swój adres email, a powiadomimy Cię gdy produkt będzie dostępny
          </p>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="twoj@email.pl"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              className="flex-1"
              disabled={notifyStatus === "loading" || notifyStatus === "success"}
            />
            <Button
              onClick={handleNotifyMe}
              disabled={!notifyEmail || notifyStatus === "loading" || notifyStatus === "success"}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {notifyStatus === "loading" && "Wysyłanie..."}
              {notifyStatus === "success" && "Zapisano!"}
              {notifyStatus === "error" && "Spróbuj ponownie"}
              {notifyStatus === "idle" && "Powiadom mnie"}
            </Button>
          </div>
          {notifyStatus === "success" && (
            <p className="text-sm text-green-600 mt-2">✓ Dziękujemy! Powiadomimy Cię o dostępności.</p>
          )}
          {notifyStatus === "error" && <p className="text-sm text-red-600 mt-2">Wprowadź poprawny adres email.</p>}
        </div>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-4">
            <div className="flex items-center border-2 border-gray-300 rounded">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={quantity <= 1}
                className="h-9 w-9 rounded-none"
              >
                <Minus className="h-5 w-5" />
              </Button>
              <input
                type="text"
                value={quantity}
                onChange={(e) => {
                  const val = Number.parseInt(e.target.value) || 1
                  setQuantity(Math.max(1, Math.min(val, stock)))
                }}
                className="w-16 h-9 text-center text-xl font-bold border-x-2 border-gray-300 focus:outline-none"
                min={1}
                max={stock}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={quantity >= stock}
                className="h-9 w-9 rounded-none"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <div>
              <AddToListButton product={like_product} onAdded={handleListUpdated} />
            </div>
          </div>
          <Button
            size="lg"
            onClick={handleAddToCart}
            disabled={!enabled || stock === 0}
            className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold text-lg uppercase"
          >
            <ShoppingCart className="mr-2 h-5 w-5" /> DODAJ DO KOSZYKA
          </Button>
        </div>
      )}
      <CartPanel isOpenExternal={isCartOpen} onCloseExternal={() => setIsCartOpen(false)} hideButton />
    </div>
  )
}
