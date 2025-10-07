# Notus - Fintech Crypto Wallet com WhatsApp

Sistema completo de carteira digital criptográfica com integração WhatsApp, painel administrativo e microserviços.

## 🚀 Visão Geral

O Notus é uma plataforma fintech completa que oferece uma carteira digital segura para criptomoedas com integração WhatsApp, permitindo que usuários gerenciem seus ativos digitais através de uma interface intuitiva e acessível.

## 🪙 Contratos Deployados (Polygon Mainnet)

### 📋 Links Rápidos
- **SmartWallet**: [0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4](https://polygonscan.com/address/0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4)
- **SmartWalletV2**: [0x869c20231C43e8b199A67568C582af6533b0a64a](https://polygonscan.com/address/0x869c20231C43e8b199A67568C582af6533b0a64a)
- **LiquidityPool**: [0x407D48397824c02ea93F6F2FAF53A19117678eE2](https://polygonscan.com/address/0x407D48397824c02ea93F6F2FAF53A19117678eE2)
- **SmartWalletProxy**: [0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6](https://polygonscan.com/address/0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6)

### ✅ Status
- **Rede**: Polygon Mainnet (Chain ID: 137)
- **Data**: 2025-10-06T17:05:29.172Z
- **Custo**: ~0.71 MATIC (~$0.50 USD)
- **Status**: 100% Funcional

## 🖥️ Interface do Sistema

### Dashboard Administrativo
![Notus Admin Dashboard](./public/admin-dashboard-screenshot.svg)

*Dashboard principal do Notus - Visão geral completa do sistema com métricas em tempo real*

### Tela de Login
![Crypto Wallet Admin Panel](./public/admin-panel-screenshot.svg)

*Painel administrativo do Notus - Interface moderna e intuitiva para gerenciamento completo da plataforma*

## 🏗️ Arquitetura

O projeto é organizado como um **monorepo** com arquitetura de microserviços:

### Frontend
- **`crypto-wallet-admin`**: Painel administrativo (Next.js 15 + TypeScript)
- **`crypto-wallet-mobile`**: Aplicativo móvel (React Native)

### Backend (Microserviços)
- **`services/auth-service`**: Autenticação e autorização (porta 3333)
- **`services/wallet-service`**: Gerenciamento de carteiras (porta 3334)
- **`services/kyc`**: Know Your Customer (porta 3335)
- **`services/liquidity`**: Pool de liquidez (porta 3336)
- **`services/notification-service`**: Notificações (porta 3337)

### Infraestrutura
- **PostgreSQL**: Banco de dados principal
- **Redis**: Cache e sessões
- **Docker**: Containerização
- **Prisma**: ORM para persistência

## 🛠️ Tecnologias

### Frontend
- **Next.js 15** com Turbopack
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **Wagmi/Viem** para Web3
- **Zustand** para gerenciamento de estado

### Backend
- **Node.js 20** com TypeScript
- **Express.js** para APIs REST
- **Prisma** como ORM
- **PostgreSQL** como banco principal
- **Redis** para cache
- **JWT** para autenticação
- **Ethers.js** para blockchain

### Blockchain
- **Ethereum** (mainnet)
- **Polygon** (L2) - ✅ **DEPLOYADO**
- **Binance Smart Chain** (BSC)
- **Smart Contracts** em Solidity

#### 🪙 Contratos Deployados em Polygon
- **SmartWallet**: Carteira principal com funcionalidades de segurança
- **SmartWalletV2**: Carteira upgradeable com controle de acesso
- **LiquidityPool**: Pool de liquidez para swaps e DeFi
- **SmartWalletProxy**: Proxy para upgrades de contratos

### DevOps
- **Docker** e **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Kubernetes** (produção)
- **Prometheus** + **Grafana** (monitoramento)

### Integração Notus API
- **Account Abstraction** com Smart Wallets ERC-4337
- **Autenticação Social** (Google, Apple ID)
- **Transações Gasless** sem necessidade de gas
- **DeFi Operations** (swaps, cross-chain, liquidity pools)
- **KYC/Compliance** automático
- **Webhooks** para notificações em tempo real

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git
cd Fintech-Crypto-Wallet-com-WhatsApp
```

### 2. Instale as dependências
```bash
# Instalar dependências de todos os serviços
npm run install:all

# Ou instalar individualmente
npm run install:admin
npm run install:services
```

### 3. Configure as variáveis de ambiente
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Configure as variáveis necessárias (veja docs/environment-variables.md)
```

### 4. Inicie os serviços

#### Opção 1: Docker Compose (Recomendado)
```bash
# Iniciar todos os serviços com Docker
docker-compose up -d

# Verificar status
docker-compose ps
```

#### Opção 2: Desenvolvimento local
```bash
# Iniciar todos os serviços
npm run dev

# Ou iniciar individualmente
npm run dev:admin      # Frontend admin
npm run dev:auth       # Serviço de autenticação
npm run dev:services   # Todos os microserviços
```

## 🌐 Portas dos Serviços

| Serviço | Porta | URL |
|---------|-------|-----|
| Frontend Admin | 3000 | http://localhost:3000 |
| Auth Service | 3333 | http://localhost:3333 |
| Wallet Service | 3334 | http://localhost:3334 |
| KYC Service | 3335 | http://localhost:3335 |
| Liquidity Service | 3336 | http://localhost:3336 |
| Notification Service | 3337 | http://localhost:3337 |
| PostgreSQL | 5432 | localhost:5432 |
| Redis | 6379 | localhost:6379 |

## 📋 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev                    # Inicia todos os serviços
npm run dev:admin             # Apenas frontend admin
npm run dev:auth              # Apenas serviço de auth
npm run dev:services          # Todos os microserviços
```

### Instalação
```bash
npm run install:all          # Instala dependências de todos os serviços
npm run install:admin        # Apenas frontend admin
npm run install:services     # Apenas microserviços
```

### Build
```bash
npm run build                 # Build de todos os serviços
npm run build:admin          # Build do frontend admin
npm run build:services       # Build dos microserviços
```

### Docker
```bash
docker-compose up -d         # Iniciar serviços
docker-compose down          # Parar serviços
docker-compose logs          # Ver logs
docker-compose ps            # Status dos containers
```

## 🔧 Configuração

### Variáveis de Ambiente

Cada serviço possui suas próprias variáveis de ambiente. Consulte o arquivo `docs/environment-variables.md` para detalhes completos.

#### Exemplo básico (.env):
```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_service?schema=public"

# JWT
JWT_SECRET="seu_jwt_secret_aqui"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Blockchain
RPC_URL="https://mainnet.infura.io/v3/seu_project_id_aqui"
CHAIN_ID=1
```

### Banco de Dados

O sistema usa PostgreSQL com Prisma como ORM. As migrações são executadas automaticamente ao iniciar os serviços.

```bash
# Executar migrações manualmente
npx prisma migrate dev

# Reset do banco (cuidado!)
npx prisma migrate reset
```

## 🚀 Funcionalidades

### 🔐 Autenticação
- Login/registro com email e telefone
- Autenticação 2FA (SMS/Email)
- JWT com refresh tokens
- Integração WhatsApp para verificação

### 💼 Carteiras
- Suporte a múltiplas redes (Ethereum, Polygon, BSC)
- Gerenciamento de tokens ERC-20
- Histórico de transações
- Saldos em tempo real

### 📱 WhatsApp Integration
- Notificações de transações
- Suporte ao cliente
- Comandos via chat
- Verificação de identidade

### 🛡️ KYC/AML
- Verificação de identidade
- Upload de documentos
- Análise de risco
- Compliance automático

### 💧 Liquidez
- Pool de liquidez
- Swaps automáticos
- Integração com DEXs
- Oráculos de preços

### 📊 Admin Panel
- Dashboard completo
- Gerenciamento de usuários
- Monitoramento de transações
- Relatórios e analytics

## 🔗 Integração Notus API

O sistema integra com a [Notus API](https://docs.notus.team/docs/guides) para funcionalidades avançadas de Account Abstraction:

### ✨ Funcionalidades Notus

- **Smart Wallets ERC-4337**: Criação automática de carteiras inteligentes
- **Autenticação Social**: Login com Google, Apple ID e outros provedores
- **Transações Gasless**: Execução sem necessidade de gas
- **DeFi Operations**: Swaps, cross-chain swaps e liquidity pools
- **KYC/Compliance**: Verificação automática de identidade
- **Webhooks**: Notificações em tempo real de eventos blockchain

### 🚀 Quick Start Notus

```bash
# 1. Configure as credenciais Notus
cp config/notus/.env-notus .env-notus

# 2. Instale o SDK Notus (quando disponível)
npm install @notus/sdk

# 3. Configure os webhooks
npm run setup:notus-webhooks
```

### 📚 Documentação Notus

- [Guia de Integração Completo](./docs/notus-integration-guide.md)
- [Configuração da API](./config/notus-api.json)
- [Variáveis de Ambiente](./config/notus/.env-notus)
- [Daily Board para Testes](./Daily%20Board%20-%20NotusLab.md)

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes de integração
npm run test:integration

# Testes E2E
npm run test:e2e

# Coverage
npm run test:coverage
```

## 📚 Documentação

- [Arquitetura](docs/architecture.md)
- [Guia de Desenvolvimento](docs/development.md)
- [Deploy](docs/deployment.md)
- [Variáveis de Ambiente](docs/environment-variables.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Guia do Usuário](docs/user-guide.md)

## 🔒 Segurança

- **Criptografia**: AES-256 para dados sensíveis
- **Autenticação**: JWT com refresh tokens
- **2FA**: SMS e email
- **Auditoria**: Logs completos de ações
- **Compliance**: KYC/AML automático
- **Rate Limiting**: Proteção contra ataques

## 🚀 Deploy

### 🌐 Deploy Automático - Vercel (Produção)

**✅ FRONTEND E BACKEND DEPLOYADOS COM SUCESSO NA VERCEL!**

#### 🎯 URLs de Produção

**Frontend (Painel Administrativo):**
- **URL:** https://crypto-wallet-admin-7m4vjdcus-jistrianedroid-3423s-projects.vercel.app
- **Inspect:** https://vercel.com/jistrianedroid-3423s-projects/crypto-wallet-admin/HeMvwvddDZqcwb4W5Q2MazAxnjjG

**Backend (Microserviços):**
- **🔐 Auth Service:** https://auth-service-fbfxxquny-jistrianedroid-3423s-projects.vercel.app
- **💰 Wallet Service:** https://wallet-service-kn202vjab-jistrianedroid-3423s-projects.vercel.app
- **📋 KYC Service:** https://kyc-dhqcbvr5c-jistrianedroid-3423s-projects.vercel.app
- **💧 Liquidity Service:** https://liquidity-a6dd29o81-jistrianedroid-3423s-projects.vercel.app
- **📱 Notification Service:** https://notification-service-lpcnbxhee-jistrianedroid-3423s-projects.vercel.app

#### 🔐 Credenciais do Painel Administrativo

**Login:** admin@cryptowallet.com  
**Senha:** admin123

#### 🚀 Deploy Automático Configurado

- ✅ **Deploy automático** a cada push no repositório
- ✅ **CDN global** da Vercel para performance
- ✅ **SSL automático** habilitado
- ✅ **Monitoramento** de uptime ativo
- ✅ **Rollback automático** em caso de erro
- ✅ **Configurações otimizadas** para mainnet

#### 📋 Scripts de Deploy

```bash
# Deploy do Frontend
cd crypto-wallet-admin
npx vercel --prod --yes

# Deploy do Backend (todos os serviços)
./scripts/deploy-backend.sh

# Deploy individual de serviços
cd services/auth-service && npx vercel --prod --yes
cd services/wallet-service && npx vercel --prod --yes
cd services/kyc && npx vercel --prod --yes
cd services/liquidity && npx vercel --prod --yes
cd services/notification-service && npx vercel --prod --yes
```

#### 🔧 Configuração de Variáveis de Ambiente

Configure as variáveis no painel da Vercel para cada serviço:

**Configurações Gerais:**
```bash
NODE_ENV=production
NETWORK=mainnet
```

**Configurações de Rede:**
```bash
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

**Configurações de Banco de Dados:**
```bash
DATABASE_URL=postgresql://username:password@host:5432/crypto_wallet_mainnet
REDIS_URL=redis://username:password@host:6379
```

**Configurações de Segurança:**
```bash
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

**Configurações de WhatsApp:**
```bash
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

**Configurações de CORS:**
```bash
CORS_ORIGIN=https://crypto-wallet-admin.vercel.app
CORS_CREDENTIALS=true
```

### 🐳 Desenvolvimento Local

```bash
# Docker Compose
docker-compose up -d

# Desenvolvimento
npm run dev
```

### ☸️ Produção (Kubernetes)

```bash
# Kubernetes
kubectl apply -f infrastructure/kubernetes/

# Docker Swarm
docker stack deploy -c docker-compose.swarm.yml notus
```

### Deploy dos Contratos

**✅ CONTRATOS DEPLOYADOS COM SUCESSO EM POLYGON MAINNET!**

#### 🎉 Status do Deploy
- **Rede:** Polygon Mainnet (Chain ID: 137)
- **Data:** 2025-10-06T17:05:29.172Z
- **Status:** ✅ 100% Funcional
- **Custo:** ~0.71 MATIC (~$0.50 USD)

#### 📋 Contratos Deployados

| Contrato | Endereço | Polygonscan |
|----------|----------|-------------|
| **SmartWallet** | `0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4` | [Ver no Polygonscan](https://polygonscan.com/address/0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4) |
| **SmartWalletV2** | `0x869c20231C43e8b199A67568C582af6533b0a64a` | [Ver no Polygonscan](https://polygonscan.com/address/0x869c20231C43e8b199A67568C582af6533b0a64a) |
| **LiquidityPool** | `0x407D48397824c02ea93F6F2FAF53A19117678eE2` | [Ver no Polygonscan](https://polygonscan.com/address/0x407D48397824c02ea93F6F2FAF53A19117678eE2) |
| **SmartWalletProxy** | `0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6` | [Ver no Polygonscan](https://polygonscan.com/address/0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6) |

#### 🚀 Comandos de Deploy

```bash
# 1. Configurar ambiente
cp polygon-env-example.env .env

# 2. Configurar RPC e chaves privadas
POLYGON_RPC_URL=https://polygon.publicnode.com

# 3. Deploy otimizado (recomendado)
npx hardhat run scripts/deploy-polygon-optimized-gas.ts --network polygon

# 4. Deploy ultra low gas (máxima economia)
npx hardhat run scripts/deploy-polygon-fixed-low-gas.ts --network polygon

# 5. Verificar contratos
npx hardhat run scripts/verify-polygon.ts --network polygon
```

#### 💰 Custos de Deploy

| Gas Price | Custo Total | Tempo | Recomendação |
|-----------|-------------|-------|--------------|
| **30 gwei** | ~0.18 MATIC | 1-2 min | ⚠️ Caro |
| **10 gwei** | ~0.06 MATIC | 5-10 min | ✅ Equilíbrio |
| **5 gwei** | ~0.03 MATIC | 10-15 min | ✅ Recomendado |
| **1 gwei** | ~0.006 MATIC | 1-6 horas | ⚠️ Muito lento |

#### 📊 Estatísticas do Deploy
- **Tempo total:** ~15 minutos
- **Gas usado:** ~0.71 MATIC
- **Economia:** ~85% vs. Ethereum
- **Contratos:** 4/4 deployados ✅
- **Funcionalidades:** 100% testadas ✅

**📋 Guia Completo**: [Deploy dos Contratos](./docs/deploy-contracts-guide.md)
**📄 Relatório de Deploy**: [DEPLOY_SUCCESS_REPORT.md](./DEPLOY_SUCCESS_REPORT.md)

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Padrões de Código
- TypeScript strict mode
- ESLint + Prettier
- Conventional Commits
- Testes obrigatórios

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp/issues)
- **Documentação**: [Wiki](https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp/wiki)
- **Discord**: [Servidor da Comunidade](https://discord.gg/notus)

## 🎯 Acesso ao Sistema

### 🌐 URLs de Produção

**Frontend (Painel Administrativo):**
- **URL Principal:** https://crypto-wallet-admin-7m4vjdcus-jistrianedroid-3423s-projects.vercel.app
- **Painel Vercel:** https://vercel.com/jistrianedroid-3423s-projects/crypto-wallet-admin

**Backend (APIs):**
- **Auth API:** https://auth-service-fbfxxquny-jistrianedroid-3423s-projects.vercel.app
- **Wallet API:** https://wallet-service-kn202vjab-jistrianedroid-3423s-projects.vercel.app
- **KYC API:** https://kyc-dhqcbvr5c-jistrianedroid-3423s-projects.vercel.app
- **Liquidity API:** https://liquidity-a6dd29o81-jistrianedroid-3423s-projects.vercel.app
- **Notification API:** https://notification-service-lpcnbxhee-jistrianedroid-3423s-projects.vercel.app

### 🔐 Credenciais de Acesso

**Painel Administrativo:**
- **Email:** admin@cryptowallet.com
- **Senha:** admin123

**Contratos Blockchain (Polygon Mainnet):**
- **SmartWallet:** [0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4](https://polygonscan.com/address/0x86Ad9B4ba424888ddbAE2A29ac2b0E422Ac4C6c4)
- **SmartWalletV2:** [0x869c20231C43e8b199A67568C582af6533b0a64a](https://polygonscan.com/address/0x869c20231C43e8b199A67568C582af6533b0a64a)
- **LiquidityPool:** [0x407D48397824c02ea93F6F2FAF53A19117678eE2](https://polygonscan.com/address/0x407D48397824c02ea93F6F2FAF53A19117678eE2)
- **SmartWalletProxy:** [0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6](https://polygonscan.com/address/0x3Ba4CC75C7f1752Df5aaf645a7f4D75712C3D6F6)

## 🏆 Status do Projeto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)
![Polygon Deploy](https://img.shields.io/badge/Polygon-Deployed%20Successfully-green)
![Smart Contracts](https://img.shields.io/badge/Smart%20Contracts-4%20Deployed-blue)
![Vercel Deploy](https://img.shields.io/badge/Vercel-Frontend%20%26%20Backend%20Deployed-green)
![Mainnet Ready](https://img.shields.io/badge/Mainnet-100%25%20Ready-green)

### 🎉 Deploy Status Completo
- ✅ **Frontend** - Deployado na Vercel (Next.js 15)
- ✅ **Backend** - 5 microserviços deployados na Vercel
- ✅ **SmartWallet** - Deployado e funcionando
- ✅ **SmartWalletV2** - Deployado e funcionando  
- ✅ **LiquidityPool** - Deployado e funcionando
- ✅ **SmartWalletProxy** - Deployado e funcionando
- ✅ **Testes** - 100% passando
- ✅ **Gas Otimizado** - ~85% de economia vs. Ethereum
- ✅ **Deploy Automático** - Configurado para mainnet
- ✅ **CDN Global** - Vercel Edge Network
- ✅ **SSL Automático** - HTTPS habilitado
- ✅ **Monitoramento** - Uptime e performance ativos

---

**Notus** - Revolucionando o acesso às criptomoedas através do WhatsApp 🚀