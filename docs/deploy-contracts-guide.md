# Guia de Deploy dos Contratos Notus

Este guia fornece instruções detalhadas para fazer o deploy dos contratos inteligentes do sistema Notus na Ethereum Mainnet.

## 🪙 **Crypto Necessária: ETH (Ethereum)**

### **Por que ETH?**
- **Gas Fees**: ETH é necessária para pagar as taxas de gas na rede Ethereum
- **Mainnet**: Contratos serão deployados na Ethereum Mainnet
- **Padrão da Indústria**: ETH é a moeda padrão para contratos inteligentes
- **Liquidez**: Maior liquidez e aceitação no mercado

### **Valor Estimado**
```bash
# Deploy completo dos contratos:
# - SmartWallet.sol
# - SmartWalletV2.sol  
# - LiquidityPool.sol
# - SmartWalletProxy.sol

# Estimativa: 0.05 - 0.1 ETH
# (aproximadamente $100-200 USD)
```

## 💰 **Preparação para Deploy**

### **1. Obter ETH**

**Opções para comprar ETH:**
- **Exchanges Centralizadas**: Binance, Coinbase, Kraken
- **P2P**: LocalBitcoins, Paxful
- **DEXs**: Uniswap, SushiSwap
- **ATMs**: Caixas eletrônicos de cripto

**Valor recomendado**: 0.1 - 0.2 ETH (para gas + margem de segurança)

### **2. Configurar Wallet**

```bash
# Usar MetaMask ou similar
# Endereço: 0x...
# Saldo mínimo: 0.1 ETH
```

### **3. Configurar RPC**

```bash
# Obter RPC URL gratuita:
# - Infura: https://infura.io
# - Alchemy: https://alchemy.com
# - QuickNode: https://quicknode.com
```

## ⚙️ **Configuração do Ambiente**

### **1. Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```bash
# Ethereum Mainnet
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas Configuration
GAS_PRICE=20000000000  # 20 Gwei
GAS_LIMIT=8000000

# Contract Configuration
CONTRACT_OWNER=0xYourWalletAddress
```

### **2. Obter API Keys**

**Etherscan API Key:**
1. Acesse [etherscan.io](https://etherscan.io)
2. Crie uma conta
3. Vá em "API Keys"
4. Gere uma nova API key

**Infura/Alchemy:**
1. Crie conta gratuita
2. Crie novo projeto
3. Copie a RPC URL

## 🚀 **Deploy dos Contratos**

### **1. Compilar Contratos**

```bash
# Compilar todos os contratos
npx hardhat compile

# Verificar se compilou sem erros
npx hardhat compile --force
```

### **2. Testar em Testnet (Recomendado)**

```bash
# Deploy em Goerli (testnet)
npx hardhat run scripts/deploy-contracts.ts --network goerli

# Verificar contratos
npx hardhat verify --network goerli CONTRACT_ADDRESS
```

### **3. Deploy em Mainnet**

```bash
# Deploy em Ethereum Mainnet
npx hardhat run scripts/deploy-contracts.ts --network mainnet

# Verificar contratos
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

## 📋 **Script de Deploy**

Crie o arquivo `scripts/deploy-contracts.ts`:

```typescript
import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {
  console.log("🚀 Iniciando deploy dos contratos Notus...");
  
  // 1. Deploy SmartWallet
  console.log("📝 Deployando SmartWallet...");
  const SmartWallet = await ethers.getContractFactory("SmartWallet");
  const smartWallet = await SmartWallet.deploy();
  await smartWallet.waitForDeployment();
  console.log("✅ SmartWallet deployado em:", await smartWallet.getAddress());
  
  // 2. Deploy SmartWalletV2
  console.log("📝 Deployando SmartWalletV2...");
  const SmartWalletV2 = await ethers.getContractFactory("SmartWalletV2");
  const smartWalletV2 = await SmartWalletV2.deploy();
  await smartWalletV2.waitForDeployment();
  console.log("✅ SmartWalletV2 deployado em:", await smartWalletV2.getAddress());
  
  // 3. Deploy LiquidityPool
  console.log("📝 Deployando LiquidityPool...");
  const LiquidityPool = await ethers.getContractFactory("LiquidityPool");
  const liquidityPool = await LiquidityPool.deploy();
  await liquidityPool.waitForDeployment();
  console.log("✅ LiquidityPool deployado em:", await liquidityPool.getAddress());
  
  // 4. Deploy SmartWalletProxy
  console.log("📝 Deployando SmartWalletProxy...");
  const SmartWalletProxy = await ethers.getContractFactory("SmartWalletProxy");
  const smartWalletProxy = await SmartWalletProxy.deploy();
  await smartWalletProxy.waitForDeployment();
  console.log("✅ SmartWalletProxy deployado em:", await smartWalletProxy.getAddress());
  
  console.log("🎉 Deploy concluído com sucesso!");
  
  // Salvar endereços
  const addresses = {
    SmartWallet: await smartWallet.getAddress(),
    SmartWalletV2: await smartWalletV2.getAddress(),
    LiquidityPool: await liquidityPool.getAddress(),
    SmartWalletProxy: await smartWalletProxy.getAddress()
  };
  
  console.log("📋 Endereços dos contratos:");
  console.log(JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Erro no deploy:", error);
    process.exit(1);
  });
```

## 🔍 **Verificação dos Contratos**

### **1. Verificar no Etherscan**

```bash
# Verificar SmartWallet
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# Verificar SmartWalletV2
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# Verificar LiquidityPool
npx hardhat verify --network mainnet CONTRACT_ADDRESS

# Verificar SmartWalletProxy
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

### **2. Verificar Manualmente**

1. Acesse [etherscan.io](https://etherscan.io)
2. Cole o endereço do contrato
3. Verifique se está verificado
4. Teste as funções públicas

## 💡 **Dicas Importantes**

### **Gas Optimization**

```bash
# Verificar gas estimado
npx hardhat run scripts/deploy-contracts.ts --network mainnet --gas-report

# Usar gas price otimizado
GAS_PRICE=15000000000  # 15 Gwei (mais barato)
```

### **Segurança**

```bash
# Nunca commite sua private key
echo "PRIVATE_KEY=your_key_here" >> .env
echo ".env" >> .gitignore

# Use wallet separada para deploy
# Não use sua wallet principal
```

### **Backup**

```bash
# Salvar endereços dos contratos
echo "SmartWallet: 0x..." >> deployed-contracts.txt
echo "SmartWalletV2: 0x..." >> deployed-contracts.txt
echo "LiquidityPool: 0x..." >> deployed-contracts.txt
echo "SmartWalletProxy: 0x..." >> deployed-contracts.txt
```

## 🚨 **Troubleshooting**

### **Problemas Comuns**

1. **Gas Insuficiente**
   ```bash
   # Aumentar gas limit
   GAS_LIMIT=10000000
   ```

2. **RPC Rate Limit**
   ```bash
   # Usar RPC diferente
   ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_KEY
   ```

3. **Verificação Falhou**
   ```bash
   # Verificar manualmente no Etherscan
   # Usar constructor arguments se necessário
   ```

### **Logs de Deploy**

```bash
# Salvar logs do deploy
npx hardhat run scripts/deploy-contracts.ts --network mainnet > deploy-log.txt 2>&1
```

## 📊 **Monitoramento**

### **1. Verificar Transações**

```bash
# Verificar status das transações
npx hardhat run scripts/check-deployment.ts --network mainnet
```

### **2. Monitorar Gas**

```bash
# Usar gas tracker
# https://ethgasstation.info
# https://gasnow.org
```

## 🎯 **Próximos Passos**

Após o deploy:

1. **Configurar Frontend**: Atualizar endereços dos contratos
2. **Testar Funcionalidades**: Verificar todas as funções
3. **Configurar Notus API**: Integrar com os contratos deployados
4. **Monitorar**: Acompanhar transações e eventos
5. **Documentar**: Salvar endereços e ABI dos contratos

## 🔗 **Links Úteis**

- [Etherscan](https://etherscan.io) - Explorador da blockchain
- [Gas Tracker](https://ethgasstation.info) - Monitor de gas
- [Infura](https://infura.io) - RPC provider
- [Alchemy](https://alchemy.com) - RPC provider
- [MetaMask](https://metamask.io) - Wallet

---

**⚠️ Importante**: Sempre teste em testnet antes de fazer deploy em mainnet. O deploy em mainnet é irreversível e custa gas real!
