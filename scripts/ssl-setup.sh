#!/bin/bash

# ==========================================
# Gemini Web - SSL 证书配置脚本
# SSL Certificate Setup Script
# ==========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# 检查 Certbot
check_certbot() {
    if ! command -v certbot &> /dev/null; then
        print_error "Certbot 未安装"
        echo ""
        echo "请先安装 Certbot:"
        echo "  Ubuntu/Debian: sudo apt install -y certbot python3-certbot-nginx"
        echo "  CentOS/Rocky:  sudo dnf install -y certbot python3-certbot-nginx"
        exit 1
    fi
}

# 获取域名
get_domain() {
    if [ -n "$1" ]; then
        DOMAIN="$1"
    else
        read -p "请输入您的域名 (例如: example.com): " DOMAIN
    fi
    
    if [ -z "$DOMAIN" ]; then
        print_error "域名不能为空"
        exit 1
    fi
    
    print_info "域名: $DOMAIN"
}

# 检查 DNS 解析
check_dns() {
    print_info "检查 DNS 解析..."
    
    SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s ipinfo.io/ip 2>/dev/null)
    DOMAIN_IP=$(dig +short $DOMAIN 2>/dev/null | head -1)
    
    if [ -z "$DOMAIN_IP" ]; then
        print_warning "无法解析域名 $DOMAIN"
        print_warning "请确保域名 DNS 已正确配置指向服务器 IP: $SERVER_IP"
        read -p "是否继续? (y/N): " continue_setup
        if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
            exit 0
        fi
    elif [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
        print_warning "域名解析 IP ($DOMAIN_IP) 与服务器 IP ($SERVER_IP) 不匹配"
        read -p "是否继续? (y/N): " continue_setup
        if [[ ! "$continue_setup" =~ ^[Yy]$ ]]; then
            exit 0
        fi
    else
        print_success "DNS 解析正确: $DOMAIN -> $SERVER_IP"
    fi
}

# 配置 Nginx
configure_nginx() {
    print_info "配置 Nginx..."
    
    NGINX_CONF="/etc/nginx/sites-available/gemini-web"
    
    # 检查配置文件是否存在
    if [ -f "$NGINX_CONF" ]; then
        print_info "更新现有 Nginx 配置..."
        sudo sed -i "s/your-domain.com/$DOMAIN/g" "$NGINX_CONF"
    else
        print_info "创建 Nginx 配置..."
        
        # 先创建基础 HTTP 配置（用于 Certbot 验证）
        sudo tee "$NGINX_CONF" > /dev/null << EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://127.0.0.1:30000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:31001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_buffering off;
    }
}
EOF
    fi
    
    # 创建验证目录
    sudo mkdir -p /var/www/certbot
    
    # 启用站点
    if [ -d /etc/nginx/sites-enabled ]; then
        sudo ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/gemini-web
    fi
    
    # 测试配置
    sudo nginx -t
    sudo systemctl reload nginx
    
    print_success "Nginx 配置完成"
}

# 申请证书
request_certificate() {
    print_info "申请 SSL 证书..."
    
    # 获取邮箱
    read -p "请输入邮箱 (用于证书到期提醒): " EMAIL
    
    if [ -z "$EMAIL" ]; then
        EMAIL_FLAG="--register-unsafely-without-email"
    else
        EMAIL_FLAG="-m $EMAIL"
    fi
    
    # 申请证书
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN $EMAIL_FLAG --agree-tos --non-interactive --redirect
    
    print_success "SSL 证书申请成功"
}

# 设置自动续期
setup_auto_renewal() {
    print_info "配置证书自动续期..."
    
    # 添加 cron 任务
    CRON_JOB="0 3 * * * certbot renew --quiet && systemctl reload nginx"
    
    # 检查是否已存在
    if sudo crontab -l 2>/dev/null | grep -q "certbot renew"; then
        print_warning "自动续期任务已存在"
    else
        (sudo crontab -l 2>/dev/null; echo "$CRON_JOB") | sudo crontab -
        print_success "自动续期已配置 (每天凌晨 3 点检查)"
    fi
}

# 验证证书
verify_certificate() {
    print_info "验证 SSL 证书..."
    
    if curl -sI "https://$DOMAIN" | grep -q "200\|301\|302"; then
        print_success "HTTPS 访问正常"
    else
        print_warning "HTTPS 访问可能存在问题，请手动检查"
    fi
    
    # 显示证书信息
    echo ""
    echo "证书信息:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    sudo certbot certificates 2>/dev/null | grep -A 5 "$DOMAIN" || echo "未找到证书信息"
}

# 显示完成信息
show_completion() {
    echo ""
    echo -e "${GREEN}"
    echo "╔═══════════════════════════════════════════════════════════╗"
    echo "║                                                           ║"
    echo "║              🔒 SSL 证书配置完成！                         ║"
    echo "║                                                           ║"
    echo "╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${WHITE}访问地址：${NC}"
    echo -e "  ${CYAN}https://$DOMAIN${NC}"
    echo ""
    echo -e "${WHITE}证书管理命令：${NC}"
    echo "  查看证书: sudo certbot certificates"
    echo "  测试续期: sudo certbot renew --dry-run"
    echo "  强制续期: sudo certbot renew --force-renewal"
    echo ""
}

# 主函数
main() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}          Gemini Web SSL 证书配置脚本${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    check_certbot
    get_domain "$1"
    check_dns
    configure_nginx
    request_certificate
    setup_auto_renewal
    verify_certificate
    show_completion
}

main "$@"

