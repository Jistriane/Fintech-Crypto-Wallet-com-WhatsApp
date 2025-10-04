# Notus - Fintech Crypto Wallet com WhatsApp

Sistema de carteira digital criptográfica com integração WhatsApp.

## Estrutura do Projeto

O projeto é organizado como um monorepo contendo os seguintes serviços:

- `crypto-wallet-admin`: Frontend administrativo (Next.js)
- `services/auth-service`: Serviço de autenticação
- `services/wallet-service`: Serviço de carteiras
- `services/kyc-service`: Serviço de KYC
- `services/liquidity-service`: Serviço de liquidez
- `services/notification-service`: Serviço de notificações

## Requisitos

- Node.js 18+
- npm 8+
- MongoDB
- Redis

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd fintech-crypto-wallet
```

2. Instale as dependências:
```bash
npm run install:all
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie os serviços:
```bash
npm run dev
```

## Portas dos Serviços

- Frontend Admin: http://localhost:3000
- Auth Service: http://localhost:3333
- Wallet Service: http://localhost:3334
- KYC Service: http://localhost:3335
- Liquidity Service: http://localhost:3336
- Notification Service: http://localhost:3337

## Scripts Disponíveis

- `npm run dev`: Inicia todos os serviços em modo desenvolvimento
- `npm run install:all`: Instala dependências de todos os serviços
- `npm run dev:admin`: Inicia apenas o frontend admin
- `npm run dev:auth`: Inicia apenas o serviço de autenticação
- `npm run dev:services`: Inicia todos os microserviços

## Tecnologias Utilizadas

- Frontend:
  - Next.js 14
  - React 18
  - TypeScript
  - Tailwind CSS
  - shadcn/ui
  - Wagmi/Viem

- Backend:
  - Node.js
  - Express
  - TypeScript
  - MongoDB
  - Redis

## Funcionalidades

- Autenticação com 2FA
- Integração com WhatsApp
- Gerenciamento de carteiras
- Suporte a múltiplas redes (Ethereum, Polygon, BSC)
- KYC/AML
- Monitoramento de transações
- Painel administrativo completo

## Contribuição

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.