/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "res.cloudinary.com",
      "mir-s3-cdn-cf.behance.net",           // ← add this
    ],
    remotePatterns:  [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mir-s3-cdn-cf.behance.net",  // ← add this
        pathname: "/**",
      },
    ],
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['images.unsplash.com', 'plus.unsplash.com', 'res.cloudinary.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
    serverComponentsExternalPackages: ['bcrypt', 'mongodb', 'mongoose', '@auth/prisma-adapter'],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  webpack: (config, { isServer }) => {
    // Optimize chunk loading
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        cacheGroups: {
          defaultVendors: {
            test: /[\\/]node_modules[\\/]/,
            priority: -10,
            reuseExistingChunk: true,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    }
    return config
  },
  // Add pageExtensions to explicitly define valid page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable source maps in production to reduce complexity
  productionBrowserSourceMaps: false,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig 