/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  distDir: '.next',
  cleanDistDir: true,
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    // Add custom handling for path resolution
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      },
    }
    return config
  },
  // Add pageExtensions to explicitly define valid page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable source maps in production to reduce complexity
  productionBrowserSourceMaps: false,
}

module.exports = nextConfig 