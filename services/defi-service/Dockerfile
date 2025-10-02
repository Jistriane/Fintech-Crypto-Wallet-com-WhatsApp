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
    services/defi-service/dist services/defi-service/node_modules

# Arquivos de configuração do projeto
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY services/defi-service/package*.json ./services/defi-service/

# Instalação de dependências
RUN npm install --legacy-peer-deps --ignore-scripts

# Build do pacote comum
COPY packages/common ./packages/common
COPY tsconfig.json ./
RUN cd packages/common && tsc --skipLibCheck || true

# Build do serviço DeFi
COPY services/defi-service ./services/defi-service
RUN cd services/defi-service && tsc --skipLibCheck || true

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p packages/common/dist packages/common/node_modules \
    services/defi-service/dist services/defi-service/node_modules

# Copia os artefatos de build
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=builder /app/services/defi-service/dist ./services/defi-service/dist
COPY --from=builder /app/services/defi-service/node_modules ./services/defi-service/node_modules

# Comando para iniciar o serviço
CMD ["node", "services/defi-service/dist/index.js"]