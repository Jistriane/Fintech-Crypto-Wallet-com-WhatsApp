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
    services/auth-service/dist services/auth-service/node_modules

# Arquivos de configuração do projeto
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY services/auth-service/package*.json ./services/auth-service/

# Instalação de dependências
RUN cd packages/common && npm install --legacy-peer-deps
RUN cd /app/services/auth-service && npm install --legacy-peer-deps

# Build do pacote comum
COPY packages/common ./packages/common
COPY tsconfig.json ./
RUN cd packages/common && tsc --skipLibCheck || true

# Build do serviço de autenticação
COPY services/auth-service ./services/auth-service
COPY services/auth-service/tsconfig.json ./services/auth-service/
RUN cd services/auth-service && tsc --skipLibCheck || true

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p packages/common/dist packages/common/node_modules \
    services/auth-service/dist services/auth-service/node_modules

# Copia os artefatos de build
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/services/auth-service/dist ./services/auth-service/dist
COPY --from=builder /app/services/auth-service/node_modules ./services/auth-service/node_modules
COPY --from=builder /app/services/auth-service/package.json ./services/auth-service/package.json

# Comando para iniciar o serviço
CMD ["node", "services/auth-service/dist/index.js"]