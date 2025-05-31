import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fyers-api-v3"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
      };
    }

    // Exclude fyers-api-v3 from client-side bundling
    config.externals = [...(config.externals || [])];

    if (!isServer) {
      config.externals.push("fyers-api-v3");
    }

    return config;
  },
};

export default nextConfig;
