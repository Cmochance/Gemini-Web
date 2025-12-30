/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Docker 优化：独立输出模式
  output: 'standalone',

  // 实验性功能
  experimental: {
    // 优化包导入，减少 bundle 大小
    optimizePackageImports: ['antd', '@ant-design/icons', 'lodash'],
  },

  // 性能优化
  compress: true,
  poweredByHeader: false,

  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Webpack 配置
  webpack: (config) => {
    // SVG 支持
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    return config
  },

  // 开发环境优化
  devIndicators: {
    appIsrStatus: false,
  },
}

// 端口配置说明:
// - 开发模式: npm run dev (端口 30000)
// - 生产模式: npm run start (端口 30000)
// - Docker 模式: 容器内端口 30000
module.exports = nextConfig
