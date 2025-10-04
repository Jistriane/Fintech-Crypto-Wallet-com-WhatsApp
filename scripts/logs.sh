#!/bin/bash

# =============================================================================
# NOTUS - Script para Visualizar Logs
# =============================================================================

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"

show_help() {
    echo "Notus - Visualizador de Logs"
    echo ""
    echo "Uso: $0 [serviço]"
    echo ""
    echo "Serviços disponíveis:"
    echo "  auth-service      - Logs do serviço de autenticação"
    echo "  wallet-service     - Logs do serviço de carteira"
    echo "  kyc-service        - Logs do serviço de KYC"
    echo "  liquidity-service  - Logs do serviço de liquidez"
    echo "  notification-service - Logs do serviço de notificação"
    echo "  admin-frontend     - Logs do frontend administrativo"
    echo "  all                - Todos os logs (modo interativo)"
    echo ""
    echo "Exemplos:"
    echo "  $0 auth-service    # Ver logs do auth service"
    echo "  $0 all             # Ver todos os logs"
    echo ""
}

show_logs() {
    local service="$1"
    local log_file="$LOG_DIR/$service.log"
    
    if [ ! -f "$log_file" ]; then
        echo -e "${YELLOW}Log do serviço $service não encontrado${NC}"
        echo "Arquivo esperado: $log_file"
        return 1
    fi
    
    echo -e "${GREEN}Mostrando logs do $service:${NC}"
    echo "Arquivo: $log_file"
    echo "Pressione Ctrl+C para sair"
    echo ""
    
    tail -f "$log_file"
}

show_all_logs() {
    echo -e "${BLUE}Modo interativo - Todos os logs${NC}"
    echo "Pressione Ctrl+C para sair"
    echo ""
    
    # Usar multitail se disponível, senão usar tail
    if command -v multitail &> /dev/null; then
        multitail -cT ansi \
            "$LOG_DIR/auth-service.log" \
            "$LOG_DIR/wallet-service.log" \
            "$LOG_DIR/kyc-service.log" \
            "$LOG_DIR/liquidity-service.log" \
            "$LOG_DIR/notification-service.log" \
            "$LOG_DIR/admin-frontend.log"
    else
        echo -e "${YELLOW}multitail não encontrado. Instalando...${NC}"
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y multitail
        elif command -v brew &> /dev/null; then
            brew install multitail
        else
            echo -e "${YELLOW}multitail não disponível. Mostrando logs sequencialmente...${NC}"
            tail -f "$LOG_DIR"/*.log
        fi
    fi
}

main() {
    case "${1:-help}" in
        "auth-service"|"wallet-service"|"kyc-service"|"liquidity-service"|"notification-service"|"admin-frontend")
            show_logs "$1"
            ;;
        "all")
            show_all_logs
            ;;
        "help"|"-h"|"--help"|"")
            show_help
            ;;
        *)
            echo -e "${YELLOW}Serviço desconhecido: $1${NC}"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
