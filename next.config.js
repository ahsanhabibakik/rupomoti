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
  // Include MongoDB and Mongoose binaries for serverless deployment
  outputFileTracingIncludes: {
    '/api/**/*': [
      './node_modules/mongoose/**/*',
      './node_modules/mongodb/**/*'
    ],
  },
  // Optimize build and runtime performance
  experimental: {
    optimizePackageImports: ['mongoose'],
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
    ],
    unoptimized: process.env.NODE_ENV === 'development',
  },
  serverExternalPackages: ['bcrypt'],
  compress: true,
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure mongoose and mongodb packages work in serverless environment
      config.externals = config.externals.filter(
        (external) => typeof external !== 'string' || (!external.includes('mongoose') && !external.includes('mongodb'))
      )
    }
    return config
  },
}

module.exports = nextConfig