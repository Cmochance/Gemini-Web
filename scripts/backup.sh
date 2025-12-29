#!/bin/bash

# ==========================================
# Gemini Web - 数据备份脚本
# Data Backup Script
# ==========================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# 配置
BACKUP_DIR="${BACKUP_DIR:-/opt/backups/gemini-web}"
KEEP_DAYS="${KEEP_DAYS:-7}"
DATE=$(date +%Y%m%d_%H%M%S)

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
print_error() { echo -e "${RED}[✗]${NC} $1"; }

# 切换到项目目录
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)

# 创建备份目录
mkdir -p "$BACKUP_DIR"

# 备份数据库
backup_database() {
    print_info "备份数据库..."
    
    DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"
    
    if docker compose exec -T postgres pg_dump -U gemini gemini_web > "$DB_BACKUP_FILE" 2>/dev/null; then
        gzip "$DB_BACKUP_FILE"
        print_success "数据库已备份: ${DB_BACKUP_FILE}.gz"
    else
        print_error "数据库备份失败"
        return 1
    fi
}

# 备份 Redis
backup_redis() {
    print_info "备份 Redis..."
    
    REDIS_BACKUP_FILE="$BACKUP_DIR/redis_backup_$DATE.rdb"
    
    if docker compose exec -T redis redis-cli -a "${REDIS_PASSWORD:-gemini_redis_2024}" BGSAVE &>/dev/null; then
        sleep 2
        docker cp gemini-redis:/data/dump.rdb "$REDIS_BACKUP_FILE" 2>/dev/null || true
        if [ -f "$REDIS_BACKUP_FILE" ]; then
            print_success "Redis 已备份: $REDIS_BACKUP_FILE"
        else
            print_warning "Redis 备份跳过（可能没有数据）"
        fi
    fi
}

# 备份配置文件
backup_configs() {
    print_info "备份配置文件..."
    
    CONFIG_BACKUP_FILE="$BACKUP_DIR/config_backup_$DATE.tar.gz"
    
    tar -czf "$CONFIG_BACKUP_FILE" \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='dist' \
        -C "$PROJECT_DIR" \
        .env env.example docker-compose.yml docker-compose.dev.yml 2>/dev/null || true
    
    print_success "配置文件已备份: $CONFIG_BACKUP_FILE"
}

# 清理旧备份
cleanup_old_backups() {
    print_info "清理 ${KEEP_DAYS} 天前的备份..."
    
    find "$BACKUP_DIR" -type f -mtime +$KEEP_DAYS -delete 2>/dev/null || true
    
    print_success "旧备份清理完成"
}

# 显示备份列表
list_backups() {
    echo ""
    echo "备份文件列表 ($BACKUP_DIR):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ls -lh "$BACKUP_DIR" 2>/dev/null || echo "暂无备份"
    echo ""
}

# 恢复数据库
restore_database() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo "用法: $0 restore <backup_file.sql.gz>"
        list_backups
        exit 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        # 尝试在备份目录中查找
        if [ -f "$BACKUP_DIR/$backup_file" ]; then
            backup_file="$BACKUP_DIR/$backup_file"
        else
            print_error "备份文件不存在: $backup_file"
            exit 1
        fi
    fi
    
    print_warning "即将恢复数据库，这将覆盖现有数据！"
    read -p "确认继续? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        print_info "已取消"
        exit 0
    fi
    
    print_info "恢复数据库..."
    
    if [[ "$backup_file" == *.gz ]]; then
        gunzip -c "$backup_file" | docker compose exec -T postgres psql -U gemini -d gemini_web
    else
        cat "$backup_file" | docker compose exec -T postgres psql -U gemini -d gemini_web
    fi
    
    print_success "数据库恢复完成"
}

# 显示帮助
show_help() {
    echo "Gemini Web 数据备份脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  backup    执行完整备份（数据库 + Redis + 配置）"
    echo "  db        仅备份数据库"
    echo "  redis     仅备份 Redis"
    echo "  config    仅备份配置文件"
    echo "  list      列出所有备份"
    echo "  restore   恢复数据库 (需指定备份文件)"
    echo "  cleanup   清理旧备份"
    echo "  help      显示帮助"
    echo ""
    echo "环境变量:"
    echo "  BACKUP_DIR  备份目录 (默认: /opt/backups/gemini-web)"
    echo "  KEEP_DAYS   保留天数 (默认: 7)"
    echo ""
    echo "示例:"
    echo "  $0 backup                    # 完整备份"
    echo "  $0 restore db_backup_xxx.sql.gz  # 恢复数据库"
    echo ""
}

# 主函数
main() {
    case "${1:-backup}" in
        backup)
            backup_database
            backup_redis
            backup_configs
            cleanup_old_backups
            list_backups
            ;;
        db)
            backup_database
            ;;
        redis)
            backup_redis
            ;;
        config)
            backup_configs
            ;;
        list)
            list_backups
            ;;
        restore)
            restore_database "$2"
            ;;
        cleanup)
            cleanup_old_backups
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"

