"use client"

import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import Image from 'next/image'
import { StockLevel } from "../components/stock_level"
import { Product } from "@/components/product/ProductCardMp"
import { useTabStore } from "./product-tabs"


interface ProductInfoProps {
  product: Product
  name: string
  sku: string
  warranty: string
  reviewsCount: number
  reviewsStars: number
}

export function ProductInfo({ product, name, sku, reviewsCount, reviewsStars, warranty }: ProductInfoProps) {


  const openOpinieTab = useTabStore((state) => state.openOpinieTab);


  const renderStars = () => {
    const stars = []
    const fullStars = Math.floor(reviewsStars)

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        // Filled gold star
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
      } else {
        // Outline star
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />)
      }
    }
    return stars
  }

  return (
    <div className="space-y-6">



      {/* Google Reviews */}
      <div className="flex items-center gap-3 flex-wrap justify-between  rounded-lg">
        <div className="flex items-center gap-1">
          <svg className="h-6 w-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="font-semibold">{(reviewsStars ?? 5).toFixed(1)}</span>

          <div className="flex items-center gap-0.5">{renderStars()}</div>
          <a href="#opinie" onClick={openOpinieTab} className="text-blue-600 hover:underline text-sm">
            {reviewsCount} {reviewsCount === 1 ? "opinia" : "opinii"}
          </a>
        </div>
        <StockLevel product={product} showText={true} />

      </div>


      <h1 className="text-2xl font-bold uppercase leading-6 my-9">{name}</h1>

      <div className="flex  gap-1 ">
        <Badge variant="outline" className="text-xs">
          gwarancja:  <Image style={{ borderRadius: '100%' }} alt="gwarancja" width={25} height={25} src='https://www.hert.pl/media/mp_gwar.webp' />
          {warranty}
        </Badge>
      </div>

    </div>
  )
}
