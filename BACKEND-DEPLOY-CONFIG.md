# Configuração de Deploy do Backend - Mainnet

## Variáveis de Ambiente Necessárias

Configure estas variáveis no painel da Vercel para cada serviço:

### Configurações Gerais
```bash
NODE_ENV=production
NETWORK=mainnet
```

### Configurações de Rede
```bash
ETHEREUM_RPC_URL=https://eth.llamarpc.com
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

### Configurações de Banco de Dados
```bash
DATABASE_URL=postgresql://username:password@host:5432/crypto_wallet_mainnet
REDIS_URL=redis://username:password@host:6379
```

### Configurações de Segurança
```bash
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

### Configurações de API Externa
```bash
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
BSCSCAN_API_KEY=your_bscscan_api_key
```

### Configurações de WhatsApp
```bash
WHATSAPP_TOKEN=your_whatsapp_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### Configurações de Email
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Configurações de AWS S3
```bash
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=crypto-wallet-mainnet
```

### Configurações de Monitoramento
```bash
SENTRY_DSN=your_sentry_dsn
LOG_LEVEL=info
```

### Configurações de Rate Limiting
```bash
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Configurações de CORS
```bash
CORS_ORIGIN=https://crypto-wallet-admin.vercel.app
CORS_CREDENTIALS=true
```

## URLs dos Serviços

Após o deploy, os serviços estarão disponíveis em:

- **Auth Service:** https://crypto-wallet-backend.vercel.app/auth
- **Wallet Service:** https://crypto-wallet-backend.vercel.app/wallet
- **KYC Service:** https://crypto-wallet-backend.vercel.app/kyc
- **Liquidity Service:** https://crypto-wallet-backend.vercel.app/liquidity
- **Notification Service:** https://crypto-wallet-backend.vercel.app/notifications
