/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['googleapis'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'googleapis': 'commonjs googleapis',
      });
    }
    return config;
  },
  // إعدادات إضافية لضمان التوافق مع Vercel
  output: 'standalone',
  poweredByHeader: false,
  // إعدادات إضافية لحل مشكلة googleapis
  serverRuntimeConfig: {
    googleapis: true,
  },
}

export default nextConfig
