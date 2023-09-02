/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals.push({
      'utf-8-validate': 'commonjs utf-8-validate',
      bufferutil: 'commonjs bufferutil',
    });
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/socket/:path*',
        destination:
          'https://nextjs-socket-io-server-production.up.railway.app/api/socket/:path*',
      },
    ];
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['uploadthing.com'],
  },
};

module.exports = nextConfig;
