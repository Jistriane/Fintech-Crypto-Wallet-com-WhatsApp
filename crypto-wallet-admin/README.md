# Crypto Wallet Admin

Painel administrativo para gerenciamento da Crypto Wallet.

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Crie um arquivo `.env.local` com as seguintes variáveis:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
4. Execute o projeto em modo de desenvolvimento:
   ```bash
   npm run dev
   ```

## Estrutura do Projeto

- `src/app`: Páginas e layouts da aplicação (App Router)
- `src/components`: Componentes reutilizáveis
- `src/services`: Serviços para comunicação com a API
- `src/store`: Gerenciamento de estado global
- `src/styles`: Estilos e tema
- `src/types`: Tipos TypeScript
- `src/providers`: Providers React

## Scripts Disponíveis

- `npm run dev`: Executa o projeto em modo de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run start`: Executa o projeto compilado
- `npm run lint`: Executa o linter

## Tecnologias

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- React Query
- Axios
- Zod
- Tremor
- Recharts
