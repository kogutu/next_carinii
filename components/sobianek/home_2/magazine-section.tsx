import { BookOpen, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function MagazineSection() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <Card className="overflow-hidden border-2 border-primary/20">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2 gap-0">
                <div
                  className="relative h-80 md:h-auto bg-cover bg-center"
                  style={{ backgroundImage: "url('/agricultural-magazine-cover-winter-2025.jpg')" }}
                >
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-accent text-accent-foreground text-base px-4 py-2">Nowy numer!</Badge>
                  </div>
                </div>

                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="h-8 w-8 text-primary" />
                    <span className="text-sm font-semibold text-primary uppercase tracking-wide">
                      Wydanie specjalne
                    </span>
                  </div>

                  <h2 className="text-4xl font-bold mb-4 text-balance font-serif">Magazyn Rolnik 2025 Zima</h2>

                  <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                    Najnowsze wydanie naszego magazynu jest już dostępne! Znajdziesz w nim ekskluzywne wywiady z
                    ekspertami, poradniki dotyczące przygotowania gospodarstwa do zimy oraz kompleksowe analizy rynku
                    rolnego.
                  </p>

                  <ul className="space-y-3 mb-8 text-foreground">
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

                  <div className="flex gap-4">
                    <Button size="lg" className="gap-2">
                      <Download className="h-5 w-5" />
                      Pobierz PDF
                    </Button>
                    <Button size="lg" variant="outline">
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
