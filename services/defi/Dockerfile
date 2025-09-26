# Estende a imagem base
FROM fintech-crypto-wallet-base AS builder

# Copia os arquivos do serviço
COPY services/defi/package.json ./services/defi/
COPY services/defi/tsconfig.json ./services/defi/
COPY services/defi/src ./services/defi/src

# Build do serviço
WORKDIR /app/services/defi
RUN yarn build

# Imagem final
FROM node:18-alpine

WORKDIR /app/services/defi

# Copia apenas os arquivos necessários
COPY --from=builder /app/services/defi/dist ./dist
COPY --from=builder /app/services/defi/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Configurações específicas do serviço DeFi
ENV SERVICE_NAME=defi-service
ENV SERVICE_PORT=3000

# Healthcheck específico do serviço DeFi
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/defi || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
