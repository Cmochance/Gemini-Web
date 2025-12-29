# 端口映射目录 / Port Mapping Directory

## 📋 端口映射表 / Port Mapping Table

| 服务 Service | 默认端口 Default | 项目端口 Project | 容器端口 Container | 说明 Description |
|--------------|------------------|------------------|-------------------|------------------|
| **Frontend** | 3000 | **30000** | 30000 | 前端 Web 服务 |
| **Backend API** | 3001 | **31001** | 31001 | 后端 API 服务 |
| **PostgreSQL** | 5432 | **35432** | 5432 | 数据库服务 |
| **Redis** | 6379 | **36379** | 6379 | 缓存服务 |

---

## 🌐 服务访问地址 / Service URLs

### 前端 Frontend

```
本地开发 Local:     http://localhost:30000
服务器 Server:      http://your-server-ip:30000
```

### 后端 Backend API

```
本地开发 Local:     http://localhost:31001
服务器 Server:      http://your-server-ip:31001

健康检查 Health:    http://localhost:31001/health
API 基础路径:       http://localhost:31001/api/v1
```

### PostgreSQL 数据库

```
Host: localhost
Port: 35432
User: gemini
Password: (见 .env 配置)
Database: gemini_web

# 连接字符串 Connection String
postgresql://gemini:password@localhost:35432/gemini_web

# psql 命令
psql -h localhost -p 35432 -U gemini -d gemini_web
```

### Redis 缓存

```
Host: localhost
Port: 36379
Password: (见 .env 配置)

# 连接字符串 Connection String
redis://:password@localhost:36379

# redis-cli 命令
redis-cli -h localhost -p 36379 -a password
```

---

## 🚀 Docker 命令 / Docker Commands

### 完整部署 Full Deployment

```bash
# 启动所有服务 Start all services
docker-compose up -d

# 查看日志 View logs
docker-compose logs -f

# 查看状态 View status
docker-compose ps

# 停止服务 Stop services
docker-compose down

# 重新构建 Rebuild
docker-compose up -d --build
```

### 单独部署 Individual Deployment

```bash
# 仅前端 Frontend only
docker-compose up -d frontend

# 仅后端 Backend only
docker-compose up -d backend postgres redis
```

---

## 🔥 防火墙配置 / Firewall Configuration

需要开放的端口 Ports to open:

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 30000/tcp  # Frontend
sudo ufw allow 31001/tcp  # Backend API (可选，如使用反向代理则不需要)

# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-port=30000/tcp
sudo firewall-cmd --permanent --add-port=31001/tcp
sudo firewall-cmd --reload
```

> ⚠️ **安全提示**: 数据库 (35432) 和 Redis (36379) 端口不应对外开放！

---

## 🌐 Nginx 反向代理示例 / Nginx Reverse Proxy Example

```nginx
# 前端服务 Frontend
server {
    listen 80;
    server_name your-domain.com;

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
    }
}

# 后端 API Backend
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:31001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
```

---

## 🔍 端口检查 / Port Check

```bash
# Linux/Mac
lsof -i :30000  # Frontend
lsof -i :31001  # Backend
lsof -i :35432  # PostgreSQL
lsof -i :36379  # Redis

# Windows
netstat -ano | findstr :30000
netstat -ano | findstr :31001
netstat -ano | findstr :35432
netstat -ano | findstr :36379

# Docker
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

---

## 📝 环境变量端口配置 / Environment Port Configuration

### 前端 Frontend (.env)

```bash
# 后端 API 地址 (Docker 内部网络使用服务名)
BACKEND_ENDPOINT=http://backend:31001

# 或使用外部地址
BACKEND_ENDPOINT=http://your-server-ip:31001
```

### 后端 Backend (backend/.env)

```bash
PORT=31001
DATABASE_URL=postgresql://gemini:password@localhost:35432/gemini_web
REDIS_URL=redis://:password@localhost:36379
FRONTEND_URL=http://localhost:30000
```

