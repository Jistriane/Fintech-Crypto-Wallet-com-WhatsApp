FROM node:20-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários para instalar dependências
COPY package*.json .npmrc ./

# Instalar dependências com flags para evitar problemas
RUN npm install --legacy-peer-deps --no-package-lock

# Copiar o resto dos arquivos
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

EXPOSE 3334

CMD ["npm", "run", "dev"]