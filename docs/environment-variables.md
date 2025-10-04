# Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para cada serviço do projeto.

## Serviço de Autenticação (auth-service)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/auth_service?schema=public"

# JWT
JWT_SECRET="seu_jwt_secret_aqui"
JWT_EXPIRES_IN="7d"

# Configurações do servidor
PORT=3333
NODE_ENV="development"

# Redis (para cache de sessão)
REDIS_URL="redis://localhost:6379"

# SMTP (para envio de emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu_email@gmail.com"
SMTP_PASS="sua_senha_aqui"

# WhatsApp
WHATSAPP_API_URL="http://localhost:3337"
WHATSAPP_API_KEY="seu_api_key_aqui"

# Twilio (para SMS)
TWILIO_ACCOUNT_SID="seu_account_sid_aqui"
TWILIO_AUTH_TOKEN="seu_auth_token_aqui"
TWILIO_PHONE_NUMBER="+5511999999999"
```

## Serviço de Carteira (wallet-service)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wallet_service?schema=public"

# Configurações do servidor
PORT=3334
NODE_ENV="development"

# Blockchain
RPC_URL="https://mainnet.infura.io/v3/seu_project_id_aqui"
CHAIN_ID=1

# CoinGecko API (para preços)
COINGECKO_API_KEY="seu_api_key_aqui"

# Redis (para cache)
REDIS_URL="redis://localhost:6379"

# Notificações
NOTIFICATION_SERVICE_URL="http://localhost:3337"
NOTIFICATION_API_KEY="seu_api_key_aqui"
```

## Serviço de KYC (kyc-service)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kyc_service?schema=public"

# Configurações do servidor
PORT=3335
NODE_ENV="development"

# AWS S3 (para armazenamento de documentos)
AWS_ACCESS_KEY_ID="sua_access_key_aqui"
AWS_SECRET_ACCESS_KEY="sua_secret_key_aqui"
AWS_REGION="us-east-1"
AWS_BUCKET_NAME="seu_bucket_aqui"

# Serviços de verificação
WORLDCHECK_API_KEY="seu_api_key_aqui"
JUMIO_API_KEY="seu_api_key_aqui"
JUMIO_API_SECRET="seu_api_secret_aqui"
```

## Serviço de Liquidez (liquidity-service)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/liquidity_service?schema=public"

# Configurações do servidor
PORT=3336
NODE_ENV="development"

# Blockchain
RPC_URL="https://mainnet.infura.io/v3/seu_project_id_aqui"
CHAIN_ID=1

# DEX APIs
UNISWAP_ROUTER="0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
SUSHISWAP_ROUTER="0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"

# Oráculos
CHAINLINK_FEED_REGISTRY="0x47Fb2585D2C56Fe188D0E6ec628a38b74fCeeeDf"
```

## Serviço de Notificação (notification-service)

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notification_service?schema=public"

# Configurações do servidor
PORT=3337
NODE_ENV="development"

# Firebase (para notificações push)
FIREBASE_PROJECT_ID="seu_project_id_aqui"
FIREBASE_PRIVATE_KEY="sua_private_key_aqui"
FIREBASE_CLIENT_EMAIL="seu_client_email@aqui"

# WhatsApp
WHATSAPP_API_URL="http://localhost:3338"
WHATSAPP_API_KEY="seu_api_key_aqui"

# SMTP (para emails)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="seu_email@gmail.com"
SMTP_PASS="sua_senha_aqui"

# Twilio (para SMS)
TWILIO_ACCOUNT_SID="seu_account_sid_aqui"
TWILIO_AUTH_TOKEN="seu_auth_token_aqui"
TWILIO_PHONE_NUMBER="+5511999999999"
```

## Frontend Admin (crypto-wallet-admin)

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3333"
NEXT_PUBLIC_ENVIRONMENT="development"

# Web3
NEXT_PUBLIC_RPC_URL="https://mainnet.infura.io/v3/seu_project_id_aqui"
NEXT_PUBLIC_CHAIN_ID=1
```

## Configuração

1. Copie as variáveis relevantes para um arquivo `.env` em cada serviço
2. Substitua os valores de exemplo pelos valores reais
3. Nunca comite arquivos `.env` no repositório
4. Mantenha backups seguros das suas variáveis de ambiente
5. Use diferentes valores para ambientes de desenvolvimento, staging e produção
