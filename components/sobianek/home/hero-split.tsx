import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Image from "next/image"

export function HeroSplit() {
  return (
    <section className="relative min-h-[500px] md:min-h-[550px] lg:h-[600px] flex flex-col lg:flex-row">
      {/* Left side - Green section */}
      <div className="w-full lg:w-2/5 bg-primary text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative overflow-hidden order-2 lg:order-1">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-white rounded-full -mr-32 sm:-mr-48 -mb-32 sm:-mb-48" />
        </div>
        <div className="relative z-10">
          <div className="inline-block bg-white/20 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded mb-4 sm:mb-6">
            PROMOCJA
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-balance">
            Najlepszej jakości węgiel
          </h1>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/90 leading-relaxed">
            Sprawdź naszą ofertę węgla groszek o najwyższej kaloryczności 29-27 MJ/kg.
            Wydajność i oszczędność w każdym worku!
          </p>
          <div className="space-y-2 sm:space-y-3 mb-8 sm:mb-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Węgiel groszek LEW</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">29-27 MJ/kg – najwyższa klasa</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Check className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-base sm:text-lg">Wydajność i czyste spalanie</span>
            </div>
          </div>
          <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-gray-900 font-bold px-6 sm:px-8 h-11 sm:h-12 w-full sm:w-auto">
            Skontaktuj się z nami
          </Button>
        </div>
      </div>

      {/* Right side - Image with product card */}
      <div className="w-full lg:w-3/5 relative min-h-[300px] sm:min-h-[350px] lg:min-h-0 order-1 lg:order-2">
        <Image
          src="/groszek.jpg"
          alt="Pole rolnicze"
          fill
          className="object-cover"
          priority
        />

        {/* Product card - produkt z obrazka */}
        <div className="hidden sm:block absolute right-4 md:right-8 top-4 md:top-1/2 md:-translate-y-1/2 bg-white p-4 md:p-6 rounded-lg shadow-xl max-w-[220px] md:max-w-xs">
          <div className="text-center mb-2">
            <div className="text-xs md:text-sm font-bold text-red-600 uppercase">NIE MA LEPSZEGO!</div>
            <div className="text-2xl md:text-3xl font-black text-gray-800">29-27</div>
            <div className="text-xs md:text-sm font-bold text-gray-600">MJ/kg</div>
          </div>

          <div className="relative mb-3 md:mb-4">
            <Image
              src="https://sobianek.pl/wp-content/uploads/2021/06/LEW-300x300.jpg"
              alt="Węgiel groszek LEW 29-27 MJ/kg"
              width={300}
              height={200}
              className="rounded-lg w-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              -6%
            </div>
          </div>

          <h3 className="font-bold text-base md:text-lg mb-1 text-center">Węgiel groszek LEW</h3>
          <p className="text-xs md:text-sm text-gray-500 text-center mb-2">29-27 MJ/kg | 25 kg</p>

          <div className="text-center mb-3 md:mb-4">
            <span className="text-xs md:text-sm text-gray-400 line-through mr-2">1789 zł</span>
            <span className="text-lg md:text-2xl font-bold text-primary">1685 zł</span>
            <span className="text-xs text-gray-500"> / 1000 kg</span>
          </div>

          <Button className="w-full bg-primary hover:bg-primary/90 font-bold text-sm md:text-base">
            KUP TERAZ
            <span className="ml-2">→</span>
          </Button>

          <div className="text-center mt-2">
            <span className="text-[10px] md:text-xs text-gray-400"> gwarancja jakości</span>
          </div>
        </div>
      </div>
    </section>
  )
}