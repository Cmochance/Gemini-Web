#!/bin/bash

# ==========================================
# Gemini Web - Docker 部署脚本
# Docker Deployment Script
# ==========================================

set -e

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 颜色定义 Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查 Docker
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装 / Docker not installed"
        exit 1
    fi
    
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装 / Docker Compose not installed"
        exit 1
    fi
    
    print_success "Docker 环境检查通过 / Docker check passed"
}

# 检查环境变量文件
check_env() {
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，从模板创建..."
        print_warning ".env file not found, creating from template..."
        cp env.example .env
        print_warning "请编辑 .env 文件后重新运行 / Please edit .env and run again"
        exit 1
    fi
    print_success "环境变量检查通过 / Environment check passed"
}

# Docker Compose 命令
compose_cmd() {
    if docker compose version &> /dev/null; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

# 启动服务
start() {
    print_info "启动所有服务 / Starting all services..."
    compose_cmd up -d --build
    print_success "服务启动完成 / Services started"
    health_check
    show_urls
}

# 停止服务
stop() {
    print_info "停止所有服务 / Stopping all services..."
    compose_cmd down
    print_success "服务已停止 / Services stopped"
}

# 重启服务
restart() {
    stop
    start
}

# 查看日志
logs() {
    compose_cmd logs -f "$@"
}

# 查看状态
status() {
    print_info "服务状态 / Service Status:"
    compose_cmd ps
}

# 健康检查
health_check() {
    print_info "执行健康检查 / Running health check..."
    sleep 10
    
    # 检查后端
    if curl -s http://localhost:31001/health | grep -q "ok"; then
        print_success "后端服务正常 / Backend OK"
    else
        print_warning "后端服务异常 / Backend not ready"
    fi
    
    # 检查前端
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 | grep -q "200\|304"; then
        print_success "前端服务正常 / Frontend OK"
    else
        print_warning "前端服务异常 / Frontend not ready"
    fi
}

# 数据库迁移
migrate() {
    print_info "执行数据库迁移 / Running database migration..."
    compose_cmd exec backend npx prisma migrate deploy
    print_success "迁移完成 / Migration completed"
}

# 显示访问地址
show_urls() {
    echo ""
    echo "=========================================="
    echo "  服务访问地址 / Service URLs"
    echo "=========================================="
    echo ""
    echo "  Frontend:     http://localhost:30000"
    echo "  Backend API:  http://localhost:31001"
    echo "  Health Check: http://localhost:31001/health"
    echo ""
    echo "=========================================="
}

# 显示帮助
show_help() {
    echo "Gemini Web Docker 部署脚本 / Deployment Script"
    echo ""
    echo "用法 Usage: ./scripts/deploy.sh [command]"
    echo ""
    echo "命令 Commands:"
    echo "  start       启动所有服务 / Start all services"
    echo "  stop        停止所有服务 / Stop all services"
    echo "  restart     重启所有服务 / Restart all services"
    echo "  status      查看服务状态 / View service status"
    echo "  logs        查看服务日志 / View service logs"
    echo "  migrate     数据库迁移 / Database migration"
    echo "  health      健康检查 / Health check"
    echo "  setup       运行一键配置工具 / Run setup wizard"
    echo "  help        显示帮助 / Show help"
    echo ""
    echo "端口 Ports:"
    echo "  Frontend:   30000"
    echo "  Backend:    31001"
    echo "  PostgreSQL: 35432"
    echo "  Redis:      36379"
    echo ""
    echo "首次部署请运行: ./scripts/setup.sh"
}

# 主函数
main() {
    case "${1:-help}" in
        start)
            check_docker
            check_env
            start
            ;;
        stop)
            stop
            ;;
        restart)
            check_docker
            check_env
            restart
            ;;
        status)
            status
            ;;
        logs)
            shift
            logs "$@"
            ;;
        migrate)
            migrate
            ;;
        health)
            health_check
            ;;
        setup)
            if [ -f "./scripts/setup.sh" ]; then
                chmod +x ./scripts/setup.sh
                ./scripts/setup.sh
            else
                print_error "setup.sh 不存在"
                exit 1
            fi
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令 / Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

