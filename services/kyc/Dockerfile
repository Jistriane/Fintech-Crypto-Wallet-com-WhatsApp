# Estende a imagem base
FROM fintech-crypto-wallet-base AS builder

# Copia os arquivos do serviço
COPY services/kyc/package.json ./services/kyc/
COPY services/kyc/tsconfig.json ./services/kyc/
COPY services/kyc/src ./services/kyc/src

# Build do serviço
WORKDIR /app/services/kyc
RUN yarn build

# Imagem final
FROM node:18-alpine

WORKDIR /app/services/kyc

# Copia apenas os arquivos necessários
COPY --from=builder /app/services/kyc/dist ./dist
COPY --from=builder /app/services/kyc/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Configurações específicas do serviço KYC
ENV SERVICE_NAME=kyc-service
ENV SERVICE_PORT=3000

# Healthcheck específico do serviço KYC
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/kyc || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
