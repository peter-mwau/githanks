import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'github.com'
    ],
    // Alternative: use remotePatterns for more control
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
