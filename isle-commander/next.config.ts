import type { NextConfig } from "next";

const devWatchIgnored = [
  "**/.git/**",
  "**/.next/**",
  "**/node_modules/**",
  "**/.playwright-cli/**",
  "**/Matter.js component/**",
  "**/*.gif",
  "**/*.jpg",
  "**/*.jpeg",
  "**/*.pdf",
  "**/*.png",
  "**/*.webp",
  "**/ruvector.db",
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/portfolio",
        destination: "/",
        permanent: false,
      },
    ];
  },
  webpack: (config, { dev }) => {
    if (!dev) {
      return config;
    }

    config.watchOptions = {
      ...config.watchOptions,
      ignored: devWatchIgnored,
    };

    return config;
  },
};

export default nextConfig;
