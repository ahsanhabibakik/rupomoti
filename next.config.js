/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
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
  serverExternalPackages: ['bcryptjs', 'mongoose']
}

module.exports = nextConfig