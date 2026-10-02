import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function AboutStats() {
  const stats = [
    { value: "+30", label: "Lat doświadczenia" },
    { value: "+4 000", label: "Zadowolonych klientów" },
    { value: "500 000", unit: "ton", label: "Sprzedanego węgla rocznie" },
    { value: "150 000", unit: "ton", label: "Sprzedanych nawozów rocznie" },
  ]

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 text-balance leading-tight">
              Lider sprzedaży węgla i kompleksowego zaopatrzenia rolnictwa
            </h2>
            <div className="space-y-3 sm:space-y-4 text-gray-700 leading-relaxed text-sm sm:text-base">
              <p>
                Witamy w naszym sklepie internetowym, w którym kupią Państwo najlepszy ekogroszek, pellet drzewny czy
                węgiel orzech workowany!
              </p>
              <p>
                Nasza firma zajmuje się dystrybucją wysokiej jakości materiałów opałowych. Udowadniamy, że dobry produkt
                nie musi mieć wysokiej ceny, zapewniając najlepszej jakości paliwa stałe produkcji własnej oraz od
                innych, cenionych marek. Zachęcamy do zapoznania się z katalogiem produktów Sobianek i życzymy udanych
                zakupów!
              </p>
            </div>
            <Button size="lg" className="mt-6 sm:mt-8 font-bold bg-transparent w-full sm:w-auto" variant="outline">
              Więcej o nas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-green-50 rounded-lg p-4 sm:p-6 md:p-8 text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-1 sm:mb-2">
                    {stat.value}
                    {stat.unit && <span className="text-lg sm:text-xl md:text-2xl ml-1">{stat.unit}</span>}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-700 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
