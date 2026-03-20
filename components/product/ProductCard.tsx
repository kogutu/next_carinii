import Image from "next/image"
import Link from "next/link"

export interface Product {
  id: string
  name: string
  subtitle?: string
  category: string[]
  price: number
  regularPrice?: number
  image: string
  images?: Array<{
    url: string
    alt: string
    position: number
  }>
  isNew: boolean
  isBestseller: boolean
  formattedPrice: string
  formattedRegularPrice?: string
  discount?: number
  reviewsCount?: number
  reviewsStars?: number
  stock?: {
    stock: {
      available_quantity: number
      is_available: boolean
    }
  }
  shipping_amount?: number
  shipping_termin?: string
  qty?: number
  enabled?: boolean
  ispresale?: boolean
  shipping_days?: string[]
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className = "" }: ProductCardProps) {
  const hasDiscount = product.regularPrice && product.regularPrice > product.price
  const discountAmount = hasDiscount ? product.regularPrice! - product.price : 0
  const isAvailable = product.stock?.stock.is_available && product.qty && product.qty > 0
  const isPresale = product.ispresale
  const nextDelivery = product.shipping_days?.[0] || "wkrótce"
  console.log(product);
  return (
    <div className={`group border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col bg-white ${className}`}>
      {/* Nagłówek z flagami */}

      <div className="flex justify-between items-start mb-2">
        <div className="flex flex-wrap gap-1">
          {product.isNew && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-medium">
              NOWOŚĆ
            </span>
          )}
          {product.isBestseller && !product.isNew && (
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded font-medium">
              BESTSELLER
            </span>
          )}
          {hasDiscount && (
            <span className="bg-green-600 text-white text-xs px-2 py-1 rounded font-medium">
              -{discountAmount} zł
            </span>
          )}
        </div>

        {/* Gwarancja */}
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
          gwarancja 84 mce
        </span>
      </div>

      {/* Zdjęcie produktu */}
      <div className="relative aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder.svg'
          }}
        />
      </div>

      {/* Informacje o produkcie */}
      <div className="flex-1 flex flex-col space-y-2">
        {/* Nazwa produktu */}
        <h3 className="font-bold text-gray-800 text-sm leading-tight line-clamp-2">
          {product.name.toUpperCase()}
        </h3>

        {/* Opis/kategoria */}
        <p className="text-xs text-gray-600 leading-tight line-clamp-2">
          {product.subtitle || product.category.join(", ")}
        </p>

        {/* Opinie i dostępność */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400">★★★★★</span>
            <span className="text-gray-600">
              {product.reviewsCount || 0} opinii
            </span>
          </div>
          <span className={`px-2 py-1 rounded ${isAvailable
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
            }`}>
            {isAvailable ? `${product.qty} szt` : "brak"}
          </span>
        </div>

        {/* Informacja o dostawie */}
        {!isAvailable && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
            Kolejna dostawa za min 6 miesięcy
          </div>
        )}

        {/* Ceny */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {product.formattedRegularPrice}
              </span>
            )}
            <span className="text-lg font-bold text-red-600">
              {product.formattedPrice}
            </span>
          </div>

          {hasDiscount && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500">cena REGULARNA</span>
              <span className="text-gray-500">-</span>
              <span className="text-gray-500">cena TERAZ</span>
              <span className="text-gray-500">-</span>
              <span className="text-red-600 font-bold">▼ {discountAmount} zł</span>
            </div>
          )}
        </div>

        {/* Koszt dostawy */}
        <div className="text-xs text-gray-600 border-t border-gray-200 pt-2">
          <div className="flex justify-between">
            <span>koszt dostawy:</span>
            <span className="font-medium">
              {product.shipping_amount ? `${product.shipping_amount} zł` : "darmowa"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>wysyłka:</span>
            <span className="font-medium">{product.shipping_termin || "24h"}</span>
          </div>
        </div>

        {/* Przycisk do szybkiego zakupu */}
        <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors mt-2">
          Szybki zakup
        </button>
      </div>
    </div>
  )
}
