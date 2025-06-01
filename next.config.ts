import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      }
    ]
  },
  experimental: {
    serverActions: {
      // Increase to, say, 10 MiB (adjust as needed)
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
