"use client"

import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useRef } from "react"

const products = {
  bestsellers: [
    {
      id: 1,
      name: "Węgiel orzech BALTIC 25kg",
      price: "1549.00",
      oldPrice: "1649.00",
      image: "/coal-nut-bag.jpg",
      badge: "Bestseller",
    },
    {
      id: 2,
      name: "Nawóz Lew-Rosplon 39-26",
      price: "1659.00",
      image: "/fertilizer-bag.png",
      badge: "Polecamy",
    },
    {
      id: 3,
      name: "NovaTec One 1kg",
      price: "1099.00",
      oldPrice: "1199.00",
      image: "/agricultural-product-bottle.jpg",
      badge: "Promocja",
    },
    {
      id: 4,
      name: "Afredylla 250 SC",
      price: "49.50",
      image: "/pesticide-bottle.jpg",
    },
    {
      id: 5,
      name: "Axial Komplett Pak",
      price: "396.80",
      image: "/herbicide-package.jpg",
      badge: "Nowość",
    },
  ],
  new: [
    {
      id: 6,
      name: "Pellet drzewny Premium A1",
      price: "899.00",
      image: "/wood-pellets-bag.jpg",
      badge: "Nowość",
    },
    {
      id: 7,
      name: "Nasiona kukurydzy Pioneer",
      price: "2299.00",
      image: "/corn-seeds-bag.jpg",
      badge: "Nowość",
    },
    {
      id: 8,
      name: "Środek zaprawiający T-75",
      price: "456.00",
      image: "/seed-treatment-bottle.jpg",
      badge: "Nowość",
    },
    {
      id: 9,
      name: "Nawóz wieloskładnikowy Pro",
      price: "789.00",
      image: "/multi-fertilizer-bag.jpg",
      badge: "Nowość",
    },
    {
      id: 10,
      name: "Brykiet RUF 10kg",
      price: "349.00",
      image: "/wood-briquettes.jpg",
      badge: "Nowość",
    },
  ],
}

interface ProductCarouselProps {
  category: "bestsellers" | "new"
}

export function ProductCarousel({ category }: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const items = products[category]

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
      setTimeout(checkScroll, 300)
    }
  }

  return (
    <div className="relative">
      <div 
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 snap-x snap-mandatory"
        onScroll={checkScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((product) => (
          <Card key={product.id} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[260px] lg:w-[280px] group hover:shadow-lg transition-shadow snap-start">
            <CardContent className="p-3 sm:p-4">
              <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg bg-muted aspect-square">
                {product.badge && <Badge className="absolute top-2 left-2 z-10 bg-primary text-xs">{product.badge}</Badge>}
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">{product.name}</h3>
              <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
                <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">{product.price} zł</span>
                {product.oldPrice && (
                  <span className="text-xs sm:text-sm text-muted-foreground line-through">{product.oldPrice} zł</span>
                )}
              </div>
              <Button className="w-full text-xs sm:text-sm" size="sm">
                <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Dodaj do koszyka
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-1/2 shadow-lg bg-card z-10 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}

      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-1/2 shadow-lg bg-card z-10 h-8 w-8 sm:h-10 sm:w-10 hidden sm:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      )}
    </div>
  )
}
