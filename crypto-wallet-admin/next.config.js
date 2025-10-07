/** @type {import('next').NextConfig} */
const nextConfig = {
  // Desabilitar todas as verificações
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurações de produção
  swcMinify: true,
  compress: true,
  // Desabilitar turbo
  experimental: {
    turbo: false,
  },
  // Configurações de webpack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/,
      };
    }
    return config;
  },
  // Configurações de rewrites para produção
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.notus.finance';
    
    return [
      {
        source: '/settings',
        destination: `${apiUrl}/settings`,
      },
      {
        source: '/users',
        destination: `${apiUrl}/users`,
      },
      {
        source: '/users/:path*',
        destination: `${apiUrl}/users/:path*`,
      },
      {
        source: '/tokens',
        destination: `${apiUrl}/tokens`,
      },
      {
        source: '/tokens/:path*',
        destination: `${apiUrl}/tokens/:path*`,
      },
      {
        source: '/whatsapp/:path*',
        destination: `${apiUrl}/whatsapp/:path*`,
      },
      {
        source: '/dashboard/:path*',
        destination: `${apiUrl}/dashboard/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;