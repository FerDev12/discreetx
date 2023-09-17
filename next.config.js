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
        destination: `${process.env.SOCKET_IO_API_URL}/api/socket/:path*`,
      },
    ];
  },
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'uploadthing.com',
      'oaidalleapiprodscus.blob.core.windows.net',
      'utfs.io',
    ],
  },
};

module.exports = nextConfig;
