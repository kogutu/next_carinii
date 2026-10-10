import type { Metadata } from "next"
import Link from "next/link"
import home from "@/data/home.json"
import LazyVideo from "@/components/home/LazyVideo"
import ProductsCarouselProducts from "@/components/hert/products-carouse-products"


const HOME_TITLE = "Carinii - buty damskie i torebki | sklep.carinii.com.pl"
const HOME_DESCRIPTION =
  "Zapraszamy do sklepu Online Carinii, czekają na Was piękne: baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy"

// Własne canonical i Open Graph strony głównej (metadane z layoutu nie zawierają już adresu strony)
export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "/",
    type: "website",
    siteName: "Carinii",
    locale: "pl_PL",
    images: [{ url: "/fav/og-image.jpg", width: 1200, height: 630, alt: "Carinii - Obuwie Damskie i Torebki" }],
  },
}

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
      {/* Mobile: wideo (ładuje się tylko na telefonie) */}
      <Link href={hero.href} aria-label={hero.desktopAlt} className="block md:hidden">
        <LazyVideo
          mp4={hero.mobileVideoMp4}
          webm={hero.mobileVideoWebm}
          poster="/home/hero-mob-poster.jpg"
          width={480}
          height={848}
          media="(max-width: 767px)"
          eager
        />
      </Link>
    </div>
  )
}

function MagdaVideo({ section }: { section: any }) {
  return (
    <div className="relative">
      {/* Desktop */}
      <Link href={section.href} aria-label="By Magda Pieczonka" className="hidden md:block">
        <LazyVideo
          mp4={section.deskMp4}
          webm={section.deskWebm}
          width={1920}
          height={1080}
          media="(min-width: 768px)"
        />
      </Link>
      {/* Mobile */}
      <Link href={section.href} aria-label="By Magda Pieczonka" className="block md:hidden">
        <LazyVideo
          mp4={section.mobMp4}
          webm={section.mobWebm}
          poster={section.mobPoster}
          width={1080}
          height={1620}
          media="(max-width: 767px)"
        />
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
