#!/bin/bash

# Script de Deploy Automático para Vercel - Mainnet
echo "🚀 Iniciando deploy automático para Vercel..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório crypto-wallet-admin"
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

# Build de produção
echo "🔨 Executando build de produção..."
npm run build:production

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Verifique os logs acima."
    exit 1
fi

# Deploy para produção
echo "🚀 Fazendo deploy para produção..."
vercel --prod --yes

if [ $? -eq 0 ]; then
    echo "✅ Deploy concluído com sucesso!"
    echo "🌐 Acesse sua aplicação na URL fornecida pela Vercel"
else
    echo "❌ Erro no deploy. Verifique os logs acima."
    exit 1
fi
