#!/bin/bash

# ==========================================
# Gemini Web - 健康检查脚本
# Health Check Script
# ==========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
FRONTEND_URL="${FRONTEND_URL:-http://localhost:30000}"
BACKEND_URL="${BACKEND_URL:-http://localhost:31001}"
TIMEOUT=5

print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Gemini Web 健康检查 / Health Check"
    echo "  $(date '+%Y-%m-%d %H:%M:%S')"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

check_service() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    printf "%-20s" "$name"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [[ "$response" =~ ^($expected)$ ]]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response)"
        return 1
    fi
}

check_container() {
    local name="$1"
    local container="$2"
    
    printf "%-20s" "$name"
    
    if docker ps --format '{{.Names}}' | grep -q "^$container$"; then
        status=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "running")
        if [[ "$status" == "healthy" ]] || [[ "$status" == "running" ]]; then
            echo -e "${GREEN}✓ Running${NC} ($status)"
            return 0
        else
            echo -e "${YELLOW}! Warning${NC} ($status)"
            return 1
        fi
    else
        echo -e "${RED}✗ Not Running${NC}"
        return 1
    fi
}

check_disk() {
    printf "%-20s" "磁盘空间"
    
    usage=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
    
    if [ "$usage" -lt 80 ]; then
        echo -e "${GREEN}✓ OK${NC} (${usage}% 已使用)"
        return 0
    elif [ "$usage" -lt 90 ]; then
        echo -e "${YELLOW}! Warning${NC} (${usage}% 已使用)"
        return 1
    else
        echo -e "${RED}✗ Critical${NC} (${usage}% 已使用)"
        return 1
    fi
}

check_memory() {
    printf "%-20s" "内存使用"
    
    if command -v free &> /dev/null; then
        usage=$(free | awk 'NR==2 {printf "%.0f", $3*100/$2}')
        
        if [ "$usage" -lt 80 ]; then
            echo -e "${GREEN}✓ OK${NC} (${usage}% 已使用)"
            return 0
        elif [ "$usage" -lt 90 ]; then
            echo -e "${YELLOW}! Warning${NC} (${usage}% 已使用)"
            return 1
        else
            echo -e "${RED}✗ Critical${NC} (${usage}% 已使用)"
            return 1
        fi
    else
        echo -e "${YELLOW}! Skip${NC} (free 命令不可用)"
        return 0
    fi
}

check_docker_resources() {
    printf "%-20s" "Docker 资源"
    
    if docker info &>/dev/null; then
        containers=$(docker ps -q | wc -l)
        images=$(docker images -q | wc -l)
        echo -e "${GREEN}✓ OK${NC} ($containers 容器, $images 镜像)"
        return 0
    else
        echo -e "${RED}✗ Docker 不可用${NC}"
        return 1
    fi
}

# 主检查
main() {
    print_header
    
    local errors=0
    
    echo "【Docker 容器】"
    check_container "PostgreSQL" "gemini-postgres" || ((errors++))
    check_container "Redis" "gemini-redis" || ((errors++))
    check_container "Backend" "gemini-backend" || ((errors++))
    check_container "Frontend" "gemini-frontend" || ((errors++))
    echo ""
    
    echo "【服务端点】"
    check_service "Frontend" "$FRONTEND_URL" "200|301|302" || ((errors++))
    check_service "Backend API" "$BACKEND_URL/health" "200" || ((errors++))
    check_service "Backend Health" "$BACKEND_URL/health" "200" || ((errors++))
    echo ""
    
    echo "【系统资源】"
    check_disk || ((errors++))
    check_memory || ((errors++))
    check_docker_resources || ((errors++))
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    if [ $errors -eq 0 ]; then
        echo -e "状态: ${GREEN}所有服务正常${NC}"
    else
        echo -e "状态: ${RED}发现 $errors 个问题${NC}"
    fi
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    return $errors
}

main "$@"

