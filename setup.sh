#!/bin/bash
# Gemini Web - 一键部署入口
# 使用方法: ./setup.sh 或 bash setup.sh

cd "$(dirname "$0")"

if [ ! -f "scripts/setup.sh" ]; then
    echo "错误: scripts/setup.sh 不存在"
    exit 1
fi

chmod +x scripts/setup.sh
exec ./scripts/setup.sh "$@"

