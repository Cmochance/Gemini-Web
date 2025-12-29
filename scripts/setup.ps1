# ==========================================
# Gemini Web - Windows 一键配置部署工具
# One-Click Setup & Deployment Tool (Windows)
# ==========================================

# 设置编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

# ========== 颜色函数 ==========
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Print-Banner {
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "║              🚀 Gemini Web 一键部署工具                    ║" -ForegroundColor Cyan
    Write-Host "║                 One-Click Setup Tool                      ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Print-Step($message) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host "  $message" -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
    Write-Host ""
}

function Print-Info($message) { Write-Host "[INFO] $message" -ForegroundColor Blue }
function Print-Success($message) { Write-Host "[✓] $message" -ForegroundColor Green }
function Print-Warning($message) { Write-Host "[!] $message" -ForegroundColor Yellow }
function Print-Error($message) { Write-Host "[✗] $message" -ForegroundColor Red }

# ========== 工具函数 ==========
function Generate-Password($length = 16) {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    $password = ""
    for ($i = 0; $i -lt $length; $i++) {
        $password += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $password
}

function Generate-JwtSecret {
    $chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    $secret = ""
    for ($i = 0; $i -lt 64; $i++) {
        $secret += $chars[(Get-Random -Maximum $chars.Length)]
    }
    return $secret
}

function Read-InputWithDefault($prompt, $default, $isPassword = $false) {
    if ($isPassword) {
        $input = Read-Host -Prompt "[?] $prompt [默认: ******]" -AsSecureString
        if ($input.Length -eq 0) {
            return $default
        }
        $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($input)
        return [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    } else {
        $input = Read-Host -Prompt "[?] $prompt [默认: $default]"
        if ([string]::IsNullOrEmpty($input)) {
            return $default
        }
        return $input
    }
}

# ========== 检查函数 ==========
function Check-Docker {
    Print-Step "检查 Docker 环境 / Checking Docker"
    
    try {
        $dockerVersion = docker --version
        Print-Success "Docker 已安装: $dockerVersion"
    } catch {
        Print-Error "Docker 未安装或未运行"
        Write-Host ""
        Write-Host "请安装 Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
    
    try {
        docker info | Out-Null
        Print-Success "Docker 服务运行中"
    } catch {
        Print-Error "Docker 服务未运行，请启动 Docker Desktop"
        exit 1
    }
    
    try {
        docker compose version | Out-Null
        $script:COMPOSE_CMD = "docker compose"
        Print-Success "Docker Compose 已安装"
    } catch {
        Print-Error "Docker Compose 未安装"
        exit 1
    }
}

function Check-Ports {
    Print-Step "检查端口占用 / Checking Ports"
    
    $ports = @(
        @{Port = 30000; Name = "Frontend"},
        @{Port = 31001; Name = "Backend"},
        @{Port = 35432; Name = "PostgreSQL"},
        @{Port = 36379; Name = "Redis"}
    )
    
    $allFree = $true
    
    foreach ($p in $ports) {
        $connection = Get-NetTCPConnection -LocalPort $p.Port -ErrorAction SilentlyContinue
        if ($connection) {
            Print-Warning "端口 $($p.Port) ($($p.Name)) 已被占用"
            $allFree = $false
        } else {
            Print-Success "端口 $($p.Port) ($($p.Name)) 可用"
        }
    }
    
    if (-not $allFree) {
        $continue = Read-Host "部分端口被占用，是否继续? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Print-Info "已取消安装"
            exit 0
        }
    }
}

# ========== 配置函数 ==========
function Configure-Env {
    Print-Step "配置环境变量 / Configure Environment"
    
    Write-Host "请按提示输入配置信息，直接回车使用默认值" -ForegroundColor Cyan
    Write-Host ""
    
    # 数据库配置
    Write-Host "【数据库配置】" -ForegroundColor White
    $script:DB_USER = Read-InputWithDefault "数据库用户名" "gemini"
    $dbPassDefault = Generate-Password 16
    $script:DB_PASSWORD = Read-InputWithDefault "数据库密码" $dbPassDefault $true
    $script:DB_NAME = Read-InputWithDefault "数据库名称" "gemini_web"
    
    Write-Host ""
    
    # Redis 配置
    Write-Host "【Redis 配置】" -ForegroundColor White
    $redisPassDefault = Generate-Password 16
    $script:REDIS_PASSWORD = Read-InputWithDefault "Redis 密码" $redisPassDefault $true
    
    Write-Host ""
    
    # JWT 配置
    Write-Host "【JWT 配置】" -ForegroundColor White
    $jwtDefault = Generate-JwtSecret
    $script:JWT_SECRET = Read-InputWithDefault "JWT 密钥" $jwtDefault $true
    $script:JWT_EXPIRES_IN = Read-InputWithDefault "JWT 过期时间" "7d"
    
    Write-Host ""
    
    # AI API 配置
    Write-Host "【AI API 配置】" -ForegroundColor White
    $script:OPENAI_API_KEY = Read-InputWithDefault "OpenAI API Key" "sk-your-api-key" $true
    $script:OPENAI_BASE_URL = Read-InputWithDefault "API Base URL" "https://api.openai.com/v1"
    
    Write-Host ""
    
    # 邮件配置
    Write-Host "【邮件服务配置】(可选)" -ForegroundColor White
    $script:SMTP_HOST = Read-InputWithDefault "SMTP 服务器" "smtp.gmail.com"
    $script:SMTP_PORT = Read-InputWithDefault "SMTP 端口" "587"
    $script:SMTP_USER = Read-InputWithDefault "SMTP 用户名" ""
    $script:SMTP_PASS = Read-InputWithDefault "SMTP 密码" "" $true
    $script:SMTP_FROM = Read-InputWithDefault "发件人地址" "noreply@gemini-web.com"
    
    Write-Host ""
    
    # 积分配置
    Write-Host "【积分系统配置】" -ForegroundColor White
    $script:REGISTER_GIFT_INTEGRAL = Read-InputWithDefault "注册赠送积分" "10"
    $script:INVITE_REWARD_INTEGRAL = Read-InputWithDefault "邀请奖励积分" "50"
    $script:CHAT_CONSUME_INTEGRAL = Read-InputWithDefault "对话消耗积分" "1"
    $script:IMAGE_CONSUME_INTEGRAL = Read-InputWithDefault "图片生成消耗积分" "8"
    
    Write-Host ""
    
    # 访问配置
    Write-Host "【访问配置】" -ForegroundColor White
    $script:FRONTEND_URL = Read-InputWithDefault "前端访问地址" "http://localhost:30000"
}

function Generate-EnvFile {
    Print-Step "生成配置文件 / Generating Config Files"
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    $envContent = @"
# ==========================================
# Gemini Web - 环境变量配置
# 生成时间: $timestamp
# ==========================================

# ===================
# 数据库配置 Database
# ===================
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME

# ===================
# Redis 配置
# ===================
REDIS_PASSWORD=$REDIS_PASSWORD

# ===================
# JWT 配置
# ===================
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=$JWT_EXPIRES_IN

# ===================
# 前端配置 Frontend
# ===================
FRONTEND_URL=$FRONTEND_URL

# ===================
# AI API 配置
# ===================
OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_BASE_URL=$OPENAI_BASE_URL

# Midjourney (可选)
MIDJOURNEY_API_KEY=
MIDJOURNEY_BASE_URL=

# ===================
# 邮件服务配置 SMTP
# ===================
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_SECURE=false
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM

# ===================
# 积分配置 Integral
# ===================
REGISTER_GIFT_INTEGRAL=$REGISTER_GIFT_INTEGRAL
INVITE_REWARD_INTEGRAL=$INVITE_REWARD_INTEGRAL
CHAT_CONSUME_INTEGRAL=$CHAT_CONSUME_INTEGRAL
IMAGE_CONSUME_INTEGRAL=$IMAGE_CONSUME_INTEGRAL
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Print-Success "已生成 .env 配置文件"
    
    # 生成 backend/.env
    if (Test-Path "backend") {
        $backendEnvContent = @"
# ==========================================
# Backend - 环境变量配置
# 生成时间: $timestamp
# ==========================================

PORT=31001
NODE_ENV=production
FRONTEND_URL=$FRONTEND_URL

DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@localhost:35432/${DB_NAME}?schema=public

REDIS_URL=redis://:${REDIS_PASSWORD}@localhost:36379

JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=$JWT_EXPIRES_IN

OPENAI_API_KEY=$OPENAI_API_KEY
OPENAI_BASE_URL=$OPENAI_BASE_URL

SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT
SMTP_SECURE=false
SMTP_USER=$SMTP_USER
SMTP_PASS=$SMTP_PASS
SMTP_FROM=$SMTP_FROM

REGISTER_GIFT_INTEGRAL=$REGISTER_GIFT_INTEGRAL
INVITE_REWARD_INTEGRAL=$INVITE_REWARD_INTEGRAL
CHAT_CONSUME_INTEGRAL=$CHAT_CONSUME_INTEGRAL
IMAGE_CONSUME_INTEGRAL=$IMAGE_CONSUME_INTEGRAL
"@
        $backendEnvContent | Out-File -FilePath "backend/.env" -Encoding UTF8
        Print-Success "已生成 backend/.env 配置文件"
    }
}

# ========== 部署函数 ==========
function Build-And-Start {
    Print-Step "构建并启动服务 / Building & Starting Services"
    
    Print-Info "拉取基础镜像..."
    Invoke-Expression "$COMPOSE_CMD pull postgres redis 2>`$null" -ErrorAction SilentlyContinue
    
    Print-Info "构建应用镜像..."
    Invoke-Expression "$COMPOSE_CMD build --no-cache"
    
    Print-Info "启动所有服务..."
    Invoke-Expression "$COMPOSE_CMD up -d"
    
    Print-Success "所有服务已启动"
}

function Wait-ForServices {
    Print-Step "等待服务就绪 / Waiting for Services"
    
    Write-Host -NoNewline "等待服务启动"
    for ($i = 0; $i -lt 30; $i++) {
        Write-Host -NoNewline "."
        Start-Sleep -Seconds 2
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:31001/health" -UseBasicParsing -TimeoutSec 5
            if ($response.Content -match "ok") {
                Write-Host " ✓" -ForegroundColor Green
                Print-Success "后端服务就绪"
                break
            }
        } catch {
            # 继续等待
        }
    }
}

function Show-Result {
    Print-Step "部署完成 / Deployment Complete"
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "║              🎉 部署成功 / Deployment Success!             ║" -ForegroundColor Green
    Write-Host "║                                                           ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "服务访问地址 / Service URLs:" -ForegroundColor White
    Write-Host ""
    Write-Host "  Frontend:     http://localhost:30000" -ForegroundColor Cyan
    Write-Host "  Backend API:  http://localhost:31001" -ForegroundColor Cyan
    Write-Host "  Health Check: http://localhost:31001/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "常用命令 / Common Commands:" -ForegroundColor White
    Write-Host ""
    Write-Host "  docker compose ps        - 查看服务状态" -ForegroundColor Yellow
    Write-Host "  docker compose logs -f   - 查看服务日志" -ForegroundColor Yellow
    Write-Host "  docker compose restart   - 重启所有服务" -ForegroundColor Yellow
    Write-Host "  docker compose down      - 停止所有服务" -ForegroundColor Yellow
    Write-Host ""
}

# ========== 快速部署 ==========
function Quick-Deploy {
    Print-Step "快速部署模式 / Quick Deploy Mode"
    
    $script:DB_USER = "gemini"
    $script:DB_PASSWORD = Generate-Password 16
    $script:DB_NAME = "gemini_web"
    $script:REDIS_PASSWORD = Generate-Password 16
    $script:JWT_SECRET = Generate-JwtSecret
    $script:JWT_EXPIRES_IN = "7d"
    $script:OPENAI_API_KEY = "sk-your-api-key"
    $script:OPENAI_BASE_URL = "https://api.openai.com/v1"
    $script:SMTP_HOST = "smtp.gmail.com"
    $script:SMTP_PORT = "587"
    $script:SMTP_USER = ""
    $script:SMTP_PASS = ""
    $script:SMTP_FROM = "noreply@gemini-web.com"
    $script:REGISTER_GIFT_INTEGRAL = "10"
    $script:INVITE_REWARD_INTEGRAL = "50"
    $script:CHAT_CONSUME_INTEGRAL = "1"
    $script:IMAGE_CONSUME_INTEGRAL = "8"
    $script:FRONTEND_URL = "http://localhost:30000"
    
    Print-Warning "使用默认配置，密码已随机生成"
    Print-Warning "请在部署后修改 .env 文件中的 OPENAI_API_KEY"
}

# ========== 主菜单 ==========
function Show-Menu {
    Write-Host ""
    Write-Host "请选择操作 / Select Operation:" -ForegroundColor White
    Write-Host ""
    Write-Host "  1) 完整配置部署 (交互式配置所有选项)" -ForegroundColor Cyan
    Write-Host "  2) 快速部署 (使用默认配置，自动生成密码)" -ForegroundColor Cyan
    Write-Host "  3) 仅生成配置文件 (不启动服务)" -ForegroundColor Cyan
    Write-Host "  4) 仅检查环境" -ForegroundColor Cyan
    Write-Host "  5) 退出" -ForegroundColor Cyan
    Write-Host ""
    $choice = Read-Host "请输入选项 [1-5]"
    return $choice
}

# ========== 主函数 ==========
function Main {
    # 切换到项目根目录
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
    Set-Location (Split-Path -Parent $scriptPath)
    
    Print-Banner
    
    $choice = Show-Menu
    
    switch ($choice) {
        "1" {
            Check-Docker
            Check-Ports
            Configure-Env
            Generate-EnvFile
            Build-And-Start
            Wait-ForServices
            Show-Result
        }
        "2" {
            Check-Docker
            Check-Ports
            Quick-Deploy
            Generate-EnvFile
            Build-And-Start
            Wait-ForServices
            Show-Result
        }
        "3" {
            Configure-Env
            Generate-EnvFile
            Print-Success "配置文件生成完成！运行 'docker compose up -d' 启动服务"
        }
        "4" {
            Check-Docker
            Check-Ports
            Print-Success "环境检查完成！"
        }
        "5" {
            Print-Info "已退出"
            exit 0
        }
        default {
            Print-Error "无效选项"
            exit 1
        }
    }
}

Main

