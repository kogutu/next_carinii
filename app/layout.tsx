import React from "react"
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from "@/components/hert/header"
import Footer from "@/components/hert/footer"
import CartHydrator from "@/components/cart/CartHydrator"
import { cookies } from "next/headers"
import { SessionProvider } from "next-auth/react"
import { Providers } from "./providers"
import Script from "next/script"

const inter = Inter({ subsets: ["latin", "latin-ext"] });
import { Outfit } from 'next/font/google'
import RouteListener, { NavigationButton } from "@/components/loader_page"

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
})

export const dynamic = 'force-dynamic' // 👈 Add this
export const metadata: Metadata = {
  title: 'Carinii - Obuwie Damskie i Torebki | Sklep Online',
  description: 'Zapraszamy do sklepu Online Carinii, czekają na Was piękne: baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy',
  keywords: 'baleriny, botki, czółenka, klapki, kozaki, mokasyny, półbuty, sandały, sneakersy, Carinii, Obuwie Damskie',
  viewport: 'width=device-width, initial-scale=1.0',
  referrer: 'no-referrer-when-downgrade',
  generator: 'v0.app',
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
    url: '/fav/',
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
  alternates: {
    canonical: '/fav/',
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
    // Add your verification codes here if needed
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  other: {
    'yandex-verification': 'your-yandex-verification-code', // Add your Yandex Metrika verification
  },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const cookieStore = await cookies()
  const currency_cookies = cookieStore.get('currency')?.value ?? 'PLN'
  return (
    <html lang="pl">

      <body className={`font-sans antialiased`}>
        <Providers>
          <CartHydrator />
          <div className="min-h-screen flex flex-col bg-white">
            <div id="google_translate_element" className="hidden"></div>
            <Header currency={currency_cookies} />
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