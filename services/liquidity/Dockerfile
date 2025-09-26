# Estende a imagem base
FROM fintech-crypto-wallet-base AS builder

# Copia os arquivos do serviço
COPY services/liquidity/package.json ./services/liquidity/
COPY services/liquidity/tsconfig.json ./services/liquidity/
COPY services/liquidity/src ./services/liquidity/src

# Build do serviço
WORKDIR /app/services/liquidity
RUN yarn build

# Imagem final
FROM node:18-alpine

WORKDIR /app/services/liquidity

# Copia apenas os arquivos necessários
COPY --from=builder /app/services/liquidity/dist ./dist
COPY --from=builder /app/services/liquidity/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Configurações específicas do serviço Liquidity
ENV SERVICE_NAME=liquidity-service
ENV SERVICE_PORT=3000

# Healthcheck específico do serviço Liquidity
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/liquidity || exit 1

EXPOSE 3000

CMD ["node", "dist/index.js"]
