@echo off
REM =============================================================================
REM NOTUS - Script para Visualizar Logs (Windows)
REM =============================================================================

setlocal

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set LOG_DIR=%PROJECT_ROOT%\logs

if "%1"=="" goto :show_help
if "%1"=="help" goto :show_help
if "%1"=="-h" goto :show_help
if "%1"=="--help" goto :show_help

set SERVICE=%1
set LOG_FILE=%LOG_DIR%\%SERVICE%.log

if not exist "%LOG_FILE%" (
    echo [WARNING] Log do serviço %SERVICE% não encontrado
    echo Arquivo esperado: %LOG_FILE%
    pause
    exit /b 1
)

echo [INFO] Mostrando logs do %SERVICE%:
echo Arquivo: %LOG_FILE%
echo Pressione Ctrl+C para sair
echo.

type "%LOG_FILE%"
pause
goto :eof

:show_help
echo Notus - Visualizador de Logs
echo.
echo Uso: %0 [serviço]
echo.
echo Serviços disponíveis:
echo   auth-service      - Logs do serviço de autenticação
echo   wallet-service     - Logs do serviço de carteira
echo   kyc-service        - Logs do serviço de KYC
echo   liquidity-service  - Logs do serviço de liquidez
echo   notification-service - Logs do serviço de notificação
echo   admin-frontend     - Logs do frontend administrativo
echo.
echo Exemplos:
echo   %0 auth-service    # Ver logs do auth service
echo   %0 wallet-service  # Ver logs do wallet service
echo.
pause
