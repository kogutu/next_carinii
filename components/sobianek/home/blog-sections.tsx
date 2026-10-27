import { Calendar, User, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import ProductsCarouselProducts from "@/components/hert/products-carouse-products"
import PostPageCarousel from "@/components/hert/blog-carusel"


export function BlogSections({ blog, agro }: { blog: any, agro: any }) {
  return (
    <div className="">
      {/* Expert Blog Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-[#f3ffd9]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-1 h-6 sm:h-8 bg-primary" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Blog Ekspertów</h2>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                Poznaj opinie i analizy czołowych specjalistów z dziedziny agronomii i ochrony roślin
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent shrink-0">
              <Link href="/blog/eksperci">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>


          <PostPageCarousel title="Bestsellers" products={blog.length > 0 ? blog : []} />



          <div className="mt-6 sm:mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/blog/eksperci">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Agrotechnical Consulting Section */}
      <section className="py-10 sm:py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-1 h-6 sm:h-8 bg-primary" />
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Doradztwo Agrotechniczne</h2>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
                Praktyczne porady naszych doradców, które pomogą Ci w codziennej pracy na gospodarstwie
              </p>
            </div>
            <Button variant="outline" asChild className="hidden md:flex bg-transparent shrink-0">
              <Link href="/blog/doradztwo">
                Zobacz wszystkie
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <PostPageCarousel title="Bestsellers" products={agro.length > 0 ? agro : []} />


          <div className="mt-6 sm:mt-8 text-center md:hidden">
            <Button variant="outline" asChild className="w-full sm:w-auto">
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
