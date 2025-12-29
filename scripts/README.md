# Scripts 目录说明

## 📁 文件列表

| 文件 | 说明 | 平台 |
|------|------|------|
| `setup.sh` | 一键配置部署工具 | Linux/macOS |
| `setup.ps1` | 一键配置部署工具 | Windows |
| `deploy.sh` | 服务管理脚本 | Linux/macOS |
| `server-init.sh` | 服务器初始化脚本 | Linux |
| `backup.sh` | 数据备份脚本 | Linux/macOS |
| `ssl-setup.sh` | SSL 证书配置脚本 | Linux |
| `health-check.sh` | 健康检查脚本 | Linux/macOS |

## 🚀 使用方法

### 首次部署

```bash
# Linux/macOS
chmod +x setup.sh
./setup.sh

# 或快速部署
./setup.sh --quick

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File setup.ps1
```

### 服务管理

```bash
./deploy.sh start      # 启动服务
./deploy.sh stop       # 停止服务
./deploy.sh restart    # 重启服务
./deploy.sh status     # 查看状态
./deploy.sh logs       # 查看日志
./deploy.sh health     # 健康检查
./deploy.sh migrate    # 数据库迁移
./deploy.sh backup     # 数据备份
./deploy.sh update     # 更新部署
./deploy.sh ssl        # SSL 配置
./deploy.sh clean      # 清理资源
```

### 服务器初始化（新服务器）

```bash
# 远程执行
curl -fsSL https://raw.githubusercontent.com/your-repo/Gemini-Web/main/scripts/server-init.sh | bash

# 或本地执行
./scripts/server-init.sh
```

### 数据备份

```bash
./scripts/backup.sh backup      # 完整备份
./scripts/backup.sh db          # 仅备份数据库
./scripts/backup.sh list        # 列出备份
./scripts/backup.sh restore xxx # 恢复数据库
```

### SSL 证书配置

```bash
./scripts/ssl-setup.sh your-domain.com
```

### 健康检查

```bash
./scripts/health-check.sh
```

## 🔧 setup.sh 参数

| 参数 | 说明 |
|------|------|
| `--quick`, `-q` | 快速部署，使用默认配置 |
| `--config-only`, `-c` | 仅生成配置文件，不启动服务 |
| `--help`, `-h` | 显示帮助信息 |

## 📋 配置向导流程

1. **环境检查** - 检查 Docker、Docker Compose
2. **端口检查** - 检查 30000, 31001, 35432, 36379
3. **配置输入** - 交互式配置数据库、Redis、JWT、API 等
4. **生成配置** - 自动生成 .env 文件
5. **构建镜像** - 构建 Docker 镜像
6. **启动服务** - 启动所有容器
7. **健康检查** - 检查服务状态
8. **完成提示** - 显示访问地址

## ⚠️ 注意事项

1. 首次运行需要 root 或 docker 组权限
2. 确保 Docker 服务已启动
3. 快速部署会自动生成随机密码
4. 生产环境请修改 `OPENAI_API_KEY`
5. 建议配置 SSL 证书并使用 HTTPS

