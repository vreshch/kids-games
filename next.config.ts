import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // only tiny pre-optimized icons; keep sharp off the 0.4-CPU container
  images: { unoptimized: true, minimumCacheTTL: 604800 },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Perot listens through the mic; everything else stays off
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=(), geolocation=(), payment=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
