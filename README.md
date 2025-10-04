# Notus - Fintech Crypto Wallet com WhatsApp

Sistema completo de carteira digital criptográfica com integração WhatsApp, painel administrativo e microserviços.

## 🚀 Visão Geral

O Notus é uma plataforma fintech completa que oferece uma carteira digital segura para criptomoedas com integração WhatsApp, permitindo que usuários gerenciem seus ativos digitais através de uma interface intuitiva e acessível.

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
- **Polygon** (L2)
- **Binance Smart Chain** (BSC)
- **Smart Contracts** em Solidity

### DevOps
- **Docker** e **Docker Compose**
- **GitHub Actions** (CI/CD)
- **Kubernetes** (produção)
- **Prometheus** + **Grafana** (monitoramento)

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

### Desenvolvimento
```bash
docker-compose up -d
```

### Produção
```bash
# Kubernetes
kubectl apply -f infrastructure/kubernetes/

# Docker Swarm
docker stack deploy -c docker-compose.swarm.yml notus
```

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

## 🏆 Status do Projeto

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-85%25-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-orange)

---

**Notus** - Revolucionando o acesso às criptomoedas através do WhatsApp 🚀