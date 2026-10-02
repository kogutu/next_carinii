import Link from "next/link"
import home from "@/data/home.json"
import ProductsCarouselProducts from "@/components/hert/products-carouse-products"


// Funkcja do pobierania najnowszych produktów
async function getNewestProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/home/new_products`, {
      next: { revalidate: 3600 }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await res.json();

    if (data.hits && Array.isArray(data.hits)) {
      return data.hits.map((hit: any) => {
        const product = hit.document || hit;

        return product;
      });
    }

    return [];
  } catch (error) {
    console.error('Error fetching newest products:', error);
    return [];
  }
}

function HomeBanner({ href, mob, desk, alt, eager = false }: {
  href: string
  mob: string
  desk: string
  alt: string
  eager?: boolean
}) {
  return (
    <div className="relative">
      <img
        className="block w-full md:hidden"
        src={mob}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <img
        className="hidden w-full md:block"
        src={desk}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
      <Link
        className="absolute inset-0 w-full h-full"
        href={href}
        aria-label={alt}
      />
    </div>
  )
}

function HeroVideo() {
  const hero = (home as any).hero
  return (
    <div className="relative">
      {/* Desktop: statyczny obrazek */}
      <Link href={hero.href} aria-label={hero.desktopAlt} className="hidden md:block">
        <img
          className="w-full"
          src={hero.desktopImage}
          alt={hero.desktopAlt}
          loading="eager"
          // @ts-expect-error fetchPriority nie ma jeszcze w typach React 19
          fetchpriority="high"
          decoding="async"
        />
      </Link>
      {/* Mobile: wideo */}
      <Link href={hero.href} aria-label={hero.desktopAlt} className="block md:hidden">
        <video
          className="w-full h-auto"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={hero.mobileVideoWebm} type="video/webm" />
          <source src={hero.mobileVideoMp4} type="video/mp4" />
        </video>
      </Link>
    </div>
  )
}

function MagdaVideo({ section }: { section: any }) {
  return (
    <div className="relative">
      {/* Desktop */}
      <Link href={section.href} aria-label="By Magda Pieczonka" className="hidden md:block">
        <video
          className="w-full h-auto"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={section.deskWebm} type="video/webm" />
          <source src={section.deskMp4} type="video/mp4" />
        </video>
      </Link>
      {/* Mobile */}
      <Link href={section.href} aria-label="By Magda Pieczonka" className="block md:hidden">
        <video
          className="w-full h-auto"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={section.mobPoster}
        >
          <source src={section.mobWebm} type="video/webm" />
          <source src={section.mobMp4} type="video/mp4" />
        </video>
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const newestProducts = await getNewestProducts();

  return (
    <>
      <HeroVideo />

      {(home as any).sections.map((section: any, i: number) => {
        if (section.type === "banner") {
          return (
            <HomeBanner
              key={i}
              href={section.href}
              mob={section.mob}
              desk={section.desk}
              alt={section.alt}
            />
          )
        }

        if (section.type === "products") {
          return (
            <ProductsCarouselProducts
              key={i}
              title={section.title}
              products={newestProducts.length > 0 ? newestProducts : []}
            />
          )
        }

        if (section.type === "magda-video") {
          return <MagdaVideo key={i} section={section} />
        }

        if (section.type === "seo") {
          return (
            <section
              key={i}
              className="max-w-7xl mx-auto px-4 py-10 text-sm leading-relaxed text-gray-600 font-light [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-gray-900 [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-3 [&_p]:mb-4 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: (home as any).seoHtml }}
            />
          )
        }

        return null
      })}
    </>
  )
}
