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