# API Documentation - Notus

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints por Serviço](#endpoints-por-serviço)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Erro](#códigos-de-erro)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

## 🔍 Visão Geral

A API do Notus é baseada em REST e utiliza JSON para comunicação. Todos os endpoints seguem padrões RESTful e retornam respostas consistentes.

### Base URLs
- **Desenvolvimento**: `http://localhost:3333`
- **Staging**: `https://api-staging.notus.com`
- **Produção**: `https://api.notus.com`

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-API-Version: v1
```

## 🔐 Autenticação

### Login
```http
POST /auth/login
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600
  }
}
```

### Registro
```http
POST /auth/register
```

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+5511999999999"
}
```

### 2FA
```http
POST /auth/verify-2fa
```

**Request:**
```json
{
  "code": "123456",
  "type": "sms"
}
```

## 🏦 Auth Service (Porta 3333)

### Usuários
```http
GET /users                    # Listar usuários
GET /users/:id               # Obter usuário
PUT /users/:id              # Atualizar usuário
DELETE /users/:id            # Deletar usuário
POST /users/:id/block        # Bloquear usuário
POST /users/:id/unblock      # Desbloquear usuário
```

### Estatísticas
```http
GET /users/stats             # Estatísticas de usuários
```

**Response:**
```json
{
  "totalUsers": 1000,
  "activeUsers": 850,
  "verifiedUsers": 800,
  "kycApproved": 750,
  "twoFactorEnabled": 600,
  "whatsappVerified": 700,
  "newUsersLast30Days": 150
}
```

## 💼 Wallet Service (Porta 3334)

### Carteiras
```http
GET /wallets                  # Listar carteiras
GET /wallets/:id             # Obter carteira
POST /wallets                # Criar carteira
PUT /wallets/:id            # Atualizar carteira
DELETE /wallets/:id          # Deletar carteira
POST /wallets/:id/block     # Bloquear carteira
POST /wallets/:id/unblock   # Desbloquear carteira
POST /wallets/:id/refresh-balance  # Atualizar saldo
```

### Tokens
```http
GET /tokens                   # Listar tokens
GET /tokens/:id              # Obter token
POST /tokens                 # Criar token
PUT /tokens/:id             # Atualizar token
DELETE /tokens/:id          # Deletar token
POST /tokens/:id/block     # Bloquear token
POST /tokens/:id/unblock   # Desbloquear token
POST /tokens/:id/refresh-price  # Atualizar preço
```

### Transações
```http
GET /transactions            # Listar transações
GET /transactions/:id        # Obter transação
POST /transactions          # Criar transação
GET /transactions/stats      # Estatísticas
```

## 🛡️ KYC Service (Porta 3335)

### Documentos
```http
GET /documents               # Listar documentos
POST /documents             # Upload documento
GET /documents/:id          # Obter documento
PUT /documents/:id          # Atualizar documento
DELETE /documents/:id       # Deletar documento
```

### Verificações
```http
GET /verifications          # Listar verificações
POST /verifications         # Iniciar verificação
GET /verifications/:id      # Obter verificação
PUT /verifications/:id      # Atualizar verificação
```

### Auditoria
```http
GET /audit-logs             # Logs de auditoria
GET /risk-scores            # Pontuações de risco
GET /blacklist              # Lista negra
```

## 💧 Liquidity Service (Porta 3336)

### Pools
```http
GET /pools                  # Listar pools
GET /pools/:id              # Obter pool
POST /pools                 # Criar pool
PUT /pools/:id             # Atualizar pool
```

### Posições
```http
GET /positions              # Listar posições
GET /positions/:id          # Obter posição
POST /positions            # Criar posição
PUT /positions/:id         # Atualizar posição
```

### Swaps
```http
GET /swaps                  # Listar swaps
POST /swaps                 # Executar swap
GET /swaps/:id              # Obter swap
```

### Oráculos
```http
GET /prices                 # Preços de tokens
GET /prices/:token          # Preço específico
POST /prices/refresh        # Atualizar preços
```

## 📱 Notification Service (Porta 3337)

### Notificações
```http
GET /notifications          # Listar notificações
POST /notifications         # Criar notificação
GET /notifications/:id      # Obter notificação
PUT /notifications/:id     # Atualizar notificação
DELETE /notifications/:id   # Deletar notificação
```

### Canais
```http
GET /channels               # Listar canais
POST /channels              # Criar canal
PUT /channels/:id          # Atualizar canal
DELETE /channels/:id        # Deletar canal
```

### Templates
```http
GET /templates              # Listar templates
POST /templates             # Criar template
PUT /templates/:id         # Atualizar template
DELETE /templates/:id       # Deletar template
```

## 📊 Modelos de Dados

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'blocked';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  whatsappVerified: boolean;
  kycStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}
```

### Wallet
```typescript
interface Wallet {
  id: string;
  address: string;
  network: string;
  balance: {
    native: string;
    usd: number;
  };
  status: 'active' | 'inactive' | 'blocked';
  lastActivity: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

### Token
```typescript
interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  network: string;
  price: {
    usd: number;
    brl: number;
    change24h: number;
  };
  volume24h: number;
  marketCap: number;
  status: 'active' | 'inactive' | 'blocked';
  createdAt: string;
  updatedAt: string;
}
```

### Transaction
```typescript
interface Transaction {
  id: string;
  walletId: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  amountUsd: number;
  token: {
    symbol: string;
    address: string;
  };
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  fromAddress: string;
  toAddress: string;
  gasUsed: number;
  gasPrice: string;
  blockNumber: number;
  createdAt: string;
  updatedAt: string;
}
```

## ❌ Códigos de Erro

### HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Error Codes
- `VALIDATION_ERROR` - Dados de entrada inválidos
- `AUTHENTICATION_REQUIRED` - Token de autenticação necessário
- `INSUFFICIENT_PERMISSIONS` - Permissões insuficientes
- `RESOURCE_NOT_FOUND` - Recurso não encontrado
- `RATE_LIMIT_EXCEEDED` - Limite de requisições excedido
- `INTERNAL_SERVER_ERROR` - Erro interno do servidor

## 🚦 Rate Limiting

### Limites por Endpoint
- **Auth endpoints**: 5 req/min por IP
- **Wallet endpoints**: 100 req/min por usuário
- **KYC endpoints**: 10 req/min por usuário
- **Notification endpoints**: 50 req/min por usuário

### Headers de Rate Limiting
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔗 Webhooks

### Configuração
```http
POST /webhooks
```

**Request:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["transaction.created", "user.verified"],
  "secret": "webhook_secret"
}
```

### Eventos Disponíveis
- `user.created` - Usuário criado
- `user.verified` - Usuário verificado
- `transaction.created` - Transação criada
- `transaction.confirmed` - Transação confirmada
- `wallet.created` - Carteira criada
- `kyc.approved` - KYC aprovado
- `kyc.rejected` - KYC rejeitado

### Webhook Payload
```json
{
  "id": "webhook_id",
  "event": "transaction.created",
  "data": {
    "transaction": {
      "id": "tx_id",
      "amount": "1.5",
      "token": "ETH"
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

**Notus API** - Documentação completa da API 🚀
