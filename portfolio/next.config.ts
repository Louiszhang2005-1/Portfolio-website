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

const isDev = process.env.NODE_ENV === "development";

// Static site, no nonces: inline scripts stay allowed (Next's RSC payload), but
// every script/style/font/media/connect origin is pinned. Vercel Analytics and
// Speed Insights are same-origin on Vercel (/_vercel/*); va.vercel-scripts.com
// is their off-Vercel/debug fallback. The /classic hero video is on CloudFront.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  "media-src 'self' blob: https://d8j0ntlcm91z4.cloudfront.net",
  `connect-src 'self' blob: data: https://va.vercel-scripts.com${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "frame-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=(), hid=(), midi=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
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
