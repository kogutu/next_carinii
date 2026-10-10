import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from "@/components/hert/header"
import Footer from "@/components/hert/footer"
import CartHydrator from "@/components/cart/CartHydrator"
import { Providers } from "./providers"
import CookieBanner from "@/components/consent/CookieBanner"
import Tracking from "@/components/analytics/Tracking"
import { SITE_URL } from "@/lib/seo"
import JsonLd from "@/components/seo/JsonLd"
import { organizationSchema, websiteSchema } from "@/lib/structuredData"

const inter = Inter({ subsets: ["latin", "latin-ext"] });
import { Outfit } from 'next/font/google'
import RouteListener, { NavigationButton } from "@/components/loader_page"

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
}
export const metadata: Metadata = {
  // adres bezwzględny dla canonical, og:image i pozostałych linków względnych w metadanych
  metadataBase: new URL(SITE_URL),
  title: 'Carinii - Obuwie Damskie i Torebki | Sklep Online',
  description: 'Zapraszamy do sklepu Online Carinii, czekają na Was piękne: baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy',
  referrer: 'no-referrer-when-downgrade',
  icons: {
    icon: [
      {
        url: '/fav/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/fav/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/fav/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/fav/znaczek.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/fav/aapple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: ['/fav/favicon.ico'],
  },
  manifest: '/fav/site.webmanifest',
  openGraph: {
    title: 'Carinii - buty damskie i torebki | sklep.carinii.com.pl',
    description: 'Zapraszamy do sklepu Online Carinii, czekają na Was piękne: baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy',
    type: 'website',
    siteName: 'Carinii',
    images: [
      {
        url: '/fav/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Carinii - Obuwie Damskie i Torebki',
      },
    ],
    locale: 'pl_PL',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carinii - buty damskie i torebki',
    description: 'Zapraszamy do sklepu Online Carinii, czekają na Was piękne: baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy',
    images: ['/fav/og-image.jpg'],
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl">

      <body className={`font-sans antialiased`}>
        <Providers>
          <CartHydrator />
          <div className="min-h-screen flex flex-col bg-white">
            <div id="google_translate_element" className="hidden"></div>
            <Header />
            <main className="flex-1 relative">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
        <RouteListener></RouteListener>
        <Tracking />
        <CookieBanner />
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  )
}