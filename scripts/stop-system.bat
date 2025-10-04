@echo off
REM =============================================================================
REM NOTUS - Script para Parar o Sistema (Windows)
REM =============================================================================

setlocal

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set LOG_DIR=%PROJECT_ROOT%\logs

echo [INFO] Parando sistema Notus...

REM Parar processos Node.js
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

REM Parar Docker Compose
cd /d "%PROJECT_ROOT%"
call docker-compose down >nul 2>&1

echo [SUCCESS] Sistema Notus parado com sucesso!
pause
