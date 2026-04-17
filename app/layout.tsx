import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import { HeaderSobianek } from "@/components/sobianek/home_2/header-sobianek"
import { Footer } from "@/components/sobianek/home/footer"
import CartHydrator from "@/components/cart/CartHydrator"
import { cookies } from "next/headers"
import { SessionProvider } from "next-auth/react"
import { Providers } from "./providers"
import Script from "next/script"

import { Outfit } from 'next/font/google'
import RouteListener, { NavigationButton } from "@/components/loader_page"
import { JsonLd } from "@/components/json-ld"
import { buildOrganizationJsonLd, buildWebSiteJsonLd } from "@/lib/json-ld"
import { ContactBar } from "@/components/sobianek/home/contact-bar"
import TopHeader from "@/components/hert/topHeader"

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
})

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
})

export const dynamic = 'force-dynamic' // 👈 Add this

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}
export const metadata: Metadata = {
  title: 'Sobianek - Opał, Ekogroszek, Nawozy i Środki Ochrony Roślin | Sklep Online',
  description: 'Sobianek Sp. z o.o. – lider w sprzedaży węgla, ekogroszku (m.in. Lew, Pantera), pelletu oraz produktów rolniczych od 1992 roku. Oferujemy nawozy (w tym RSM), środki ochrony roślin, materiał siewny i profesjonalne doradztwo agrotechniczne.',
  keywords: 'sobianek, ekogroszek, węgiel, opał, groszek Lew, groszek Pantera, nawozy, RSM, środki ochrony roślin, materiał siewny, pellet, sklep rolniczy, Parczew',
  referrer: 'no-referrer-when-downgrade',
  generator: 'v0.app',
  appleWebApp: {
    title: 'Sobianek.pl',
  },
  openGraph: {
    title: 'Sobianek - Opał i Produkty Rolnicze | sobianek.pl',
    description: 'Sobianek Sp. z o.o. – wysokiej jakości węgiel, ekogroszek, pellet, nawozy rolnicze i środki ochrony roślin. Sklep online z dostawą w całej Polsce.',
    url: 'https://sobianek.pl',
    type: 'website',
    siteName: 'Sobianek',
    images: [
      {
        url: '/fav/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sobianek - Opał i Produkty Rolnicze',
      },
    ],
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobianek - Ekogroszek, Węgiel i Nawozy',
    description: 'Sobianek Sp. z o.o. – opał najwyższej jakości oraz pełna oferta dla rolnictwa: nawozy, środki ochrony roślin i profesjonalne doradztwo.',
    images: ['/fav/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://sobianek.pl',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  other: {
    'yandex-verification': 'your-yandex-verification-code',
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies()
  const currency_cookies = cookieStore.get('currency')?.value ?? 'PLN'
  return (
    <html lang="pl">

      <body className={`font-sans antialiased`}>
        <JsonLd data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]} />
        <Providers>
          <CartHydrator />
          <TopHeader />
          {/* <PromoBanner /> */}
          <ContactBar />
          <HeaderSobianek />

          <div className="min-h-screen flex flex-col bg-white">
            <div id="google_translate_element" className="hidden"></div>
            {/* <Header currency={currency_cookies} /> */}
            <main className="flex-1 mt-4 relative">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
        <Script id="google-translate-init" strategy="afterInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement(
                {
                  pageLanguage: 'pl',
                  includedLanguages: 'pl,en,de',
                  autoDisplay: false
                },
                'google_translate_element'
              );
            }
          `}
        </Script>
        <RouteListener></RouteListener>
      </body>
    </html>
  )
}