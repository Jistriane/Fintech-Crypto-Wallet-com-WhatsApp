#!/bin/bash

# =============================================================================
# NOTUS - Sistema de Inicialização Completo
# =============================================================================
# Script para inicializar todo o sistema Notus com todos os serviços
# Autor: Notus Team
# Versão: 1.0.0
# =============================================================================

set -e  # Exit on any error

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"
ENV_FILE="$PROJECT_ROOT/.env"

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log_info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Banner
show_banner() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    NOTUS CRYPTO WALLET                       ║"
    echo "║                Sistema de Inicialização                     ║"
    echo "║                                                              ║"
    echo "║  🚀 Frontend Admin    📱 Mobile App    🔐 Auth Service       ║"
    echo "║  💼 Wallet Service   🛡️ KYC Service   💧 Liquidity Service   ║"
    echo "║  📢 Notification     🐘 PostgreSQL    🔴 Redis               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log "Verificando pré-requisitos..."
    
    # Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js não encontrado. Instale Node.js 20+ primeiro."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        log_error "Node.js versão 20+ é necessária. Versão atual: $(node -v)"
        exit 1
    fi
    
    # npm
    if ! command -v npm &> /dev/null; then
        log_error "npm não encontrado."
        exit 1
    fi
    
    # Docker
    if ! command -v docker &> /dev/null; then
        log_warning "Docker não encontrado. Alguns serviços podem não funcionar."
    fi
    
    # Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_warning "Docker Compose não encontrado. Alguns serviços podem não funcionar."
    fi
    
    log "✅ Pré-requisitos verificados"
}

# Criar diretórios necessários
create_directories() {
    log "Criando diretórios necessários..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$PROJECT_ROOT/data"
    mkdir -p "$PROJECT_ROOT/backups"
    
    log "✅ Diretórios criados"
}

# Verificar e criar arquivo .env
setup_environment() {
    log "Configurando variáveis de ambiente..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log "Criando arquivo .env..."
        cp "$PROJECT_ROOT/env.example" "$ENV_FILE"
        log_warning "Arquivo .env criado a partir do exemplo. Configure as variáveis necessárias."
    fi
    
    # Carregar variáveis de ambiente
    if [ -f "$ENV_FILE" ]; then
        export $(grep -v '^#' "$ENV_FILE" | xargs)
    fi
    
    log "✅ Variáveis de ambiente configuradas"
}

# Verificar portas em uso
check_ports() {
    log "Verificando portas em uso..."
    
    PORTS=(3000 3333 3334 3335 3336 3337 5432 6379)
    
    for port in "${PORTS[@]}"; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            log_warning "Porta $port está em uso. Tentando liberar..."
            # Tentar matar processo na porta
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
            
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                log_error "Não foi possível liberar a porta $port"
                exit 1
            fi
        fi
    done
    
    log "✅ Portas verificadas"
}

# Instalar dependências
install_dependencies() {
    log "Instalando dependências..."
    
    # Instalar dependências raiz
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        log "Instalando dependências raiz..."
        cd "$PROJECT_ROOT"
        npm install
    fi
    
    # Instalar dependências do admin
    if [ -d "$PROJECT_ROOT/crypto-wallet-admin" ]; then
        log "Instalando dependências do admin..."
        cd "$PROJECT_ROOT/crypto-wallet-admin"
        npm install
    fi
    
    # Instalar dependências dos serviços
    SERVICES=("auth-service" "wallet-service" "kyc" "liquidity" "notification-service")
    
    for service in "${SERVICES[@]}"; do
        if [ -d "$PROJECT_ROOT/services/$service" ]; then
            log "Instalando dependências do serviço: $service"
            cd "$PROJECT_ROOT/services/$service"
            npm install
        fi
    done
    
    log "✅ Dependências instaladas"
}

# Inicializar banco de dados
init_database() {
    log "Inicializando banco de dados..."
    
    # Verificar se PostgreSQL está rodando
    if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
        log "Iniciando PostgreSQL com Docker..."
        cd "$PROJECT_ROOT"
        docker-compose up -d postgres
        
        # Aguardar PostgreSQL estar pronto
        log "Aguardando PostgreSQL estar pronto..."
        for i in {1..30}; do
            if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
                break
            fi
            sleep 2
        done
    fi
    
    # Executar migrações
    SERVICES=("auth-service" "wallet-service" "kyc" "liquidity" "notification-service")
    
    for service in "${SERVICES[@]}"; do
        if [ -d "$PROJECT_ROOT/services/$service" ]; then
            log "Executando migrações do serviço: $service"
            cd "$PROJECT_ROOT/services/$service"
            
            # Gerar cliente Prisma
            if [ -f "prisma/schema.prisma" ]; then
                npx prisma generate
                npx prisma migrate dev --name init || true
            fi
        fi
    done
    
    log "✅ Banco de dados inicializado"
}

# Inicializar Redis
init_redis() {
    log "Inicializando Redis..."
    
    # Verificar se Redis está rodando
    if ! redis-cli ping >/dev/null 2>&1; then
        log "Iniciando Redis com Docker..."
        cd "$PROJECT_ROOT"
        docker-compose up -d redis
        
        # Aguardar Redis estar pronto
        log "Aguardando Redis estar pronto..."
        for i in {1..15}; do
            if redis-cli ping >/dev/null 2>&1; then
                break
            fi
            sleep 2
        done
    fi
    
    log "✅ Redis inicializado"
}

# Inicializar serviços
start_services() {
    log "Iniciando serviços..."
    
    # Matar processos existentes
    pkill -f "node.*notus" 2>/dev/null || true
    pkill -f "next.*dev" 2>/dev/null || true
    
    # Iniciar serviços em background
    cd "$PROJECT_ROOT"
    
    # Auth Service
    log "Iniciando Auth Service (porta 3333)..."
    cd "$PROJECT_ROOT/services/auth-service"
    npm run dev > "$LOG_DIR/auth-service.log" 2>&1 &
    AUTH_PID=$!
    echo $AUTH_PID > "$LOG_DIR/auth-service.pid"
    
    # Wallet Service
    log "Iniciando Wallet Service (porta 3334)..."
    cd "$PROJECT_ROOT/services/wallet-service"
    npm run dev > "$LOG_DIR/wallet-service.log" 2>&1 &
    WALLET_PID=$!
    echo $WALLET_PID > "$LOG_DIR/wallet-service.pid"
    
    # KYC Service
    log "Iniciando KYC Service (porta 3335)..."
    cd "$PROJECT_ROOT/services/kyc"
    npm run dev > "$LOG_DIR/kyc-service.log" 2>&1 &
    KYC_PID=$!
    echo $KYC_PID > "$LOG_DIR/kyc-service.pid"
    
    # Liquidity Service
    log "Iniciando Liquidity Service (porta 3336)..."
    cd "$PROJECT_ROOT/services/liquidity"
    npm run dev > "$LOG_DIR/liquidity-service.log" 2>&1 &
    LIQUIDITY_PID=$!
    echo $LIQUIDITY_PID > "$LOG_DIR/liquidity-service.pid"
    
    # Notification Service
    log "Iniciando Notification Service (porta 3337)..."
    cd "$PROJECT_ROOT/services/notification-service"
    npm run dev > "$LOG_DIR/notification-service.log" 2>&1 &
    NOTIFICATION_PID=$!
    echo $NOTIFICATION_PID > "$LOG_DIR/notification-service.pid"
    
    # Admin Frontend
    log "Iniciando Admin Frontend (porta 3000)..."
    cd "$PROJECT_ROOT/crypto-wallet-admin"
    npm run dev > "$LOG_DIR/admin-frontend.log" 2>&1 &
    ADMIN_PID=$!
    echo $ADMIN_PID > "$LOG_DIR/admin-frontend.pid"
    
    log "✅ Serviços iniciados"
}

# Verificar saúde dos serviços
health_check() {
    log "Verificando saúde dos serviços..."
    
    SERVICES=(
        "http://localhost:3333/health:Auth Service"
        "http://localhost:3334/health:Wallet Service"
        "http://localhost:3335/health:KYC Service"
        "http://localhost:3336/health:Liquidity Service"
        "http://localhost:3337/health:Notification Service"
        "http://localhost:3000:Admin Frontend"
    )
    
    for service in "${SERVICES[@]}"; do
        IFS=':' read -r url name <<< "$service"
        log "Verificando $name..."
        
        for i in {1..30}; do
            if curl -s "$url" >/dev/null 2>&1; then
                log "✅ $name está funcionando"
                break
            fi
            
            if [ $i -eq 30 ]; then
                log_warning "⚠️ $name não respondeu após 60 segundos"
            else
                sleep 2
            fi
        done
    done
}

# Mostrar status dos serviços
show_status() {
    log "Status dos serviços:"
    echo ""
    echo -e "${CYAN}┌─────────────────────────────────────────────────────────────────┐${NC}"
    echo -e "${CYAN}│                        NOTUS SERVICES                           │${NC}"
    echo -e "${CYAN}├─────────────────────────────────────────────────────────────────┤${NC}"
    echo -e "${CYAN}│  🖥️  Admin Frontend    │  http://localhost:3000              │${NC}"
    echo -e "${CYAN}│  🔐  Auth Service      │  http://localhost:3333              │${NC}"
    echo -e "${CYAN}│  💼  Wallet Service    │  http://localhost:3334              │${NC}"
    echo -e "${CYAN}│  🛡️  KYC Service      │  http://localhost:3335              │${NC}"
    echo -e "${CYAN}│  💧  Liquidity Service │  http://localhost:3336              │${NC}"
    echo -e "${CYAN}│  📢  Notification     │  http://localhost:3337              │${NC}"
    echo -e "${CYAN}│  🐘  PostgreSQL       │  localhost:5432                    │${NC}"
    echo -e "${CYAN}│  🔴  Redis            │  localhost:6379                    │${NC}"
    echo -e "${CYAN}└─────────────────────────────────────────────────────────────────┘${NC}"
    echo ""
    echo -e "${GREEN}📊 Logs disponíveis em: $LOG_DIR${NC}"
    echo -e "${GREEN}📁 PIDs salvos em: $LOG_DIR/*.pid${NC}"
    echo ""
}

# Função para parar serviços
stop_services() {
    log "Parando serviços..."
    
    # Parar processos pelos PIDs salvos
    for pid_file in "$LOG_DIR"/*.pid; do
        if [ -f "$pid_file" ]; then
            pid=$(cat "$pid_file")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid"
                log "Processo $pid parado"
            fi
            rm "$pid_file"
        fi
    done
    
    # Parar Docker Compose
    cd "$PROJECT_ROOT"
    docker-compose down 2>/dev/null || true
    
    log "✅ Serviços parados"
}

# Função para mostrar logs
show_logs() {
    local service="$1"
    
    if [ -z "$service" ]; then
        log "Serviços disponíveis:"
        echo "  - auth-service"
        echo "  - wallet-service"
        echo "  - kyc-service"
        echo "  - liquidity-service"
        echo "  - notification-service"
        echo "  - admin-frontend"
        echo ""
        echo "Uso: $0 logs <serviço>"
        return
    fi
    
    if [ -f "$LOG_DIR/$service.log" ]; then
        log "Mostrando logs do $service:"
        tail -f "$LOG_DIR/$service.log"
    else
        log_error "Log do serviço $service não encontrado"
    fi
}

# Função principal
main() {
    case "${1:-start}" in
        "start")
            show_banner
            check_prerequisites
            create_directories
            setup_environment
            check_ports
            install_dependencies
            init_database
            init_redis
            start_services
            sleep 5
            health_check
            show_status
            ;;
        "stop")
            stop_services
            ;;
        "restart")
            stop_services
            sleep 3
            main start
            ;;
        "status")
            show_status
            ;;
        "logs")
            show_logs "$2"
            ;;
        "help"|"-h"|"--help")
            echo "Notus - Sistema de Inicialização"
            echo ""
            echo "Uso: $0 [comando]"
            echo ""
            echo "Comandos:"
            echo "  start     - Iniciar todos os serviços (padrão)"
            echo "  stop      - Parar todos os serviços"
            echo "  restart   - Reiniciar todos os serviços"
            echo "  status    - Mostrar status dos serviços"
            echo "  logs      - Mostrar logs de um serviço"
            echo "  help      - Mostrar esta ajuda"
            echo ""
            ;;
        *)
            log_error "Comando desconhecido: $1"
            echo "Use '$0 help' para ver os comandos disponíveis"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
