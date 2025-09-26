#!/bin/bash

# Definir o diretório base
BASE_DIR="/home/jistriane/Area de Trabalho/Notus/Fintech Crypto Wallet com WhatsApp"
PROJECT_DIR="$BASE_DIR/crypto-wallet-admin"

# Remover diretório existente
rm -rf "$PROJECT_DIR"

# Criar diretório do projeto
mkdir -p "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Inicializar package.json
cat > package.json << EOF
{
  "name": "crypto-wallet-admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
EOF

# Instalar dependências
npm install next@latest react@18.2.0 react-dom@18.2.0 typescript@latest @types/react@latest @types/node@latest @types/react-dom@latest eslint@latest tailwindcss@latest postcss@latest autoprefixer@latest

# Instalar dependências adicionais
npm install @heroicons/react @headlessui/react @tanstack/react-query @tanstack/react-query-devtools zustand axios react-hook-form zod @hookform/resolvers @tremor/react recharts @react-email/components @react-email/render @react-email/tailwind --legacy-peer-deps

# Criar estrutura de diretórios
mkdir -p src/app src/components/common src/components/dashboard src/lib src/styles

# Criar arquivos base
cat > src/app/layout.tsx << EOF
import '@/styles/globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
EOF

cat > src/app/page.tsx << EOF
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Crypto Wallet Admin</h1>
    </main>
  )
}
EOF

cat > src/styles/globals.css << EOF
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

cat > tailwind.config.js << EOF
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

cat > postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

cat > next.config.js << EOF
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = nextConfig
EOF

# Criar arquivo .gitignore
cat > .gitignore << EOF
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF

echo "Projeto Next.js criado com sucesso!"