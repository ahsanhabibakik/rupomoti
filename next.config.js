/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Move outputFileTracingExcludes to root level as per Next.js 15
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild/linux-x64',
    ],
  },
  // Optimize build and runtime performance
  experimental: {
    optimizePackageImports: ['@prisma/client'],
  },
  // Add webpack optimization for Prisma
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  // Add output configuration
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mir-s3-cdn-cf.behance.net",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "rupomoti.vercel.app",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "rupomoti.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "developers.google.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.prosystem.com.bd",
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  serverExternalPackages: ['bcrypt', 'mongodb', 'mongoose', '@auth/prisma-adapter'],
  compress: true,
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig