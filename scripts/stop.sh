#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Parando sistema...${NC}"

# Encontra e mata o processo principal
PID=$(ps aux | grep "npm run start" | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    echo -e "${YELLOW}Parando processo principal (PID: $PID)...${NC}"
    kill -15 $PID
    sleep 2
    
    # Verifica se o processo foi finalizado
    if ps -p $PID > /dev/null; then
        echo -e "${RED}Processo não respondeu ao SIGTERM. Forçando encerramento...${NC}"
        kill -9 $PID
    fi
fi

# Para o Redis (se estiver rodando localmente)
echo -e "${YELLOW}Parando Redis...${NC}"
redis-cli shutdown > /dev/null 2>&1

# Verifica se há processos residuais
PIDS=$(ps aux | grep "ts-node" | grep -v grep | awk '{print $2}')
if [ ! -z "$PIDS" ]; then
    echo -e "${YELLOW}Parando processos residuais...${NC}"
    kill -15 $PIDS > /dev/null 2>&1
    sleep 2
    kill -9 $PIDS > /dev/null 2>&1
fi

echo -e "${GREEN}Sistema parado com sucesso!${NC}"
