# Guia de Integração com Notus API

Este guia fornece instruções detalhadas para integrar o sistema Notus Crypto Wallet com a API oficial do Notus para Account Abstraction, Smart Wallets e funcionalidades DeFi.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração Inicial](#configuração-inicial)
- [Autenticação](#autenticação)
- [Smart Wallets](#smart-wallets)
- [Transações Gasless](#transações-gasless)
- [DeFi Integration](#defi-integration)
- [Webhooks](#webhooks)
- [Exemplos de Código](#exemplos-de-código)
- [Troubleshooting](#troubleshooting)

## 🚀 Visão Geral

A [Notus API](https://docs.notus.team/docs/guides) oferece uma plataforma completa para Account Abstraction, permitindo:

- **Smart Wallets ERC-4337**: Criação e gerenciamento de carteiras inteligentes
- **Autenticação Social**: Login com Google, Apple ID e outros provedores
- **Transações Gasless**: Execução de transações sem necessidade de gas
- **DeFi Operations**: Swaps, cross-chain swaps e liquidity pools
- **KYC/Compliance**: Verificação de identidade e compliance automático
- **Webhooks**: Notificações em tempo real de eventos blockchain

## ⚙️ Configuração Inicial

### 1. Obter Credenciais da API

```bash
# Solicitar acesso em: https://docs.notus.team/docs/guides
# Obter:
# - API Key
# - Secret Key
# - Webhook Secret
```

### 2. Configurar Variáveis de Ambiente

```bash
# .env
NOTUS_API_KEY=your_api_key_here
NOTUS_SECRET_KEY=your_secret_key_here
NOTUS_WEBHOOK_SECRET=your_webhook_secret_here
NOTUS_BASE_URL=https://api.notus.team/v1
```

### 3. Instalar SDK (quando disponível)

```bash
npm install @notus/sdk
# ou
yarn add @notus/sdk
```

## 🔐 Autenticação

### Social Login

```typescript
import { NotusClient } from '@notus/sdk';

const notus = new NotusClient({
  apiKey: process.env.NOTUS_API_KEY,
  secretKey: process.env.NOTUS_SECRET_KEY,
});

// Login com Google
const authResult = await notus.auth.socialLogin({
  provider: 'google',
  token: googleAccessToken,
  userInfo: {
    email: 'user@example.com',
    name: 'User Name'
  }
});

// Login com Apple ID
const authResult = await notus.auth.socialLogin({
  provider: 'apple',
  token: appleIdToken,
  userInfo: {
    email: 'user@example.com',
    name: 'User Name'
  }
});
```

### Refresh Token

```typescript
// Renovar token de acesso
const newTokens = await notus.auth.refreshToken({
  refreshToken: userRefreshToken
});
```

## 💼 Smart Wallets

### Criar Smart Wallet

```typescript
// Criar carteira inteligente para usuário
const wallet = await notus.wallets.create({
  userId: authResult.userId,
  chainId: 1, // Ethereum
  socialRecovery: true,
  multiSig: false
});

console.log('Smart Wallet criada:', wallet.address);
```

### Gerenciar Carteiras

```typescript
// Listar carteiras do usuário
const wallets = await notus.wallets.list({
  userId: authResult.userId
});

// Obter saldo
const balance = await notus.wallets.getBalance({
  walletId: wallet.id,
  chainId: 1
});
```

## ⛽ Transações Gasless

### Enviar Transação Gasless

```typescript
// Transferir tokens sem gas
const txResult = await notus.transactions.send({
  walletId: wallet.id,
  to: '0x742d35Cc6634C0532925a3b8D0C0C1C2C3C4C5C6',
  amount: '1000000000000000000', // 1 ETH em wei
  token: 'ETH',
  gasless: true
});
```

### Batch Operations

```typescript
// Múltiplas operações em uma transação
const batchResult = await notus.transactions.batch({
  walletId: wallet.id,
  operations: [
    {
      type: 'transfer',
      to: '0x742d35Cc6634C0532925a3b8D0C0C1C2C3C4C5C6',
      amount: '1000000000000000000',
      token: 'ETH'
    },
    {
      type: 'swap',
      from: 'USDC',
      to: 'ETH',
      amount: '1000000000' // 1000 USDC
    }
  ],
  gasless: true
});
```

## 🔄 DeFi Integration

### Token Swap

```typescript
// Fazer swap de tokens
const swapResult = await notus.defi.swap({
  walletId: wallet.id,
  fromToken: 'USDC',
  toToken: 'ETH',
  amount: '1000000000', // 1000 USDC
  slippage: 0.5, // 0.5%
  chainId: 1
});
```

### Cross-Chain Swap

```typescript
// Swap entre diferentes blockchains
const crossChainSwap = await notus.defi.crossChainSwap({
  walletId: wallet.id,
  fromChain: 1, // Ethereum
  toChain: 137, // Polygon
  fromToken: 'USDC',
  toToken: 'USDC',
  amount: '1000000000'
});
```

### Liquidity Pools

```typescript
// Adicionar liquidez
const liquidityResult = await notus.defi.addLiquidity({
  walletId: wallet.id,
  poolId: 'usdc-eth-pool',
  tokenA: 'USDC',
  tokenB: 'ETH',
  amountA: '1000000000',
  amountB: '1000000000000000000'
});
```

## 🔔 Webhooks

### Configurar Webhook

```typescript
// Registrar webhook para eventos
const webhook = await notus.webhooks.register({
  url: 'https://your-app.com/webhooks/notus',
  events: [
    'transaction.completed',
    'transaction.failed',
    'wallet.created',
    'kyc.verified'
  ],
  secret: process.env.NOTUS_WEBHOOK_SECRET
});
```

### Processar Eventos

```typescript
// Endpoint para receber webhooks
app.post('/webhooks/notus', (req, res) => {
  const signature = req.headers['x-notus-signature'];
  const payload = req.body;
  
  // Verificar assinatura
  if (!notus.webhooks.verifySignature(payload, signature)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Processar evento
  switch (payload.event) {
    case 'transaction.completed':
      handleTransactionCompleted(payload.data);
      break;
    case 'kyc.verified':
      handleKycVerified(payload.data);
      break;
  }
  
  res.status(200).send('OK');
});
```

## 🛡️ KYC & Compliance

### Verificação KYC

```typescript
// Iniciar processo KYC
const kycSession = await notus.kyc.start({
  userId: authResult.userId,
  walletId: wallet.id,
  documents: {
    idFront: 'base64_encoded_image',
    idBack: 'base64_encoded_image',
    selfie: 'base64_encoded_image'
  }
});

// Verificar status
const status = await notus.kyc.getStatus({
  sessionId: kycSession.id
});
```

## 📊 Analytics

### Obter Métricas

```typescript
// Analytics do usuário
const analytics = await notus.analytics.getUserMetrics({
  userId: authResult.userId,
  period: '30d'
});

// Analytics da plataforma
const platformAnalytics = await notus.analytics.getPlatformMetrics({
  period: '7d'
});
```

## 🔧 Exemplos de Código

### Integração Completa

```typescript
import { NotusClient } from '@notus/sdk';

class NotusIntegration {
  private notus: NotusClient;
  
  constructor() {
    this.notus = new NotusClient({
      apiKey: process.env.NOTUS_API_KEY,
      secretKey: process.env.NOTUS_SECRET_KEY,
    });
  }
  
  async createUserWallet(userId: string, socialToken: string) {
    // 1. Autenticar usuário
    const auth = await this.notus.auth.socialLogin({
      provider: 'google',
      token: socialToken
    });
    
    // 2. Criar smart wallet
    const wallet = await this.notus.wallets.create({
      userId: auth.userId,
      chainId: 1,
      socialRecovery: true
    });
    
    // 3. Configurar webhook
    await this.notus.webhooks.register({
      url: `${process.env.APP_URL}/webhooks/notus`,
      events: ['transaction.completed', 'kyc.verified']
    });
    
    return { auth, wallet };
  }
  
  async sendGaslessTransaction(walletId: string, to: string, amount: string) {
    return await this.notus.transactions.send({
      walletId,
      to,
      amount,
      gasless: true
    });
  }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação**
   ```bash
   # Verificar credenciais
   curl -H "Authorization: Bearer $NOTUS_API_KEY" \
        https://api.notus.team/v1/auth/me
   ```

2. **Webhook não recebido**
   ```bash
   # Testar webhook localmente
   ngrok http 3000
   # Atualizar URL no painel Notus
   ```

3. **Transação falhou**
   ```typescript
   // Verificar saldo e permissões
   const balance = await notus.wallets.getBalance({
     walletId: walletId,
     chainId: 1
   });
   ```

### Logs e Debug

```typescript
// Habilitar logs detalhados
const notus = new NotusClient({
  apiKey: process.env.NOTUS_API_KEY,
  secretKey: process.env.NOTUS_SECRET_KEY,
  debug: true,
  logLevel: 'debug'
});
```

## 📚 Recursos Adicionais

- [Documentação Oficial Notus](https://docs.notus.team/docs/guides)
- [Account Abstraction Guide](https://docs.notus.team/docs/guides/account-abstraction)
- [Smart Wallets Documentation](https://docs.notus.team/docs/guides/smart-wallets)
- [DeFi Integration Guide](https://docs.notus.team/docs/guides/defi)
- [Webhook Documentation](https://docs.notus.team/docs/guides/webhook)

## 🆘 Suporte

- **Email**: [support@notus.team](mailto:support@notus.team)
- **Discord**: [Notus Community](https://discord.gg/notus)
- **GitHub**: [Notus Labs](https://github.com/notus-labs)

---

**Nota**: Este guia é baseado na documentação oficial da Notus API. Para informações mais atualizadas, consulte sempre a [documentação oficial](https://docs.notus.team/docs/guides).
