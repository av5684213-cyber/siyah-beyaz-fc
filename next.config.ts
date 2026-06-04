import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Not: swcMinify Next.js 16'da varsayılan olarak aktif, ayar kaldırıldı
  // (önceki TDZ workaround artık gerekli değil — compact:false ile çözüldü)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },

  // Self-hosted dağıtım: standalone output (Docker için gerekli)
  // Vercel kullanılmadığından her zaman aktif
  output: 'standalone' as const,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Next.js 16 Turbopack: dev-only klasörünü production build dışında bırak
  turbopack: {
    resolveAlias: {
      // src/dev-only/ klasörü hiçbir import ile eşleşmediği için eklemeye gerek yok
    },
  },

  // allowedDevOrigins: local dev ve production ortamları için
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ".space-z.ai",
  ],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // iframe embed: Next.js 16 varsayılan CSP frame-ancestors 'none' koyar — override
          // frame-ancestors * : preview proxy katmanlarıyla CSP çakışmasını önler
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *",
          },
          // Güvenlik header'ları
          { key: "X-Content-Type-Options",   value: "nosniff" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control",       value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          // Production: Kendi domain'inizi ve Supabase URL'nizi ekleyin
          { key: "Access-Control-Allow-Origin", value: process.env.NEXT_PUBLIC_SITE_URL || "https://jmxbyaamwbpnvgbnjbmo.supabase.co" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, x-admin-user-id" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
  },

  async redirects() {
    return [];
  },
};

export default nextConfig;
