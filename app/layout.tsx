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
  title: 'HERT | Profesjonalne Wyposażenie dla Branży Spożywczej',
  description: 'Wyposażenie piekarni, cukierni i gastronomii. Maszyny do branży spożywczej od sprawdzonych producentów. Serwis i projekty przemysłowe.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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