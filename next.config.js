module.exports = {
  reactStrictMode: true,
  webpack: {
    configure: {
      experiments: {
          topLevelAwait: true
      }
    }
  }
};
