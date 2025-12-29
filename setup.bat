@echo off
chcp 65001 >nul
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║              Gemini Web - 一键部署工具                      ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo 正在启动配置工具...
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup.ps1"
pause

