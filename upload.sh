#!/bin/bash

echo "🚀 Subindo projeto para o GitHub..."

# Inicializar git se necessário
git init

# Criar .gitignore básico
echo "node_modules/
.env
.DS_Store
build/
dist/" > .gitignore

# Configurar remote
git remote remove origin 2>/dev/null
git remote add origin https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git

# Adicionar tudo
git add .

# Commit
git commit -m "feat: Upload inicial do projeto"

# Mudar para main
git branch -M main

# Forçar push (--force para garantir)
git push -u origin main --force

echo "✅ Projeto enviado para: https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git"
