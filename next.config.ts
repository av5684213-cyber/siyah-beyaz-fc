import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Next.js 16 Turbopack: dev-only klasörünü production build dışında bırak
  turbopack: {
    resolveAlias: {
      // src/dev-only/ klasörü hiçbir import ile eşleşmediği için eklemeye gerek yok
      // (data.ts hiçbir yerden import edilmiyor — zaten ölü kod)
    },
  },



  // Mobil/PWA için zoom disable
  // allowedDevOrigins sadece local dev için
  allowedDevOrigins: ["localhost", "127.0.0.1", ".space.chatglm.site", ".space-z.ai", ".chatglm.site", "preview-chat-bdb86760-5776-4f94-b49f-36fec4f99ade.space-z.ai"],

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
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "Referrer-Policy",          value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",       value: "camera=(), microphone=(), geolocation=()" },
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
    ];
  },

  async redirects() {
    return [];
  },
};

export default nextConfig;
