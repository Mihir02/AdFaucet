/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  eslint: {
    // Allow production builds to succeed even if ESLint errors exist
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to succeed even if TypeScript errors exist
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
