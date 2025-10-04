FROM node:20-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instalar dependências com flags para evitar problemas
RUN npm install --legacy-peer-deps --no-package-lock

# Copiar o resto dos arquivos
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]