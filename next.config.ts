import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // USUŃ TĘ LINIĘ - jest deprecated:
    // domains: ['wsrv.nl', "sklep.carinii.com.pl", "carinii.com.pl", 'images.weserv.nl'],

    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'wsrv.nl',
      },
      {
        protocol: 'https',
        hostname: 'sklep.carinii.com.pl',
      },
      {
        // adresy z Magento z podwójnym ukośnikiem (https://sklep.carinii.com.pl//media/...) — Vercel
        // nie dopasowuje ich do pathname domyślnego wzorca
        protocol: 'https',
        hostname: 'sklep.carinii.com.pl',
        pathname: '//**',
      },
      {
        protocol: 'https',
        hostname: 'carinii.com.pl',
      },
      {
        protocol: 'https',
        hostname: 'images.weserv.nl',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true,
  // Roboty z tej listy dostają pełny HTML naraz, z metadanymi (title, description, canonical, og:*) w <head>.
  // Zwykli użytkownicy nadal dostają strumieniowanie z szybkim szkieletem strony. Domyślna lista Next.js
  // nie zawiera samego Googlebota (wykonuje JS), ale metadane w <head> są pewniejsze niż doczytywane w <body>.
  htmlLimitedBots:
    /[\w-]+-Google|Google-[\w-]+|Googlebot|GoogleOther|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|Pinterest|SkypeUriPreview|Yeti|googleweblight/i,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=()' },
        ],
      },
      {
        // wersja pokazowa na adresie *.vercel.app nie trafia do wyszukiwarek (docelowy adres: sklep.carinii.com.pl)
        source: '/:path*',
        has: [{ type: 'host', value: '(?<host>.+\\.vercel\\.app)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
  async redirects() {
    return [
      // stara strona kontaktowa z Magento — kontakt jest pod /kontakt
      { source: '/contact', destination: '/kontakt', permanent: true },
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig