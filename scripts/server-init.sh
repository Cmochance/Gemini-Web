#!/bin/bash

# ==========================================
# Gemini Web - 服务器初始化脚本
# Server Initialization Script
# ==========================================
# 使用方法: curl -fsSL https://raw.githubusercontent.com/your-repo/Gemini-Web/main/scripts/server-init.sh | bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_banner() {
    echo -e "${CYAN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║           🚀 Gemini Web 服务器初始化脚本                    ║"
    echo "║              Server Initialization Script                 ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_step() { echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"; }
print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# 检测操作系统
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
        VERSION=$VERSION_ID
    else
        print_error "无法检测操作系统"
        exit 1
    fi
    print_success "检测到操作系统: $OS $VERSION"
}

# 更新系统
update_system() {
    print_step "更新系统 / Updating System"
    
    case $OS in
        ubuntu|debian)
            sudo apt update && sudo apt upgrade -y
            sudo apt install -y curl wget git vim htop net-tools
            ;;
        centos|rocky|almalinux|rhel)
            sudo dnf update -y
            sudo dnf install -y curl wget git vim htop net-tools
            ;;
        *)
            print_warning "未知的操作系统，跳过系统更新"
            ;;
    esac
    
    print_success "系统更新完成"
}

# 安装 Docker
install_docker() {
    print_step "安装 Docker / Installing Docker"
    
    if command -v docker &> /dev/null; then
        print_success "Docker 已安装: $(docker --version)"
        return
    fi
    
    print_info "正在安装 Docker..."
    curl -fsSL https://get.docker.com | sh
    
    # 启动并设置开机自启
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # 将当前用户加入 docker 组
    sudo usermod -aG docker $USER
    
    print_success "Docker 安装完成"
    print_warning "请重新登录以使 docker 组权限生效"
}

# 安装 Nginx
install_nginx() {
    print_step "安装 Nginx / Installing Nginx"
    
    if command -v nginx &> /dev/null; then
        print_success "Nginx 已安装: $(nginx -v 2>&1)"
        return
    fi
    
    case $OS in
        ubuntu|debian)
            sudo apt install -y nginx
            ;;
        centos|rocky|almalinux|rhel)
            sudo dnf install -y nginx
            ;;
    esac
    
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    print_success "Nginx 安装完成"
}

# 安装 Certbot
install_certbot() {
    print_step "安装 Certbot (SSL) / Installing Certbot"
    
    if command -v certbot &> /dev/null; then
        print_success "Certbot 已安装"
        return
    fi
    
    case $OS in
        ubuntu|debian)
            sudo apt install -y certbot python3-certbot-nginx
            ;;
        centos|rocky|almalinux|rhel)
            sudo dnf install -y certbot python3-certbot-nginx
            ;;
    esac
    
    print_success "Certbot 安装完成"
}

# 配置防火墙
configure_firewall() {
    print_step "配置防火墙 / Configuring Firewall"
    
    case $OS in
        ubuntu|debian)
            if command -v ufw &> /dev/null; then
                sudo ufw allow ssh
                sudo ufw allow http
                sudo ufw allow https
                sudo ufw --force enable
                print_success "UFW 防火墙已配置"
            fi
            ;;
        centos|rocky|almalinux|rhel)
            if systemctl is-active --quiet firewalld; then
                sudo firewall-cmd --permanent --add-service=ssh
                sudo firewall-cmd --permanent --add-service=http
                sudo firewall-cmd --permanent --add-service=https
                sudo firewall-cmd --reload
                print_success "Firewalld 已配置"
            fi
            ;;
    esac
}

# 创建项目目录
create_project_dir() {
    print_step "创建项目目录 / Creating Project Directory"
    
    PROJECT_DIR="/opt/Gemini-Web"
    
    if [ -d "$PROJECT_DIR" ]; then
        print_warning "项目目录已存在: $PROJECT_DIR"
    else
        sudo mkdir -p $PROJECT_DIR
        sudo chown -R $USER:$USER $PROJECT_DIR
        print_success "项目目录已创建: $PROJECT_DIR"
    fi
    
    echo ""
    echo -e "${YELLOW}请将项目代码上传到: $PROJECT_DIR${NC}"
    echo ""
    echo "上传方式："
    echo "  1. Git: cd $PROJECT_DIR && git clone https://github.com/your-repo/Gemini-Web.git ."
    echo "  2. SCP: scp -r Gemini-Web/* user@server:$PROJECT_DIR/"
}

# 显示完成信息
show_completion() {
    print_step "初始化完成 / Initialization Complete"
    
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🎉 服务器初始化完成！                          ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo ""
    echo -e "${WHITE}已安装的组件：${NC}"
    echo "  ✓ Docker $(docker --version 2>/dev/null | cut -d' ' -f3 || echo '(需要重新登录)')"
    echo "  ✓ Nginx $(nginx -v 2>&1 | cut -d'/' -f2)"
    echo "  ✓ Certbot"
    echo "  ✓ 防火墙 (HTTP/HTTPS/SSH)"
    echo ""
    echo -e "${WHITE}下一步操作：${NC}"
    echo ""
    echo "  1. 重新登录使 Docker 权限生效："
    echo -e "     ${YELLOW}exit${NC}"
    echo ""
    echo "  2. 上传项目代码到 /opt/Gemini-Web"
    echo ""
    echo "  3. 运行一键部署："
    echo -e "     ${YELLOW}cd /opt/Gemini-Web && ./setup.sh${NC}"
    echo ""
    echo "  4. 配置域名和 SSL 证书："
    echo -e "     ${YELLOW}sudo certbot --nginx -d your-domain.com${NC}"
    echo ""
}

# 主函数
main() {
    print_banner
    
    # 检查是否为 root
    if [ "$EUID" -eq 0 ]; then
        print_warning "建议使用普通用户运行此脚本（会自动使用 sudo）"
    fi
    
    detect_os
    update_system
    install_docker
    install_nginx
    install_certbot
    configure_firewall
    create_project_dir
    show_completion
}

main "$@"

