import { Calendar, User, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const expertBlog = [
  {
    id: 1,
    title: "Jak efektywnie nawozić pszenicę ozimą?",
    excerpt: "Poznaj sprawdzone metody nawożenia, które zwiększą plony i poprawią jakość ziarna.",
    author: "Dr hab. Jan Kowalski",
    date: "15 listopada 2024",
    image: "/wheat-field-expert.jpg",
    category: "Nawozy",
  },
  {
    id: 2,
    title: "Ochrona upraw przed chorobami grzybowymi",
    excerpt: "Kompleksowy przewodnik po najskuteczniejszych środkach i metodach zapobiegania.",
    author: "Prof. Anna Nowak",
    date: "12 listopada 2024",
    image: "/plant-disease-microscope.jpg",
    category: "Ochrona roślin",
  },
  {
    id: 3,
    title: "Technologie precyzyjne w nowoczesnym rolnictwie",
    excerpt: "Jak wykorzystać GPS i drony do zwiększenia efektywności gospodarstwa.",
    author: "Inż. Piotr Wiśniewski",
    date: "8 listopada 2024",
    image: "/agricultural-drone-field.jpg",
    category: "Technologia",
  },
]

const agroBlog = [
  {
    id: 4,
    title: "Planowanie płodozmianu na sezon 2025",
    excerpt: "Praktyczne porady dotyczące optymalnego układu upraw w gospodarstwie.",
    author: "Doradca rolniczy Maria Lewandowska",
    date: "18 listopada 2024",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 5,
    title: "Skuteczne metody zwalczania chwastów",
    excerpt: "Zintegrowana ochrona przed zachwaszczeniem - teoria i praktyka.",
    author: "Doradca rolniczy Tomasz Zieliński",
    date: "14 listopada 2024",
    image: "/placeholder.svg?height=300&width=400",
  },
  {
    id: 6,
    title: "Optymalizacja kosztów w gospodarstwie rolnym",
    excerpt: "Sprawdzone strategie oszczędności bez utraty wydajności produkcji.",
    author: "Ekonomista rolny Katarzyna Kamińska",
    date: "10 listopada 2024",
    image: "/placeholder.svg?height=300&width=400",
  },
]

export function BlogSections() {
  return (
    <div className="bg-background">
      {/* Expert Blog Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-primary" />
                <h2 className="text-3xl font-bold text-foreground">Blog Ekspertów</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                Poznaj opinie i analizy czołowych specjalistów z dziedziny agronomii i ochrony roślin
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent">
              <Link href="/blog/eksperci">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {expertBlog.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/blog/eksperci">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Agrotechnical Consulting Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-primary" />
                <h2 className="text-3xl font-bold text-foreground">Doradztwo Agrotechniczne</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl leading-relaxed">
                Praktyczne porady naszych doradców, które pomogą Ci w codziennej pracy na gospodarstwie
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent">
              <Link href="/blog/doradztwo">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agroBlog.map((post) => (
              <Card key={post.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span className="line-clamp-1">{post.author}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link href="/blog/doradztwo">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
