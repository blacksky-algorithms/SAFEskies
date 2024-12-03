import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    config.watchOptions = {
      aggregateTimeout: 300, // Delay rebuild after file changes (default: 300ms)
      poll: 1000, // Poll file system every second for changes
      ignored: /node_modules/, // Ignore unnecessary directories
    };
    return config;
  },
};

export default nextConfig;
