import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
        source: '/privacy-policy',
        destination: '/terms-of-service#privacy-policy',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
