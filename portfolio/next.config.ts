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
  async redirects() {
    return [
      {
        source: "/portfolio",
        destination: "/",
        permanent: false,
      },
      {
        // project renamed: LEAP is the CSA program, not the project
        source: "/portfolio/csa-lunar-leap",
        destination: "/portfolio/lunar-transport-system",
        permanent: true,
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
