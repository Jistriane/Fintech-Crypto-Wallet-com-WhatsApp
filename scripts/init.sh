#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando sistema...${NC}"

# Verifica Node.js
echo -e "\n${YELLOW}Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js não encontrado. Por favor, instale o Node.js${NC}"
    exit 1
fi

# Verifica se .env existe
echo -e "\n${YELLOW}Verificando arquivo .env...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Arquivo .env não encontrado. Criando a partir do exemplo...${NC}"
    cp .env.example .env
    echo -e "${GREEN}Arquivo .env criado. Por favor, configure as variáveis necessárias.${NC}"
    exit 1
fi

# Instala dependências
echo -e "\n${YELLOW}Instalando dependências...${NC}"
npm install --legacy-peer-deps

# Compila contratos
echo -e "\n${YELLOW}Compilando contratos...${NC}"
npm run compile

# Verifica se os contratos já estão deployados
echo -e "\n${YELLOW}Verificando contratos deployados...${NC}"
if [ ! -f deployed-addresses.json ]; then
    echo -e "${YELLOW}Contratos não encontrados. Iniciando deploy...${NC}"
    
    # Deploy na Polygon
    echo -e "\n${YELLOW}Deployando na Polygon...${NC}"
    npm run deploy:polygon
    
    # Deploy na BSC
    echo -e "\n${YELLOW}Deployando na BSC...${NC}"
    npm run deploy:bsc
    
    # Verifica contratos
    echo -e "\n${YELLOW}Verificando contratos...${NC}"
    npm run verify:polygon
    npm run verify:bsc
fi

# Cria diretórios necessários
echo -e "\n${YELLOW}Criando diretórios...${NC}"
mkdir -p logs
mkdir -p backups
mkdir -p data

# Inicia banco de dados (se necessário)
echo -e "\n${YELLOW}Verificando banco de dados...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${RED}PostgreSQL não encontrado. Por favor, instale o PostgreSQL${NC}"
    exit 1
fi

# Verifica Redis
echo -e "\n${YELLOW}Verificando Redis...${NC}"
if ! command -v redis-cli &> /dev/null; then
    echo -e "${RED}Redis não encontrado. Por favor, instale o Redis${NC}"
    exit 1
fi

# Verifica status do Redis
redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Iniciando Redis...${NC}"
    redis-server &
fi

# Verifica status do sistema
echo -e "\n${YELLOW}Verificando status do sistema...${NC}"
npm run status

# Se tudo estiver OK, inicia o sistema
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Iniciando sistema...${NC}"
    
    # Inicia serviços em background
    echo -e "${YELLOW}Iniciando serviços...${NC}"
    npm run start &
    
    # Aguarda serviços iniciarem
    sleep 5
    
    # Verifica status final
    echo -e "\n${YELLOW}Verificando status final...${NC}"
    npm run status
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}Sistema iniciado com sucesso!${NC}"
        echo -e "\nLogs disponíveis em:"
        echo -e "- Sistema: ./logs/combined.log"
        echo -e "- Erros: ./logs/error.log"
        echo -e "\nPara parar o sistema: npm run stop"
        echo -e "Para verificar status: npm run status"
    else
        echo -e "\n${RED}Erro ao iniciar sistema. Verifique os logs para mais detalhes.${NC}"
        exit 1
    fi
else
    echo -e "\n${RED}Erro na verificação do sistema. Corriga os erros antes de continuar.${NC}"
    exit 1
fi
