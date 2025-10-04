#!/bin/bash

# =============================================================================
# NOTUS - Script para Verificar Status do Sistema
# =============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"

# Função para verificar se um serviço está rodando
check_service() {
    local url="$1"
    local name="$2"
    local port="$3"
    
    if curl -s "$url" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - $url"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - $url (porta $port)"
        return 1
    fi
}

# Função para verificar porta
check_port() {
    local port="$1"
    local name="$2"
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $name${NC} - porta $port"
        return 0
    else
        echo -e "${RED}❌ $name${NC} - porta $port"
        return 1
    fi
}

# Banner
echo -e "${CYAN}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    NOTUS SYSTEM STATUS                       ║"
echo "║                                                              ║"
echo "║  Verificando status de todos os serviços do sistema          ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Verificar serviços web
echo -e "${BLUE}🌐 Serviços Web:${NC}"
check_service "http://localhost:3000" "Admin Frontend" "3000"
check_service "http://localhost:3333/health" "Auth Service" "3333"
check_service "http://localhost:3334/health" "Wallet Service" "3334"
check_service "http://localhost:3335/health" "KYC Service" "3335"
check_service "http://localhost:3336/health" "Liquidity Service" "3336"
check_service "http://localhost:3337/health" "Notification Service" "3337"
echo ""

# Verificar infraestrutura
echo -e "${BLUE}🏗️ Infraestrutura:${NC}"
check_port "5432" "PostgreSQL"
check_port "6379" "Redis"
echo ""

# Verificar processos Node.js
echo -e "${BLUE}📦 Processos Node.js:${NC}"
NODE_PROCESSES=$(pgrep -f "node.*notus\|next.*dev" | wc -l)
if [ "$NODE_PROCESSES" -gt 0 ]; then
    echo -e "${GREEN}✅ $NODE_PROCESSES processos Node.js rodando${NC}"
else
    echo -e "${RED}❌ Nenhum processo Node.js encontrado${NC}"
fi
echo ""

# Verificar Docker
echo -e "${BLUE}🐳 Docker:${NC}"
if command -v docker &> /dev/null; then
    if docker ps | grep -q "notus\|postgres\|redis"; then
        echo -e "${GREEN}✅ Containers Docker rodando${NC}"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(notus|postgres|redis)"
    else
        echo -e "${YELLOW}⚠️ Docker disponível mas nenhum container rodando${NC}"
    fi
else
    echo -e "${RED}❌ Docker não encontrado${NC}"
fi
echo ""

# Verificar logs
echo -e "${BLUE}📋 Logs:${NC}"
if [ -d "$LOG_DIR" ]; then
    LOG_COUNT=$(find "$LOG_DIR" -name "*.log" | wc -l)
    if [ "$LOG_COUNT" -gt 0 ]; then
        echo -e "${GREEN}✅ $LOG_COUNT arquivos de log encontrados${NC}"
        echo "Localização: $LOG_DIR"
        
        # Mostrar tamanho dos logs
        echo ""
        echo "Tamanho dos logs:"
        for log_file in "$LOG_DIR"/*.log; do
            if [ -f "$log_file" ]; then
                size=$(du -h "$log_file" | cut -f1)
                name=$(basename "$log_file")
                echo "  $name: $size"
            fi
        done
    else
        echo -e "${YELLOW}⚠️ Diretório de logs existe mas está vazio${NC}"
    fi
else
    echo -e "${RED}❌ Diretório de logs não encontrado${NC}"
fi
echo ""

# Verificar uso de recursos
echo -e "${BLUE}💻 Recursos do Sistema:${NC}"
if command -v free &> /dev/null; then
    MEMORY=$(free -h | grep "Mem:" | awk '{print $3 "/" $2}')
    echo "Memória: $MEMORY"
fi

if command -v df &> /dev/null; then
    DISK=$(df -h . | tail -1 | awk '{print $3 "/" $2 " (" $5 " usado)"}')
    echo "Disco: $DISK"
fi
echo ""

# Resumo
echo -e "${PURPLE}📊 Resumo:${NC}"
TOTAL_SERVICES=8
RUNNING_SERVICES=0

# Contar serviços rodando
check_service "http://localhost:3000" "Admin Frontend" "3000" >/dev/null && ((RUNNING_SERVICES++))
check_service "http://localhost:3333/health" "Auth Service" "3333" >/dev/null && ((RUNNING_SERVICES++))
check_service "http://localhost:3334/health" "Wallet Service" "3334" >/dev/null && ((RUNNING_SERVICES++))
check_service "http://localhost:3335/health" "KYC Service" "3335" >/dev/null && ((RUNNING_SERVICES++))
check_service "http://localhost:3336/health" "Liquidity Service" "3336" >/dev/null && ((RUNNING_SERVICES++))
check_service "http://localhost:3337/health" "Notification Service" "3337" >/dev/null && ((RUNNING_SERVICES++))
check_port "5432" "PostgreSQL" >/dev/null && ((RUNNING_SERVICES++))
check_port "6379" "Redis" >/dev/null && ((RUNNING_SERVICES++))

echo "Serviços rodando: $RUNNING_SERVICES/$TOTAL_SERVICES"

if [ "$RUNNING_SERVICES" -eq "$TOTAL_SERVICES" ]; then
    echo -e "${GREEN}🎉 Todos os serviços estão funcionando!${NC}"
elif [ "$RUNNING_SERVICES" -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Alguns serviços estão rodando${NC}"
else
    echo -e "${RED}❌ Nenhum serviço está rodando${NC}"
fi

echo ""
echo -e "${BLUE}💡 Comandos úteis:${NC}"
echo "  ./scripts/start-system.sh    - Iniciar sistema"
echo "  ./scripts/stop-system.sh     - Parar sistema"
echo "  ./scripts/logs.sh [serviço]  - Ver logs"
echo "  ./scripts/status.sh          - Ver status (este comando)"
echo ""
