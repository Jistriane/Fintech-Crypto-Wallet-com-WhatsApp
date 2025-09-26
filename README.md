# Fintech Crypto Wallet com WhatsApp

Uma solução completa de carteira digital de criptomoedas integrada com WhatsApp, oferecendo uma experiência segura e intuitiva para usuários.

## 🚀 Funcionalidades

- Carteira de criptomoedas
- Integração com WhatsApp
- Painel administrativo
- KYC (Know Your Customer)
- Pool de liquidez
- Análise de transações
- Monitoramento em tempo real

## 🏗️ Arquitetura

O projeto é dividido em vários componentes principais:

- **crypto-wallet-admin**: Painel administrativo em Next.js
- **crypto-wallet-mobile**: Aplicativo móvel em React Native
- **CryptoWalletApp**: Aplicativo principal
- **services**: Microsserviços backend
  - analytics-service
  - auth-service
  - defi
  - kyc
  - liquidity
  - notification-service
  - wallet-service

## 🛠️ Tecnologias

- Frontend:
  - Next.js
  - React Native
  - TypeScript
  - Tailwind CSS
- Backend:
  - Node.js
  - TypeScript
  - Smart Contracts (Solidity)
- Infraestrutura:
  - Docker
  - Kubernetes
  - AWS
  - Terraform
  - Grafana/Prometheus

## 📦 Instalação

1. Clone o repositório:
\`\`\`bash
git clone https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git
cd Fintech-Crypto-Wallet-com-WhatsApp
\`\`\`

2. Instale as dependências:
\`\`\`bash
# Instale as dependências do projeto principal
npm install

# Instale as dependências do painel admin
cd crypto-wallet-admin
npm install

# Instale as dependências do app mobile
cd ../crypto-wallet-mobile
npm install
\`\`\`

3. Configure as variáveis de ambiente:
- Copie os arquivos .env.example para .env em cada diretório de serviço
- Preencha as variáveis necessárias

4. Inicie os serviços:
\`\`\`bash
# Inicie os serviços com Docker
docker-compose up -d

# Inicie o painel admin
cd crypto-wallet-admin
npm run dev

# Inicie o app mobile
cd ../crypto-wallet-mobile
npm start
\`\`\`

## 🧪 Testes

\`\`\`bash
# Execute os testes unitários
npm run test

# Execute os testes de integração
npm run test:integration

# Execute os testes end-to-end
npm run test:e2e
\`\`\`

## 📚 Documentação

Documentação detalhada está disponível no diretório \`docs/\`:
- [Arquitetura](docs/architecture.md)
- [Guia de Desenvolvimento](docs/development.md)
- [Guia de Implantação](docs/deployment.md)
- [Guia do Usuário](docs/user-guide.md)
- [Solução de Problemas](docs/troubleshooting.md)

## 🔐 Segurança

- Implementação completa de KYC
- Criptografia de ponta a ponta
- Smart contracts auditados
- Monitoramento de transações suspeitas
- Proteção contra ataques DDoS

## 📄 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).