import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage — replace `YOUR_PROJECT_REF` with the client's project ref
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // Add any other image hosts the client uses (e.g. their own CDN)
    ],
  },
}

export default nextConfig
