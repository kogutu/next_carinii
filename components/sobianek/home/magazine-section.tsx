import { BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MagazineSection() {
  return (
    <section className="py-10 sm:py-12 md:py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div
                  className="relative h-56 sm:h-64 md:h-auto md:w-1/2 bg-cover bg-center"
                  style={{ backgroundImage: "url('/agricultural-magazine-cover-winter-2025.jpg')" }}
                >
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                    <Badge className="bg-accent text-accent-foreground text-xs sm:text-sm md:text-base px-3 sm:px-4 py-1 sm:py-2">Nowy numer!</Badge>
                  </div>
                </div>

                <div className="p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center md:w-1/2">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />
                    <span className="text-xs sm:text-sm font-semibold text-primary uppercase tracking-wide">
                      Wydanie specjalne
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-balance font-serif">Magazyn Rolnik 2025 Zima</h2>

                  <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    Najnowsze wydanie naszego magazynu jest już dostępne! Znajdziesz w nim ekskluzywne wywiady z
                    ekspertami, poradniki dotyczące przygotowania gospodarstwa do zimy oraz kompleksowe analizy rynku
                    rolnego.
                  </p>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-foreground text-sm sm:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Praktyczne wskazówki dotyczące ochrony roślin w okresie zimowym</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Przegląd najnowszych technologii w rolnictwie precyzyjnym</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Wywiady z wiodącymi producentami i analitykami rynkowymi</span>
                    </li>
                  </ul>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button size="lg" className="gap-2 w-full sm:w-auto">
                      <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                      Pobierz PDF
                    </Button>
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Zamów wersję papierową
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
