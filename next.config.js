/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Provide empty modules for missing Keyv adapters
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@keyv/redis': false,
      '@keyv/mongo': false,
      '@keyv/sqlite': false,
      '@keyv/postgres': false,
      '@keyv/mysql': false,
      '@keyv/etcd': false,
      '@keyv/offline': false,
      '@keyv/tiered': false
    };
    
    return config;
  },
};

module.exports = nextConfig;