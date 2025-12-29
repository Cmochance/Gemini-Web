#!/bin/bash

# ==========================================
# Gemini Web - 一键配置部署工具
# One-Click Setup & Deployment Tool
# ==========================================

set -e

# ========== 颜色定义 ==========
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# ========== 工具函数 ==========
print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🚀 Gemini Web 一键部署工具                    ║"
    echo "║                 One-Click Setup Tool                      ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${WHITE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }
print_input() { echo -e "${PURPLE}[?]${NC} $1"; }

# 读取用户输入（带默认值）
read_input() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    local is_password="$4"
    
    if [ "$is_password" = "true" ]; then
        echo -ne "${PURPLE}[?]${NC} ${prompt} [默认: ******]: "
        read -s input
        echo ""
    else
        echo -ne "${PURPLE}[?]${NC} ${prompt} [默认: ${default}]: "
        read input
    fi
    
    if [ -z "$input" ]; then
        eval "$var_name='$default'"
    else
        eval "$var_name='$input'"
    fi
}

# 生成随机密码
generate_password() {
    local length=${1:-16}
    cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w $length | head -n 1
}

# 生成随机 JWT Secret
generate_jwt_secret() {
    cat /dev/urandom | tr -dc 'a-zA-Z0-9!@#$%^&*()_+' | fold -w 64 | head -n 1
}

# ========== 检查函数 ==========
check_os() {
    print_step "检查操作系统 / Checking OS"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
        print_success "操作系统: Linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        print_success "操作系统: macOS"
    else
        print_warning "操作系统: $OSTYPE (可能不完全支持)"
        OS="other"
    fi
}

check_docker() {
    print_step "检查 Docker 环境 / Checking Docker"
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装"
        echo ""
        echo "请先安装 Docker："
        echo "  Linux:  curl -fsSL https://get.docker.com | sh"
        echo "  macOS:  brew install --cask docker"
        echo ""
        exit 1
    fi
    print_success "Docker 已安装: $(docker --version)"
    
    # 检查 Docker 是否运行
    if ! docker info &> /dev/null; then
        print_error "Docker 服务未运行，请先启动 Docker"
        exit 1
    fi
    print_success "Docker 服务运行中"
    
    # 检查 Docker Compose
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
        print_success "Docker Compose 已安装 (V2)"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
        print_success "Docker Compose 已安装 (V1)"
    else
        print_error "Docker Compose 未安装"
        exit 1
    fi
}

check_ports() {
    print_step "检查端口占用 / Checking Ports"
    
    local ports=(30000 31001 35432 36379)
    local port_names=("Frontend" "Backend" "PostgreSQL" "Redis")
    local all_free=true
    
    for i in "${!ports[@]}"; do
        local port=${ports[$i]}
        local name=${port_names[$i]}
        
        if lsof -i :$port &> /dev/null || netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_warning "端口 $port ($name) 已被占用"
            all_free=false
        else
            print_success "端口 $port ($name) 可用"
        fi
    done
    
    if [ "$all_free" = false ]; then
        echo ""
        read -p "部分端口被占用，是否继续? (y/N): " continue_setup
        if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
            print_info "已取消安装"
            exit 0
        fi
    fi
}

# ========== 配置函数 ==========
configure_env() {
    print_step "配置环境变量 / Configure Environment"
    
    echo -e "${CYAN}请按提示输入配置信息，直接回车使用默认值${NC}\n"
    
    # 数据库配置
    echo -e "${WHITE}【数据库配置】${NC}"
    read_input "数据库用户名" "gemini" DB_USER
    DB_PASSWORD_DEFAULT=$(generate_password 16)
    read_input "数据库密码" "$DB_PASSWORD_DEFAULT" DB_PASSWORD "true"
    read_input "数据库名称" "gemini_web" DB_NAME
    
    echo ""
    
    # Redis 配置
    echo -e "${WHITE}【Redis 配置】${NC}"
    REDIS_PASSWORD_DEFAULT=$(generate_password 16)
    read_input "Redis 密码" "$REDIS_PASSWORD_DEFAULT" REDIS_PASSWORD "true"
    
    echo ""
    
    # JWT 配置
    echo -e "${WHITE}【JWT 配置】${NC}"
    JWT_SECRET_DEFAULT=$(generate_jwt_secret)
    read_input "JWT 密钥 (建议使用默认随机值)" "$JWT_SECRET_DEFAULT" JWT_SECRET "true"
    read_input "JWT 过期时间" "7d" JWT_EXPIRES_IN
    
    echo ""
    
    # AI API 配置
    echo -e "${WHITE}【AI API 配置】${NC}"
    read_input "OpenAI API Key" "sk-your-api-key" OPENAI_API_KEY "true"
    read_input "API Base URL (第三方API填写对应地址)" "https://api.openai.com/v1" OPENAI_BASE_URL
    
    echo ""
    
    # 邮件配置
    echo -e "${WHITE}【邮件服务配置】(可选，用于发送验证码)${NC}"
    read_input "SMTP 服务器" "smtp.gmail.com" SMTP_HOST
    read_input "SMTP 端口" "587" SMTP_PORT
    read_input "SMTP 用户名/邮箱" "" SMTP_USER
    read_input "SMTP 密码/应用密码" "" SMTP_PASS "true"
    read_input "发件人地址" "noreply@gemini-web.com" SMTP_FROM
    
    echo ""
    
    # 积分配置
    echo -e "${WHITE}【积分系统配置】${NC}"
    read_input "注册赠送积分" "10" REGISTER_GIFT_INTEGRAL
    read_input "邀请奖励积分" "50" INVITE_REWARD_INTEGRAL
    read_input "对话消耗积分" "1" CHAT_CONSUME_INTEGRAL
    read_input "图片生成消耗积分" "8" IMAGE_CONSUME_INTEGRAL
    
    echo ""
    
    # 域名配置
    echo -e "${WHITE}【访问配置】${NC}"
    read_input "前端访问地址 (用于后端CORS)" "http://localhost:30000" FRONTEND_URL
}

generate_env_file() {
    print_step "生成配置文件 / Generating Config Files"
    
    # 生成根目录 .env
    cat > .env << EOF
# ==========================================
# Gemini Web - 环境变量配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# ==========================================

# ===================
# 数据库配置 Database
# ===================
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# ===================
# Redis 配置
# ===================
REDIS_PASSWORD=${REDIS_PASSWORD}

# ===================
# JWT 配置
# ===================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

# ===================
# 前端配置 Frontend
# ===================
FRONTEND_URL=${FRONTEND_URL}

# ===================
# AI API 配置
# ===================
OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_BASE_URL=${OPENAI_BASE_URL}

# Midjourney (可选)
MIDJOURNEY_API_KEY=
MIDJOURNEY_BASE_URL=

# ===================
# 邮件服务配置 SMTP
# ===================
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=false
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

# ===================
# 积分配置 Integral
# ===================
REGISTER_GIFT_INTEGRAL=${REGISTER_GIFT_INTEGRAL}
INVITE_REWARD_INTEGRAL=${INVITE_REWARD_INTEGRAL}
CHAT_CONSUME_INTEGRAL=${CHAT_CONSUME_INTEGRAL}
IMAGE_CONSUME_INTEGRAL=${IMAGE_CONSUME_INTEGRAL}

# ===================
# 支付宝配置 (可选)
# ===================
ALIPAY_APP_ID=
ALIPAY_PRIVATE_KEY=
ALIPAY_PUBLIC_KEY=
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
ALIPAY_NOTIFY_URL=
ALIPAY_RETURN_URL=
EOF

    print_success "已生成 .env 配置文件"
    
    # 同步到 backend 目录
    if [ -d "backend" ]; then
        cat > backend/.env << EOF
# ==========================================
# Backend - 环境变量配置
# 生成时间: $(date '+%Y-%m-%d %H:%M:%S')
# ==========================================

PORT=31001
NODE_ENV=production
FRONTEND_URL=${FRONTEND_URL}

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:35432/${DB_NAME}?schema=public

REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:36379

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=${JWT_EXPIRES_IN}

OPENAI_API_KEY=${OPENAI_API_KEY}
OPENAI_BASE_URL=${OPENAI_BASE_URL}

MIDJOURNEY_API_KEY=
MIDJOURNEY_BASE_URL=

SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=false
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}

REGISTER_GIFT_INTEGRAL=${REGISTER_GIFT_INTEGRAL}
INVITE_REWARD_INTEGRAL=${INVITE_REWARD_INTEGRAL}
CHAT_CONSUME_INTEGRAL=${CHAT_CONSUME_INTEGRAL}
IMAGE_CONSUME_INTEGRAL=${IMAGE_CONSUME_INTEGRAL}
EOF
        print_success "已生成 backend/.env 配置文件"
    fi
}

# ========== 部署函数 ==========
build_and_start() {
    print_step "构建并启动服务 / Building & Starting Services"
    
    print_info "拉取基础镜像..."
    $COMPOSE_CMD pull postgres redis 2>/dev/null || true
    
    print_info "构建应用镜像..."
    $COMPOSE_CMD build --no-cache
    
    print_info "启动所有服务..."
    $COMPOSE_CMD up -d
    
    print_success "所有服务已启动"
}

wait_for_services() {
    print_step "等待服务就绪 / Waiting for Services"
    
    local max_attempts=30
    local attempt=1
    
    echo -ne "等待 PostgreSQL"
    while [ $attempt -le $max_attempts ]; do
        if $COMPOSE_CMD exec -T postgres pg_isready -U ${DB_USER} &> /dev/null; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e " ${RED}✗${NC}"
        print_error "PostgreSQL 启动超时"
        return 1
    fi
    
    attempt=1
    echo -ne "等待 Redis"
    while [ $attempt -le $max_attempts ]; do
        if $COMPOSE_CMD exec -T redis redis-cli -a ${REDIS_PASSWORD} ping &> /dev/null; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e " ${RED}✗${NC}"
        print_error "Redis 启动超时"
        return 1
    fi
    
    attempt=1
    echo -ne "等待 Backend"
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:31001/health | grep -q "ok"; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 3
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e " ${RED}✗${NC}"
        print_warning "Backend 可能仍在启动中"
    fi
    
    attempt=1
    echo -ne "等待 Frontend"
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:30000 | grep -qE "200|304"; then
            echo -e " ${GREEN}✓${NC}"
            break
        fi
        echo -n "."
        sleep 3
        ((attempt++))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e " ${RED}✗${NC}"
        print_warning "Frontend 可能仍在启动中"
    fi
}

run_migrations() {
    print_step "初始化数据库 / Initializing Database"
    
    print_info "执行数据库迁移..."
    sleep 5
    
    if $COMPOSE_CMD exec -T backend npx prisma migrate deploy 2>/dev/null; then
        print_success "数据库迁移完成"
    else
        print_warning "数据库迁移跳过（可能已完成或需要手动执行）"
    fi
}

show_result() {
    print_step "部署完成 / Deployment Complete"
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🎉 部署成功 / Deployment Success!             ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    echo -e "${WHITE}服务访问地址 / Service URLs:${NC}"
    echo ""
    echo -e "  ${CYAN}Frontend:${NC}     http://localhost:30000"
    echo -e "  ${CYAN}Backend API:${NC}  http://localhost:31001"
    echo -e "  ${CYAN}Health Check:${NC} http://localhost:31001/health"
    echo ""
    echo -e "${WHITE}数据库连接 / Database Connection:${NC}"
    echo ""
    echo -e "  ${CYAN}PostgreSQL:${NC}   localhost:35432"
    echo -e "  ${CYAN}Redis:${NC}        localhost:36379"
    echo ""
    echo -e "${WHITE}常用命令 / Common Commands:${NC}"
    echo ""
    echo -e "  ${YELLOW}./scripts/deploy.sh status${NC}   - 查看服务状态"
    echo -e "  ${YELLOW}./scripts/deploy.sh logs${NC}     - 查看服务日志"
    echo -e "  ${YELLOW}./scripts/deploy.sh restart${NC}  - 重启所有服务"
    echo -e "  ${YELLOW}./scripts/deploy.sh stop${NC}     - 停止所有服务"
    echo ""
    echo -e "${WHITE}配置文件 / Config Files:${NC}"
    echo ""
    echo -e "  ${CYAN}.env${NC}          - 主配置文件"
    echo -e "  ${CYAN}backend/.env${NC}  - 后端配置文件"
    echo ""
    
    # 保存配置信息到文件
    cat > .deployment-info << EOF
# Gemini Web 部署信息
# 部署时间: $(date '+%Y-%m-%d %H:%M:%S')

Frontend URL: http://localhost:30000
Backend URL:  http://localhost:31001

PostgreSQL:
  Host: localhost
  Port: 35432
  User: ${DB_USER}
  Database: ${DB_NAME}

Redis:
  Host: localhost
  Port: 36379
EOF
    
    print_info "部署信息已保存到 .deployment-info"
}

# ========== 快速部署（使用默认配置）==========
quick_deploy() {
    print_step "快速部署模式 / Quick Deploy Mode"
    
    # 使用随机生成的安全密码
    DB_USER="gemini"
    DB_PASSWORD=$(generate_password 16)
    DB_NAME="gemini_web"
    REDIS_PASSWORD=$(generate_password 16)
    JWT_SECRET=$(generate_jwt_secret)
    JWT_EXPIRES_IN="7d"
    OPENAI_API_KEY="sk-your-api-key"
    OPENAI_BASE_URL="https://api.openai.com/v1"
    SMTP_HOST="smtp.gmail.com"
    SMTP_PORT="587"
    SMTP_USER=""
    SMTP_PASS=""
    SMTP_FROM="noreply@gemini-web.com"
    REGISTER_GIFT_INTEGRAL="10"
    INVITE_REWARD_INTEGRAL="50"
    CHAT_CONSUME_INTEGRAL="1"
    IMAGE_CONSUME_INTEGRAL="8"
    FRONTEND_URL="http://localhost:30000"
    
    print_warning "使用默认配置，密码已随机生成"
    print_warning "请在部署后修改 .env 文件中的 OPENAI_API_KEY"
}

# ========== 主菜单 ==========
show_menu() {
    echo ""
    echo -e "${WHITE}请选择操作 / Select Operation:${NC}"
    echo ""
    echo -e "  ${CYAN}1)${NC} 完整配置部署 (交互式配置所有选项)"
    echo -e "  ${CYAN}2)${NC} 快速部署 (使用默认配置，自动生成密码)"
    echo -e "  ${CYAN}3)${NC} 仅生成配置文件 (不启动服务)"
    echo -e "  ${CYAN}4)${NC} 仅检查环境"
    echo -e "  ${CYAN}5)${NC} 退出"
    echo ""
    read -p "请输入选项 [1-5]: " choice
}

# ========== 主函数 ==========
main() {
    # 切换到项目根目录
    cd "$(dirname "$0")/.."
    
    print_banner
    
    # 命令行参数处理
    case "${1:-}" in
        --quick|-q)
            check_os
            check_docker
            check_ports
            quick_deploy
            generate_env_file
            build_and_start
            wait_for_services
            run_migrations
            show_result
            exit 0
            ;;
        --config-only|-c)
            check_os
            configure_env
            generate_env_file
            print_success "配置文件生成完成！"
            exit 0
            ;;
        --help|-h)
            echo "用法: ./scripts/setup.sh [选项]"
            echo ""
            echo "选项:"
            echo "  --quick, -q       快速部署（使用默认配置）"
            echo "  --config-only, -c 仅生成配置文件"
            echo "  --help, -h        显示帮助信息"
            echo ""
            exit 0
            ;;
    esac
    
    # 交互式菜单
    show_menu
    
    case $choice in
        1)
            check_os
            check_docker
            check_ports
            configure_env
            generate_env_file
            build_and_start
            wait_for_services
            run_migrations
            show_result
            ;;
        2)
            check_os
            check_docker
            check_ports
            quick_deploy
            generate_env_file
            build_and_start
            wait_for_services
            run_migrations
            show_result
            ;;
        3)
            check_os
            configure_env
            generate_env_file
            print_success "配置文件生成完成！运行 ./scripts/deploy.sh start 启动服务"
            ;;
        4)
            check_os
            check_docker
            check_ports
            print_success "环境检查完成！"
            ;;
        5)
            print_info "已退出"
            exit 0
            ;;
        *)
            print_error "无效选项"
            exit 1
            ;;
    esac
}

main "$@"

