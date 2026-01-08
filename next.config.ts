import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},
  output: 'standalone',
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_SAFE_SKIES_API;
    return [
      {
        source: '/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: '/oauth/client-metadata.json',
        destination: `${backendUrl}/oauth/client-metadata.json`,
      },
    ];
  },
};

export default nextConfig;
