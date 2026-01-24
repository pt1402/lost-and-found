import type { NextConfig } from "next";

// We use ': any' here to stop TypeScript from complaining about the 'eslint' property
const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // If you had images config, keep it here:
  images: {
    domains: ['firebasestorage.googleapis.com', 'placehold.co'],
  },
};

export default nextConfig;