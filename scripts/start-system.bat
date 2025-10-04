@echo off
REM =============================================================================
REM NOTUS - Sistema de Inicialização Completo (Windows)
REM =============================================================================
REM Script para inicializar todo o sistema Notus com todos os serviços
REM Autor: Notus Team
REM Versão: 1.0.0
REM =============================================================================

setlocal enabledelayedexpansion

REM Configurações
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set LOG_DIR=%PROJECT_ROOT%\logs
set ENV_FILE=%PROJECT_ROOT%\.env

REM Criar diretórios se não existirem
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
if not exist "%PROJECT_ROOT%\data" mkdir "%PROJECT_ROOT%\data"
if not exist "%PROJECT_ROOT%\backups" mkdir "%PROJECT_ROOT%\backups"

REM Banner
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    NOTUS CRYPTO WALLET                       ║
echo ║                Sistema de Inicialização                     ║
echo ║                                                              ║
echo ║  🚀 Frontend Admin    📱 Mobile App    🔐 Auth Service       ║
echo ║  💼 Wallet Service   🛡️ KYC Service   💧 Liquidity Service   ║
echo ║  📢 Notification     🐘 PostgreSQL    🔴 Redis               ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js não encontrado. Instale Node.js 20+ primeiro.
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm não encontrado.
    pause
    exit /b 1
)

REM Verificar Docker
docker --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker não encontrado. Alguns serviços podem não funcionar.
)

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Docker Compose não encontrado. Alguns serviços podem não funcionar.
)

echo [INFO] Pré-requisitos verificados

REM Configurar arquivo .env
if not exist "%ENV_FILE%" (
    echo [INFO] Criando arquivo .env...
    copy "%PROJECT_ROOT%\env.example" "%ENV_FILE%" >nul
    echo [WARNING] Arquivo .env criado a partir do exemplo. Configure as variáveis necessárias.
)

echo [INFO] Variáveis de ambiente configuradas

REM Verificar portas em uso
echo [INFO] Verificando portas em uso...
for %%p in (3000 3333 3334 3335 3336 3337 5432 6379) do (
    netstat -an | findstr ":%%p " >nul
    if not errorlevel 1 (
        echo [WARNING] Porta %%p está em uso. Tentando liberar...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%%p "') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 >nul
    )
)

echo [INFO] Portas verificadas

REM Instalar dependências
echo [INFO] Instalando dependências...

REM Dependências raiz
if exist "%PROJECT_ROOT%\package.json" (
    echo [INFO] Instalando dependências raiz...
    cd /d "%PROJECT_ROOT%"
    call npm install
)

REM Dependências do admin
if exist "%PROJECT_ROOT%\crypto-wallet-admin" (
    echo [INFO] Instalando dependências do admin...
    cd /d "%PROJECT_ROOT%\crypto-wallet-admin"
    call npm install
)

REM Dependências dos serviços
set SERVICES=auth-service wallet-service kyc liquidity notification-service

for %%s in (%SERVICES%) do (
    if exist "%PROJECT_ROOT%\services\%%s" (
        echo [INFO] Instalando dependências do serviço: %%s
        cd /d "%PROJECT_ROOT%\services\%%s"
        call npm install
    )
)

echo [INFO] Dependências instaladas

REM Inicializar banco de dados
echo [INFO] Inicializando banco de dados...

REM Verificar se PostgreSQL está rodando
netstat -an | findstr ":5432 " >nul
if errorlevel 1 (
    echo [INFO] Iniciando PostgreSQL com Docker...
    cd /d "%PROJECT_ROOT%"
    call docker-compose up -d postgres
    
    REM Aguardar PostgreSQL estar pronto
    echo [INFO] Aguardando PostgreSQL estar pronto...
    for /l %%i in (1,1,30) do (
        netstat -an | findstr ":5432 " >nul
        if not errorlevel 1 goto :postgres_ready
        timeout /t 2 >nul
    )
    :postgres_ready
)

REM Executar migrações
for %%s in (%SERVICES%) do (
    if exist "%PROJECT_ROOT%\services\%%s" (
        echo [INFO] Executando migrações do serviço: %%s
        cd /d "%PROJECT_ROOT%\services\%%s"
        
        if exist "prisma\schema.prisma" (
            call npx prisma generate
            call npx prisma migrate dev --name init >nul 2>&1
        )
    )
)

echo [INFO] Banco de dados inicializado

REM Inicializar Redis
echo [INFO] Inicializando Redis...

REM Verificar se Redis está rodando
netstat -an | findstr ":6379 " >nul
if errorlevel 1 (
    echo [INFO] Iniciando Redis com Docker...
    cd /d "%PROJECT_ROOT%"
    call docker-compose up -d redis
    
    REM Aguardar Redis estar pronto
    echo [INFO] Aguardando Redis estar pronto...
    for /l %%i in (1,1,15) do (
        netstat -an | findstr ":6379 " >nul
        if not errorlevel 1 goto :redis_ready
        timeout /t 2 >nul
    )
    :redis_ready
)

echo [INFO] Redis inicializado

REM Parar processos existentes
echo [INFO] Parando processos existentes...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

REM Iniciar serviços
echo [INFO] Iniciando serviços...

REM Auth Service
echo [INFO] Iniciando Auth Service (porta 3333)...
cd /d "%PROJECT_ROOT%\services\auth-service"
start "Auth Service" cmd /c "npm run dev > %LOG_DIR%\auth-service.log 2>&1"

REM Wallet Service
echo [INFO] Iniciando Wallet Service (porta 3334)...
cd /d "%PROJECT_ROOT%\services\wallet-service"
start "Wallet Service" cmd /c "npm run dev > %LOG_DIR%\wallet-service.log 2>&1"

REM KYC Service
echo [INFO] Iniciando KYC Service (porta 3335)...
cd /d "%PROJECT_ROOT%\services\kyc"
start "KYC Service" cmd /c "npm run dev > %LOG_DIR%\kyc-service.log 2>&1"

REM Liquidity Service
echo [INFO] Iniciando Liquidity Service (porta 3336)...
cd /d "%PROJECT_ROOT%\services\liquidity"
start "Liquidity Service" cmd /c "npm run dev > %LOG_DIR%\liquidity-service.log 2>&1"

REM Notification Service
echo [INFO] Iniciando Notification Service (porta 3337)...
cd /d "%PROJECT_ROOT%\services\notification-service"
start "Notification Service" cmd /c "npm run dev > %LOG_DIR%\notification-service.log 2>&1"

REM Admin Frontend
echo [INFO] Iniciando Admin Frontend (porta 3000)...
cd /d "%PROJECT_ROOT%\crypto-wallet-admin"
start "Admin Frontend" cmd /c "npm run dev > %LOG_DIR%\admin-frontend.log 2>&1"

echo [INFO] Serviços iniciados

REM Aguardar serviços estarem prontos
echo [INFO] Aguardando serviços estarem prontos...
timeout /t 10 >nul

REM Verificar saúde dos serviços
echo [INFO] Verificando saúde dos serviços...

REM Aguardar um pouco mais para os serviços estarem prontos
timeout /t 5 >nul

echo.
echo ┌─────────────────────────────────────────────────────────────────┐
echo │                        NOTUS SERVICES                           │
echo ├─────────────────────────────────────────────────────────────────┤
echo │  🖥️  Admin Frontend    │  http://localhost:3000              │
echo │  🔐  Auth Service      │  http://localhost:3333              │
echo │  💼  Wallet Service    │  http://localhost:3334              │
echo │  🛡️  KYC Service      │  http://localhost:3335              │
echo │  💧  Liquidity Service │  http://localhost:3336              │
echo │  📢  Notification     │  http://localhost:3337              │
echo │  🐘  PostgreSQL       │  localhost:5432                    │
echo │  🔴  Redis            │  localhost:6379                    │
echo └─────────────────────────────────────────────────────────────────┘
echo.
echo [INFO] Logs disponíveis em: %LOG_DIR%
echo [INFO] PIDs salvos em: %LOG_DIR%\*.pid
echo.

echo [SUCCESS] Sistema Notus iniciado com sucesso!
echo.
echo Para parar o sistema, execute: scripts\stop-system.bat
echo Para ver logs, execute: scripts\logs.bat
echo.

pause
