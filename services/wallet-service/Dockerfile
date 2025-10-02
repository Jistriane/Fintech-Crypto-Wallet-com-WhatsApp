# Estágio de build
FROM node:18-alpine AS builder

# Instalação de dependências do sistema
RUN apk add --no-cache python3 make g++ git

# Instalação do TypeScript globalmente
RUN npm install -g typescript

# Diretório de trabalho
WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p packages/common/dist packages/common/node_modules \
    services/wallet-service/dist services/wallet-service/node_modules

# Arquivos de configuração do projeto
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY services/wallet-service/package*.json ./services/wallet-service/

# Instalação de dependências
RUN npm install --legacy-peer-deps --ignore-scripts

# Build do pacote comum
COPY packages/common ./packages/common
COPY tsconfig.json ./
RUN cd packages/common && tsc --skipLibCheck || true

# Build do serviço de carteira
COPY services/wallet-service ./services/wallet-service
RUN cd services/wallet-service && tsc --skipLibCheck || true

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p packages/common/dist packages/common/node_modules \
    services/wallet-service/dist services/wallet-service/node_modules

# Copia os artefatos de build
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=builder /app/services/wallet-service/dist ./services/wallet-service/dist
COPY --from=builder /app/services/wallet-service/node_modules ./services/wallet-service/node_modules

# Comando para iniciar o serviço
CMD ["node", "services/wallet-service/dist/index.js"]