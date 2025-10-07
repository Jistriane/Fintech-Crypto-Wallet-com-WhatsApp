# 🚀 Deploy Automático na Vercel - Mainnet

## ✅ Configuração Concluída

O projeto foi configurado para deploy automático na Vercel com as seguintes otimizações para mainnet:

### 📁 Arquivos Criados/Modificados:

1. **`vercel.json`** - Configuração da Vercel com otimizações para produção
2. **`next.config.ts`** - Atualizado para usar API externa em produção
3. **`src/config/web3.tsx`** - Configurado para mainnet em produção
4. **`package.json`** - Adicionados scripts de deploy
5. **`.vercelignore`** - Arquivos ignorados no deploy
6. **`scripts/deploy.sh`** - Script de deploy automático
7. **`README-DEPLOY.md`** - Documentação completa de deploy

### 🔧 Configurações Implementadas:

- ✅ Deploy automático na Vercel
- ✅ Configuração para rede mainnet
- ✅ URLs de API externas para produção
- ✅ RPC URLs otimizadas para mainnet
- ✅ Configurações de Web3 para produção
- ✅ Scripts de build otimizados
- ✅ Configurações de cache e performance

## 🚀 Como Fazer o Deploy:

### Opção 1: Deploy Automático via GitHub
1. Faça push do código para o repositório
2. Conecte o repositório à Vercel
3. Configure as variáveis de ambiente
4. O deploy será automático

### Opção 2: Deploy Manual
```bash
cd crypto-wallet-admin
npm install -g vercel
vercel login
./scripts/deploy.sh
```

## 🔑 Variáveis de Ambiente Necessárias:

Configure estas variáveis no painel da Vercel:

```bash
NEXT_PUBLIC_API_URL=https://api.notus.finance
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=seu_project_id_aqui
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth.llamarpc.com
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
NEXT_PUBLIC_BSC_RPC_URL=https://bsc-dataseed.binance.org
NEXT_PUBLIC_DEFAULT_CHAIN=ethereum
NEXT_PUBLIC_NETWORK=mainnet
NODE_ENV=production
```

## 📊 Benefícios da Configuração:

- 🚀 Deploy automático a cada push
- 🌐 CDN global da Vercel
- 🔒 SSL automático
- 📈 Monitoramento de performance
- 🔄 Rollback automático em caso de erro
- ⚡ Build otimizado para produção

## 🎯 Próximos Passos:

1. **Conecte à Vercel:** Acesse vercel.com e conecte seu repositório
2. **Configure variáveis:** Adicione as variáveis de ambiente
3. **Deploy:** Faça o primeiro deploy
4. **Teste:** Verifique se tudo está funcionando
5. **Domínio:** Configure um domínio personalizado se necessário

## 📞 Suporte:

Se encontrar problemas:
1. Verifique os logs de build na Vercel
2. Confirme se todas as variáveis estão configuradas
3. Teste localmente com `npm run build:production`

---

**Status:** ✅ Configuração concluída e pronta para deploy!
