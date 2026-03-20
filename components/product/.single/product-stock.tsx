"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface ProductStockProps {
  stock: number
  isPreSale?: boolean
  plannedDelivery?: {
    date: string
    quantity: number
  }
}

export function ProductStock({ stock, isPreSale, plannedDelivery }: ProductStockProps) {
  const [selectedWeek, setSelectedWeek] = useState(1)

  const getStockLevel = () => {
    if (stock === 0) return { label: "brak", color: "bg-gray-400", position: 0 }
    if (stock <= 16) return { label: "mało", color: "bg-mpgold", position: 16 }
    if (stock <= 33) return { label: "średnio", color: "bg-yellow-500", position: 50 }
    return { label: "dużo", color: "bg-mpgreen", position: 100 }
  }

  const stockLevel = getStockLevel()
  const stockPercentage = stock === 0 ? 0 : Math.min((stock / 50) * 100, 100)

  return (
    stock !== 0 && (
      <div className="">
        <span className="text-sm mb-3 block">Stan magazynowy:</span>
        {/* Delivery Info */}
        {isPreSale && (
          <div className="bg-mpgreen p-3 rounded mb-8 border border-mpgreenh">
            <div className="text-xl text-white  text-center font-bold mb-1">PRZEDSPRZEDAŻ</div>
            <div className="flex items-center gap-2">
              <div className="text-mpgray text-center m-auto font-bold lowercase text-sm">TERMIN REALIZACJI PRZEWIDZIANY ZA 6 DNI</div>
            </div>
          </div>
        )}


        <div>
          <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`absolute left-0 top-0 h-full ${stockLevel.color} transition-all duration-300`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs">
            <span className={`font-medium ${stock === 0 ? "text-gray-700" : "text-gray-500"}`}>
              brak
            </span>
            <span className="text-gray-500">|</span>
            <span className={`font-medium ${stock <= 16 && stock > 0 ? "text-gray-700" : "text-gray-500"}`}>
              mało
            </span>
            <span className="text-gray-500">|</span>
            <span className={`font-medium ${stock > 16 && stock <= 33 ? "text-gray-700" : "text-gray-500"}`}>
              średnio
            </span>
            <span className="text-gray-500">|</span>
            <span className={`font-medium ${stock > 33 ? "text-gray-700" : "text-gray-500"}`}>
              dużo
            </span>
          </div>
        </div>

      </div>
    )

  )
}