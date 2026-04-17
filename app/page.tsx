import HeroBanner from "@/components/hert/hero-banner"
import Features from "@/components/hert/features"
import CategoryCards from "@/components/hert/category-cards"
import ProductsCarousel from "@/components/hert/products-carousel"
import CTASections from "@/components/hert/cta-sections"
import Brands from "@/components/hert/brands"
import SEOText from "@/components/hert/home-seo"
import { cp } from "fs"
import ProductsCarouselProducts from "@/components/hert/products-carouse-products"
import SobianekLanding from "./home"
import { HeroSplit } from "@/components/sobianek/home/hero-split"
import { TrustBadges } from "@/components/sobianek/home/trust-badges"
import { AboutStats } from "@/components/sobianek/home/about-stats"
import ProductCarousel from "@/components/product/ProductsCarusel"
import { MagazineSection } from "@/components/sobianek/home/magazine-section"
import { BlogSections } from "@/components/sobianek/home/blog-sections"
import { Testimonials } from "@/components/sobianek/home/testimonials"
import { SeoContent } from "@/components/sobianek/home/seo-content"
import { ContactForm } from "@/components/sobianek/home/contact-form"

async function fetchProducts(endpoint: string) {
  try {
    console.log(`${process.env.NEXT_PUBLIC_API_URL}/api/home/${endpoint}`)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/${endpoint}`, {
      next: { revalidate: 1 }
    });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    const result = data.hits?.map((hit: any) => hit.document || hit) ?? [];

    return result;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}

const [newestProducts, bestProducts, popularProducts, blog, blog_agro, reviewss] = await Promise.all([
  fetchProducts('new_products'),
  fetchProducts('best'),
  fetchProducts('popular_products'),
  fetchProducts('blog'),
  fetchProducts('blog_agro'),
  fetchProducts('reviewss'),
]);

export default async function HomePage() {




  return (
    <main className="flex-1">
      <HeroSplit />

      <TrustBadges />
      <ProductsCarouselProducts title="Najnowsze produkty" products={newestProducts.length > 0 ? newestProducts : []} />

      <AboutStats />

      {/* Bestsellers Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary" />
            <h2 className="text-3xl font-bold text-foreground">Bestsellery</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Poznaj produkty najczęściej wybierane przez naszych klientów. Nasze certyfikowane i nagrodzone produkty w
            najlepszych cenach. Nasze certyfikowane produkty dostępne są w szerokiej dostępności czynili to z dolorem
            distribai. Produkty które trafiają, środki ochrony roślin, stabilizator azotu i darmowa dostawa. Produkty
            tej marki, środki ochrony roślin, stabilizator azotu i darmowa dostawa i dalszego dostarcznia partmo w
            dostępne opady i rośliny poplożnikew.
          </p>
          {/* <ProductCarousel category="BestProducts" /> */}
          <ProductsCarouselProducts title="Bestsellers" products={bestProducts.length > 0 ? bestProducts : []} />

        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-8 bg-primary" />
            <h2 className="text-3xl font-bold text-foreground">Klienci uwielbiają</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            Klienci uwielbiają nas, ponieważ regularnie nas oceniają i zostawiają szczere opinie. Dzięki ich pozytywnym recenzjom wiemy, że to, co robimy, naprawdę ma znaczenie i trafia w ich potrzeby. To właśnie te oceny i komentarze są dla nas najlepszym dowodem, że jesteśmy na właściwej drodze.
          </p>
          {/* <ProductCarousel category="new" /> */}
          <ProductsCarouselProducts title="Najlepiej oceniane" products={popularProducts.length > 0 ? popularProducts : []} />

        </div>
      </section>

      {/* <MagazineSection /> */}

      <BlogSections blog={blog} agro={blog_agro} />

      <Testimonials reviews={reviewss} />

      <SeoContent />

      <ContactForm />
    </main>
  )
}