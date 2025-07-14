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
  // Completely disable standalone output which causes symlink permission issues on Windows
  // For production deployment, this should be re-enabled on the deployment server
  // output: 'standalone',
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
      // BlueStone domains
      {
        protocol: "https",
        hostname: "kinclimg0.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg1.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg2.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg3.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg4.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg5.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg6.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg7.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg8.bluestone.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kinclimg9.bluestone.com",
        pathname: "/**",
      },
      // Piaget domains
      {
        protocol: "https",
        hostname: "img.piaget.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
  },
  serverExternalPackages: ['bcrypt', 'mongodb', 'mongoose', '@auth/prisma-adapter', '@prisma/client', 'prisma'],
  // Optimize build and runtime performance  
  experimental: {
    optimizePackageImports: ['@prisma/client'],
  },
  compress: true,
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig