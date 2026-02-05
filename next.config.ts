import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude duplicate/reference folders from compilation
  webpack: (config) => {
    config.watchOptions = {
      ignored: [
        '**/Lunar-Med-Track/**',
        '**/LunarMedtrack-API/**',
        '**/iris-health-app/**',
        '**/node_modules/**',
      ],
    };
    return config;
  },
  // Turbopack configuration
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
