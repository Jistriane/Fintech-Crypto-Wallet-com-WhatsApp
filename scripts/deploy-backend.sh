#!/bin/bash

# Script de Deploy Automático do Backend para Vercel - Mainnet
echo "🚀 Iniciando deploy do backend para Vercel..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Verificar se o Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Verificar se está logado na Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Faça login na Vercel:"
    vercel login
fi

# Deploy do Auth Service
echo "🔐 Fazendo deploy do Auth Service..."
cd services/auth-service
vercel --prod --yes
cd ../..

# Deploy do Wallet Service
echo "💰 Fazendo deploy do Wallet Service..."
cd services/wallet-service
vercel --prod --yes
cd ../..

# Deploy do KYC Service
echo "📋 Fazendo deploy do KYC Service..."
cd services/kyc
vercel --prod --yes
cd ../..

# Deploy do Liquidity Service
echo "💧 Fazendo deploy do Liquidity Service..."
cd services/liquidity
vercel --prod --yes
cd ../..

# Deploy do Notification Service
echo "📱 Fazendo deploy do Notification Service..."
cd services/notification-service
vercel --prod --yes
cd ../..

echo "✅ Deploy do backend concluído com sucesso!"
echo "🌐 Acesse os serviços nas URLs fornecidas pela Vercel"
