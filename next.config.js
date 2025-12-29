/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Docker 优化：独立输出模式
    output: 'standalone',
    webpack: (config) => {
        config.module.rules.push({
            test: /\.svg$/,
            use: ["@svgr/webpack"],
        });
        return config;
    },
};

// 端口配置说明:
// - 开发模式: npm run dev (端口 30000)
// - 生产模式: npm run start (端口 30000)
// - Docker 模式: 容器内端口 30000
module.exports = nextConfig;
