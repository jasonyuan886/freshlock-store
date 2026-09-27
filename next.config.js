
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
      // 2026-09-27 合并重复文章：这两篇标题几乎同义、只隔5天发布，4篇文章在抢同一批
      // 关键词(自噬)。近90天数据：被保留篇 3 次浏览，本篇 0 次，所以把 0 浏览的这篇
      // 301 到有流量的那篇，独有小节已并入，排名信号集中到一个 URL 上。
      { source: '/blog/vacuum-sealer-with-drip-tray-liquid-protection', destination: '/blog/vacuum-sealer-liquid-protection-drip-tray', permanent: true },
    ];
  },
};

module.exports = nextConfig;
