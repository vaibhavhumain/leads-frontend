const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // other PWA options here
});

const nextConfig = {
  reactStrictMode: true,
  output : "export",
  // any other Next.js config here
};

module.exports = withPWA(nextConfig);
