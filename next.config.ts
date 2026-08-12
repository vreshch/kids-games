import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
