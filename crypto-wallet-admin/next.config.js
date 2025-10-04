/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  turbopack: {
    root: process.cwd(),
  },
  webpack: false,
};

module.exports = nextConfig;
