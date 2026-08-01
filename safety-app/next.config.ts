import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // three.js ships untranspiled ESM add-ons (used by drei) — Next must transpile them.
  transpilePackages: ["three"],
  // Allows hot-reload when the dev server is opened from another device on
  // the LAN (e.g. testing the mobile layout on a real phone).
  // Development only — has no effect on the production build.
  allowedDevOrigins: ["192.168.110.2"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
