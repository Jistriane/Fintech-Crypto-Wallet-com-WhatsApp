#!/bin/bash

# Configurações
REPO_URL="https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git"
GITHUB_TOKEN="ghp_TempToken123456789" # Token temporário que será revogado após o push

# Configurar git com credenciais temporárias
git config --global credential.helper store
echo "https://Jistriane:${GITHUB_TOKEN}@github.com" > ~/.git-credentials

# Inicializar repositório
git init

# Criar .gitignore
echo "node_modules/
.env
.DS_Store
build/
dist/
.next/
coverage/
.env*
*.log" > .gitignore

# Configurar git
git config user.name "Jistriane"
git config user.email "jistriane@github.com"

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "feat: Upload automático do projeto"

# Mudar para main
git branch -M main

# Adicionar remote e fazer push
git remote add origin $REPO_URL
git push -u origin main --force

# Limpar credenciais
rm ~/.git-credentials
git config --global --unset credential.helper

echo "✅ Projeto enviado com sucesso para $REPO_URL"
