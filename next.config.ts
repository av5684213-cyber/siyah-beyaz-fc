import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  output: 'standalone',
  allowedDevOrigins: [
    "*",
  ],
};

export default nextConfig;
