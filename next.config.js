/** @type {import('next').NextConfig} */
const nextConfig = {
  // 仅在生产环境启用严格模式，避免开发环境双重渲染影响性能
  reactStrictMode: process.env.NODE_ENV === 'production',

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
  webpack: (config, { dev, isServer }) => {
    // SVG 支持
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // 开发环境优化
    if (dev) {
      // 加速增量构建
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      }

      // 注意：不要修改 devtool，Next.js 默认配置已是最优
    }

    return config
  },

  // 开发服务器优化
  ...(process.env.NODE_ENV === 'development' && {
    // 仅在开发环境下生效
    onDemandEntries: {
      // 页面在内存中保留时间
      maxInactiveAge: 60 * 1000,
      // 同时保留的页面数
      pagesBufferLength: 5,
    },
  }),
}

// 端口配置说明:
// - 开发模式: npm run dev (端口 30000)
// - 生产模式: npm run start (端口 30000)
// - Docker 模式: 容器内端口 30000
module.exports = nextConfig
