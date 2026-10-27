"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const slides = [
  {
    id: 1,
    title: "Promocja -5%",
    subtitle: "na jesienne środki ochrony roślin",
    code: "PLON5",
    image: "/tractor-in-golden-wheat-field.jpg",
    cta: "Kup teraz",
  },
  {
    id: 2,
    title: "Nowa kolekcja",
    subtitle: "Profesjonalne nawozy azotowe",
    image: "/agricultural-field-sunrise.jpg",
    cta: "Sprawdź ofertę",
  },
  {
    id: 3,
    title: "Wysoka jakość",
    subtitle: "Węgiel i pellet w najlepszych cenach",
    image: "/coal-heating-fuel.jpg",
    cta: "Zobacz produkty",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-muted">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === currentSlide ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${slide.image}')` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />
          </div>

          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h2 className="text-5xl md:text-6xl font-bold mb-4 text-balance">{slide.title}</h2>
              <p className="text-2xl md:text-3xl mb-8 text-balance">{slide.subtitle}</p>
              {slide.code && (
                <div className="mb-8">
                  <span className="text-sm">Kod rabatowy:</span>
                  <span className="ml-2 text-2xl font-bold bg-primary px-4 py-2 rounded">{slide.code}</span>
                </div>
              )}
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8">
                {slide.cta}
              </Button>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={nextSlide}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all",
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </div>
  )
}
