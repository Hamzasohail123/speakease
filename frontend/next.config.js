/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  webpack: (config, { isServer }) => {
    // Handle VAD library and its dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Ignore warnings from onnxruntime-web
    config.ignoreWarnings = [
      { module: /node_modules\/onnxruntime-web/ },
      { message: /Critical dependency/ },
    ];

    return config;
  },
};

module.exports = nextConfig;

