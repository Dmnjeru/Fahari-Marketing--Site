// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // ✅ Catch potential issues in dev
  swcMinify: true,       // ✅ Faster builds & smaller bundle

  eslint: {
    // ✅ Don't block production build if ESLint has warnings/errors
    ignoreDuringBuilds: true,
  },

  images: {
    // ✅ Add allowed external image domains (adjust if needed)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Allow all hosts (or restrict to your CDN/domain for security)
      },
    ],
  },
};

export default nextConfig;
