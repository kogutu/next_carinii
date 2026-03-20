import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    domains: ['wsrv.nl', "sklep.carinii.com.pl", "carinii.com.pl", 'images.weserv.nl'],
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'carinii.com.pl',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

export default nextConfig