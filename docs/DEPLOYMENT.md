# 云端服务器 Docker 部署指南

Complete Docker Deployment Guide for Cloud Servers

## 📋 目录

1. [服务器要求](#服务器要求)
2. [环境准备](#环境准备)
3. [项目部署](#项目部署)
4. [Nginx 配置](#nginx-配置)
5. [SSL 证书](#ssl-证书)
6. [防火墙配置](#防火墙配置)
7. [运维管理](#运维管理)
8. [故障排查](#故障排查)

---

## 服务器要求

### 最低配置

| 资源 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 2 核 | 4 核 |
| 内存 | 4 GB | 8 GB |
| 硬盘 | 40 GB SSD | 100 GB SSD |
| 带宽 | 5 Mbps | 10 Mbps |

### 支持的操作系统

- Ubuntu 20.04 / 22.04 LTS (推荐)
- Debian 11 / 12
- CentOS 8 / 9
- Rocky Linux 8 / 9

---

## 环境准备

### 1. 更新系统

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/Rocky Linux
sudo dnf update -y
```

### 2. 安装基础工具

```bash
# Ubuntu/Debian
sudo apt install -y curl wget git vim htop

# CentOS/Rocky Linux
sudo dnf install -y curl wget git vim htop
```

### 3. 安装 Docker

```bash
# 使用官方脚本安装 Docker
curl -fsSL https://get.docker.com | sh

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户加入 docker 组（免 sudo）
sudo usermod -aG docker $USER

# 重新登录使权限生效
exit
# 重新 SSH 连接
```

### 4. 验证安装

```bash
# 检查 Docker 版本
docker --version

# 检查 Docker Compose 版本
docker compose version

# 测试 Docker
docker run hello-world
```

---

## 项目部署

### 1. 上传项目代码

**方式一：Git 克隆**
```bash
cd /opt
sudo git clone https://github.com/your-repo/Gemini-Web.git
cd Gemini-Web
sudo chown -R $USER:$USER .
```

**方式二：本地上传**
```bash
# 在本地执行
scp -r Gemini-Web/ user@your-server-ip:/opt/

# 在服务器执行
cd /opt/Gemini-Web
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
vim .env
```

**重要配置项（必须修改）：**

```bash
# 数据库密码（使用强密码）
DB_PASSWORD=YourStrongPassword123!

# Redis 密码
REDIS_PASSWORD=YourRedisPassword456!

# JWT 密钥（随机生成）
JWT_SECRET=$(openssl rand -base64 64 | tr -d '\n')

# AI API 配置
OPENAI_API_KEY=sk-your-actual-api-key
OPENAI_BASE_URL=https://api.openai.com/v1

# 前端地址（用于 CORS，如有域名则填写域名）
FRONTEND_URL=https://your-domain.com
```

### 3. 运行一键部署

```bash
# 赋予执行权限
chmod +x setup.sh scripts/*.sh

# 运行部署（交互式）
./setup.sh

# 或快速部署（使用默认配置）
./setup.sh --quick
```

### 4. 手动部署（可选）

```bash
# 构建并启动所有服务
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 5. 初始化数据库

```bash
# 进入后端容器执行数据库迁移
docker compose exec backend npx prisma migrate deploy
```

---

## Nginx 配置

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
sudo apt install -y nginx

# CentOS/Rocky Linux
sudo dnf install -y nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 2. 创建站点配置

```bash
sudo vim /etc/nginx/sites-available/gemini-web
```

**配置内容：**

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书路径（稍后配置）
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 日志
    access_log /var/log/nginx/gemini-web.access.log;
    error_log /var/log/nginx/gemini-web.error.log;

    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:30000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:31001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;

        # 流式响应支持
        proxy_buffering off;
        chunked_transfer_encoding on;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://127.0.0.1:31001/health;
    }
}
```

### 3. 启用站点

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/gemini-web /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

---

## SSL 证书

### 使用 Let's Encrypt（免费）

```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 申请证书（会自动配置 Nginx）
sudo certbot --nginx -d your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

### 证书自动续期

```bash
# 创建续期定时任务
sudo crontab -e

# 添加以下内容（每天凌晨 3 点检查续期）
0 3 * * * certbot renew --quiet && systemctl reload nginx
```

---

## 防火墙配置

### UFW（Ubuntu/Debian）

```bash
# 启用 UFW
sudo ufw enable

# 允许 SSH
sudo ufw allow 22/tcp

# 允许 HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 可选：允许直接访问应用端口（调试用）
# sudo ufw allow 30000/tcp  # 前端
# sudo ufw allow 31001/tcp  # 后端

# 查看状态
sudo ufw status
```

### Firewalld（CentOS/Rocky Linux）

```bash
# 启动 Firewalld
sudo systemctl start firewalld
sudo systemctl enable firewalld

# 允许 SSH
sudo firewall-cmd --permanent --add-service=ssh

# 允许 HTTP/HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# 重载规则
sudo firewall-cmd --reload

# 查看状态
sudo firewall-cmd --list-all
```

---

## 运维管理

### 服务管理命令

```bash
# 进入项目目录
cd /opt/Gemini-Web

# 启动服务
./scripts/deploy.sh start

# 停止服务
./scripts/deploy.sh stop

# 重启服务
./scripts/deploy.sh restart

# 查看状态
./scripts/deploy.sh status

# 查看日志
./scripts/deploy.sh logs

# 健康检查
./scripts/deploy.sh health
```

### Docker 管理命令

```bash
# 查看所有容器
docker ps -a

# 查看资源使用
docker stats

# 清理无用镜像
docker system prune -a

# 查看磁盘使用
docker system df
```

### 数据库管理

```bash
# 进入数据库容器
docker compose exec postgres psql -U gemini -d gemini_web

# 备份数据库
docker compose exec postgres pg_dump -U gemini gemini_web > backup_$(date +%Y%m%d).sql

# 恢复数据库
cat backup.sql | docker compose exec -T postgres psql -U gemini -d gemini_web
```

### 日志管理

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# 限制日志行数
docker compose logs --tail=100 backend

# Nginx 日志
sudo tail -f /var/log/nginx/gemini-web.access.log
sudo tail -f /var/log/nginx/gemini-web.error.log
```

---

## 故障排查

### 常见问题

#### 1. 容器启动失败

```bash
# 查看容器日志
docker compose logs backend

# 检查端口占用
sudo netstat -tlnp | grep -E '30000|31001|35432|36379'

# 重新构建镜像
docker compose build --no-cache
docker compose up -d
```

#### 2. 数据库连接失败

```bash
# 检查 PostgreSQL 容器状态
docker compose ps postgres

# 测试数据库连接
docker compose exec postgres pg_isready -U gemini

# 检查数据库日志
docker compose logs postgres
```

#### 3. Redis 连接失败

```bash
# 检查 Redis 容器状态
docker compose ps redis

# 测试 Redis 连接
docker compose exec redis redis-cli -a $REDIS_PASSWORD ping

# 检查 Redis 日志
docker compose logs redis
```

#### 4. Nginx 502 Bad Gateway

```bash
# 检查后端是否运行
curl http://127.0.0.1:31001/health

# 检查 Nginx 配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/gemini-web.error.log
```

#### 5. SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 强制续期
sudo certbot renew --force-renewal

# 验证 SSL 配置
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

### 性能优化

#### 1. Docker 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

#### 2. Nginx 优化

```nginx
# 在 /etc/nginx/nginx.conf 中调整
worker_processes auto;
worker_connections 4096;

# 开启 Gzip
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

---

## 更新部署

```bash
cd /opt/Gemini-Web

# 拉取最新代码
git pull origin main

# 重新构建并部署
docker compose down
docker compose build --no-cache
docker compose up -d

# 执行数据库迁移（如有）
docker compose exec backend npx prisma migrate deploy
```

---

## 监控建议

### 推荐工具

1. **Portainer** - Docker 可视化管理
2. **Prometheus + Grafana** - 监控和告警
3. **Uptime Kuma** - 服务可用性监控

### 安装 Portainer（可选）

```bash
docker run -d \
  --name portainer \
  --restart=always \
  -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

访问 `http://your-server-ip:9000` 进行管理。

