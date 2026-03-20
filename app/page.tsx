import HeroBanner from "@/components/hert/hero-banner"
import Features from "@/components/hert/features"
import CategoryCards from "@/components/hert/category-cards"
import ProductsCarousel from "@/components/hert/products-carousel"
import CTASections from "@/components/hert/cta-sections"
import Brands from "@/components/hert/brands"
import SEOText from "@/components/hert/home-seo"
import { cp } from "fs"


// Funkcja do pobierania najnowszych produktów
async function getNewestProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/home/new_products', {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();

    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => {
        const product = hit.document || hit;

        return {
          id: product.id || product.pid,
          image: product.image_main,
          name: product.name,
          url: product.slug,
          price: product.price,
          hidePrice: product.hide_price,
          sizes_qty: product.size_qty,
          tag: product.new === '1' ? 'NOWOŚĆ' : ''
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching newest products:', error);
    return [];
  }
}

export default async function HomePage() {
  const newestProducts = await getNewestProducts();

  return (
    <>

      {/* Widget nowosci/nowosci - do zastąpienia odpowiednim komponentem */}

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=86&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/wo_m.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=88output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/wo_d.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/nowosci.html"
        ></a>
      </div>
      <ProductsCarousel title="Najnowsze produkty" products={newestProducts.length > 0 ? newestProducts : []} />

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=84&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/2-25m.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=89&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/2-25d.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/wyprzedaz.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/3.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/3.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/by-magda-pieczonka.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/4.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/4.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/obuwie/sneakersy.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/5.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/5.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/obuwie/sandaly.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/6.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/6.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/obuwie/baleriny.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/7.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/7.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/obuwie/kowbojki.html"
        ></a>
      </div>

      <div className="relative">
        <img
          className="vmob hidden max-md:block"
          src="https://wsrv.nl/?w=600&q=83&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/mob/8.webp"
          style={{ width: '100%' }}
          alt=""
        />

        <img
          alt=""
          className="vdes max-md:hidden"
          src="https://wsrv.nl/?w=1900&q=90&output=webp&url=https://media-02.carinii.com.pl/cdn-cgi/image/w=1920,f=auto/media/home/desk/8.webp"
          style={{ width: '100%' }}
        />
        <a
          className="arel absolute inset-0 w-full h-full"
          href="https://sklep.carinii.com.pl/obuwie/mokasyny.html"
        ></a>
      </div>




    </>
  )
}