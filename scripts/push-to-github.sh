#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# URL do repositório
REPO_URL="https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git"

echo -e "${YELLOW}Iniciando processo de upload para GitHub...${NC}"

# Verificar se git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git não está instalado. Instalando...${NC}"
    sudo apt-get update && sudo apt-get install git -y
fi

# Verificar se já é um repositório git
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}Inicializando repositório git...${NC}"
    git init
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao inicializar repositório git!${NC}"
        exit 1
    fi
fi

# Configurar .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    echo -e "${YELLOW}Criando .gitignore...${NC}"
    cat > .gitignore << EOL
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
coverage/
.nyc_output/

# Production
build/
dist/
.next/
out/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Hardhat
cache/
artifacts/

# Misc
.cache/
.temp/
*.pem
.vercel
.env*.local

# Mobile
.expo/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Contracts
typechain-types/
deployments/
EOL
fi

# Adicionar arquivos
echo -e "${YELLOW}Adicionando arquivos ao git...${NC}"
git add .
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao adicionar arquivos!${NC}"
    exit 1
fi

# Verificar se há mudanças para commit
if git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Nenhuma mudança para commit${NC}"
else
    # Fazer commit
    echo -e "${YELLOW}Fazendo commit...${NC}"
    git commit -m "feat: Fintech Crypto Wallet com WhatsApp - Upload inicial"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Erro ao fazer commit!${NC}"
        exit 1
    fi
fi

# Configurar branch main
echo -e "${YELLOW}Configurando branch main...${NC}"
git branch -M main
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao configurar branch main!${NC}"
    exit 1
fi

# Verificar se remote origin já existe
if git remote | grep -q "^origin$"; then
    echo -e "${YELLOW}Remote origin já existe. Atualizando URL...${NC}"
    git remote set-url origin $REPO_URL
else
    echo -e "${YELLOW}Adicionando remote origin...${NC}"
    git remote add origin $REPO_URL
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao configurar remote!${NC}"
    exit 1
fi

# Fazer push
echo -e "${YELLOW}Fazendo push para GitHub...${NC}"
git push -u origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao fazer push!${NC}"
    echo -e "${YELLOW}Tentando forçar push...${NC}"
    read -p "Deseja forçar o push? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git push -u origin main --force
        if [ $? -ne 0 ]; then
            echo -e "${RED}Erro ao forçar push!${NC}"
            exit 1
        fi
    else
        echo -e "${RED}Push cancelado pelo usuário${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Projeto enviado com sucesso para GitHub!${NC}"
echo -e "${GREEN}URL: $REPO_URL${NC}"

# Criar GitHub Actions workflow
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << EOL
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Run tests
      run: npm test
      
    - name: Build
      run: npm run build
EOL

# Fazer commit e push do workflow
git add .github/workflows/ci.yml
git commit -m "ci: Adiciona GitHub Actions workflow"
git push origin main

echo -e "${GREEN}Workflow do GitHub Actions configurado!${NC}"
echo -e "\n${YELLOW}Próximos passos:${NC}"
echo "1. Configure as proteções de branch no GitHub"
echo "2. Configure os secrets necessários para CI/CD"
echo "3. Configure o Dependabot para atualizações automáticas"
echo "4. Adicione colaboradores ao projeto"
