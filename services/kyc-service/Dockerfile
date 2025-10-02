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
    services/kyc-service/dist services/kyc-service/node_modules

# Arquivos de configuração do projeto
COPY package*.json ./
COPY packages/common/package*.json ./packages/common/
COPY services/kyc-service/package*.json ./services/kyc-service/

# Instalação de dependências
RUN npm install --legacy-peer-deps --ignore-scripts

# Build do pacote comum
COPY packages/common ./packages/common
COPY tsconfig.json ./
RUN cd packages/common && tsc --skipLibCheck || true

# Build do serviço KYC
COPY services/kyc-service ./services/kyc-service
RUN cd services/kyc-service && tsc --skipLibCheck || true

# Estágio de produção
FROM node:18-alpine

WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p packages/common/dist packages/common/node_modules \
    services/kyc-service/dist services/kyc-service/node_modules

# Copia os artefatos de build
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/node_modules ./packages/common/node_modules
COPY --from=builder /app/services/kyc-service/dist ./services/kyc-service/dist
COPY --from=builder /app/services/kyc-service/node_modules ./services/kyc-service/node_modules

# Comando para iniciar o serviço
CMD ["node", "services/kyc-service/dist/index.js"]