/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve("crypto-browserify"),
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve("buffer"),
      process: require.resolve("process/browser"),
      util: require.resolve("util"),
      path: require.resolve("path-browserify"),
      events: require.resolve("events"),
    };

    config.plugins.push(
      new (require("webpack").ProvidePlugin)({
        process: "process/browser",
        Buffer: ["buffer", "Buffer"],
      }),
    );

    return config;
  },
};

module.exports = nextConfig;
