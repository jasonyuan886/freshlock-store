
// redeploy trigger 20260903-175253
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      { source: '/products/starter-kit', destination: '/products/freshlock-starter-kit', permanent: true },
      { source: '/products/vacuum-bags-small', destination: '/products/vacuum-seal-bags-30-pack', permanent: true },
      { source: '/products/vacuum-bags-medium', destination: '/products/vacuum-seal-bags-30-pack', permanent: true },
      { source: '/products/vacuum-bags-large', destination: '/products/vacuum-seal-bags-50-pack', permanent: true },
      { source: '/products/vacuum-seal-bags-25-pack', destination: '/products/vacuum-seal-bags-30-pack', permanent: true },
      { source: '/products/freshlock-vacuum-sealer', destination: '/products/freshlock-pro', permanent: true },
    ];
  },
};

module.exports = nextConfig;
