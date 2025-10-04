#!/bin/bash

# =============================================================================
# NOTUS - Script para Parar o Sistema
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
LOG_DIR="$PROJECT_ROOT/logs"

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" >&2
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

log "Parando sistema Notus..."

# Parar processos pelos PIDs salvos
if [ -d "$LOG_DIR" ]; then
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
fi

# Parar processos Node.js relacionados ao Notus
pkill -f "node.*notus" 2>/dev/null || true
pkill -f "next.*dev" 2>/dev/null || true

# Parar Docker Compose
cd "$PROJECT_ROOT"
docker-compose down 2>/dev/null || true

log "✅ Sistema Notus parado com sucesso"
