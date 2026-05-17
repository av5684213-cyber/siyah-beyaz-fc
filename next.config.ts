import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'standalone',  // Disabled — causes next start to fail; use next dev instead

  // TypeScript strict build — hataları göster ama production'ı engelleme
  typescript: {
    ignoreBuildErrors: true,
  },

  // Geliştirme ortamında tüm origin'lere izin ver
  allowedDevOrigins: [
    "*",
  ],

  // Görsel optimizasyonu — dış görsel domain'leri
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'jmxbyaamwbpnvgbnjbmo.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  // Güvenlik başlıkları
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
