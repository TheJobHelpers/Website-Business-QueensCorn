import type { NextConfig } from "next";

// Sent with every page. They tell the browser to refuse a few classes of attack outright.
const securityHeaders = [
  // never guess a file's type from its content
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // the site may not be shown inside a frame on another site (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
  // other sites only learn our address, not the full page a visitor came from
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // features the site does not use stay off
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  // always HTTPS (ignored by browsers on localhost)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
];

const nextConfig: NextConfig = {
  // don't advertise the framework
  poweredByHeader: false,
  images: {
    // flavor photos imported from Shopify (see importShopifyCatalogAction)
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.shopify.com' }],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // the dashboard is never cached and never indexed
        source: '/admin/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/terms',
        destination: '/terms-of-service',
        permanent: true,
      },
      {
        source: '/terms-and-conditions',
        destination: '/terms-of-service',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
