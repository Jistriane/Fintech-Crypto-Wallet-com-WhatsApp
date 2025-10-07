# Deploy Automático na Vercel - Mainnet

## Configuração do Deploy Automático

### 1. Configuração da Vercel

1. **Conecte o repositório à Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Faça login com sua conta GitHub
   - Clique em "New Project"
   - Selecione o repositório do projeto
   - Configure o diretório raiz como `crypto-wallet-admin`

### 2. Variáveis de Ambiente na Vercel

Configure as seguintes variáveis de ambiente no painel da Vercel:

```bash
# Configurações da API
NEXT_PUBLIC_API_URL=https://api.notus.finance

# Configurações Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui

# RPC URLs para Mainnet
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org

# Configurações de rede
NEXT_PUBLIC_DEFAULT_CHAIN=ethereum
NEXT_PUBLIC_NETWORK=mainnet

# URLs de exploradores
NEXT_PUBLIC_ETHERSCAN_URL=https://etherscan.io
NEXT_PUBLIC_POLYGONSCAN_URL=https://polygonscan.com
NEXT_PUBLIC_BSCSCAN_URL=https://bscscan.com

# Configurações de produção
NODE_ENV=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

### 3. Configurações de Build

O projeto está configurado para:
- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

### 4. Deploy Automático

O deploy automático será ativado quando:
- Push para a branch `main` (deploy de produção)
- Push para outras branches (deploy de preview)

### 5. Configurações de Domínio

Após o primeiro deploy, você pode:
- Configurar um domínio personalizado
- Configurar SSL automático
- Configurar CDN global

### 6. Monitoramento

- Acesse o painel da Vercel para monitorar deploys
- Configure alertas para falhas de build
- Monitore performance e uptime

## Comandos Úteis

```bash
# Deploy manual para produção
npm run deploy

# Deploy para preview
npm run deploy:preview

# Build local para teste
npm run build:production
```

## Troubleshooting

### Problemas Comuns:

1. **Erro de build:** Verifique se todas as variáveis de ambiente estão configuradas
2. **Erro de API:** Verifique se a URL da API está correta
3. **Erro de Web3:** Verifique se o PROJECT_ID do WalletConnect está configurado

### Logs de Deploy:

- Acesse o painel da Vercel
- Vá para "Deployments"
- Clique no deploy desejado
- Visualize os logs de build
