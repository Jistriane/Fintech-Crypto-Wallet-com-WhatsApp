# Scripts de Inicialização - Notus

Este diretório contém scripts para gerenciar todo o sistema Notus de forma automatizada.

## 📋 Scripts Disponíveis

### 🚀 Inicialização
- **`start-system.sh`** (Linux/macOS) - Inicia todo o sistema
- **`start-system.bat`** (Windows) - Inicia todo o sistema

### 🛑 Parada
- **`stop-system.sh`** (Linux/macOS) - Para todo o sistema
- **`stop-system.bat`** (Windows) - Para todo o sistema

### 📊 Monitoramento
- **`status.sh`** (Linux/macOS) - Verifica status dos serviços
- **`logs.sh`** (Linux/macOS) - Visualiza logs dos serviços
- **`logs.bat`** (Windows) - Visualiza logs dos serviços

## 🚀 Uso Rápido

### Linux/macOS
```bash
# Iniciar sistema
./scripts/start-system.sh

# Ver status
./scripts/status.sh

# Ver logs
./scripts/logs.sh auth-service

# Parar sistema
./scripts/stop-system.sh
```

### Windows
```cmd
REM Iniciar sistema
scripts\start-system.bat

REM Ver logs
scripts\logs.bat auth-service

REM Parar sistema
scripts\stop-system.bat
```

## 🔧 Funcionalidades

### Script de Inicialização (`start-system.sh`)

#### O que faz:
1. **Verifica pré-requisitos** (Node.js, npm, Docker)
2. **Cria diretórios necessários** (logs, data, backups)
3. **Configura variáveis de ambiente** (.env)
4. **Verifica e libera portas** em uso
5. **Instala dependências** de todos os serviços
6. **Inicializa banco de dados** (PostgreSQL + Redis)
7. **Executa migrações** do Prisma
8. **Inicia todos os serviços** em background
9. **Verifica saúde** dos serviços
10. **Mostra status** final

#### Serviços iniciados:
- 🖥️ **Admin Frontend** (porta 3000)
- 🔐 **Auth Service** (porta 3333)
- 💼 **Wallet Service** (porta 3334)
- 🛡️ **KYC Service** (porta 3335)
- 💧 **Liquidity Service** (porta 3336)
- 📢 **Notification Service** (porta 3337)
- 🐘 **PostgreSQL** (porta 5432)
- 🔴 **Redis** (porta 6379)

### Script de Status (`status.sh`)

#### Verificações:
- ✅ **Serviços web** (HTTP health checks)
- ✅ **Infraestrutura** (PostgreSQL, Redis)
- ✅ **Processos Node.js** (contagem)
- ✅ **Containers Docker** (status)
- ✅ **Logs** (arquivos e tamanhos)
- ✅ **Recursos** (memória, disco)

### Script de Logs (`logs.sh`)

#### Funcionalidades:
- 📋 **Logs individuais** por serviço
- 📋 **Logs combinados** (multitail)
- 📋 **Logs em tempo real** (tail -f)
- 📋 **Navegação interativa**

## 🛠️ Configuração

### Pré-requisitos
- **Node.js 20+**
- **npm 8+**
- **Docker** (opcional)
- **Docker Compose** (opcional)

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/notus"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="seu_jwt_secret_aqui"
JWT_EXPIRES_IN="7d"

# Outras configurações...
```

## 📊 Monitoramento

### Logs
Os logs são salvos em `logs/`:
- `auth-service.log`
- `wallet-service.log`
- `kyc-service.log`
- `liquidity-service.log`
- `notification-service.log`
- `admin-frontend.log`

### PIDs
Os PIDs dos processos são salvos em `logs/*.pid` para controle.

### Health Checks
Cada serviço possui endpoint de saúde:
- `http://localhost:3333/health`
- `http://localhost:3334/health`
- `http://localhost:3335/health`
- `http://localhost:3336/health`
- `http://localhost:3337/health`

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Porta em uso
```bash
# Verificar porta
lsof -i :3000

# Liberar porta
kill -9 $(lsof -ti:3000)
```

#### 2. Dependências não instaladas
```bash
# Reinstalar dependências
npm run install:all
```

#### 3. Banco de dados não conecta
```bash
# Verificar PostgreSQL
docker-compose up -d postgres

# Verificar conexão
psql -h localhost -p 5432 -U postgres
```

#### 4. Serviços não iniciam
```bash
# Ver logs
./scripts/logs.sh auth-service

# Verificar status
./scripts/status.sh
```

### Comandos Úteis

```bash
# Ver todos os processos Node.js
ps aux | grep node

# Ver portas em uso
netstat -tulpn | grep LISTEN

# Ver logs em tempo real
tail -f logs/*.log

# Reiniciar sistema
./scripts/stop-system.sh && ./scripts/start-system.sh
```

## 📝 Logs e Debugging

### Níveis de Log
- **INFO**: Informações gerais
- **WARN**: Avisos (não críticos)
- **ERROR**: Erros críticos
- **DEBUG**: Informações de debug

### Estrutura dos Logs
```
[2024-01-01 12:00:00] INFO: Serviço iniciado
[2024-01-01 12:00:01] WARN: Porta 3000 em uso
[2024-01-01 12:00:02] ERROR: Falha ao conectar banco
[2024-01-01 12:00:03] DEBUG: Tentativa de reconexão
```

## 🚀 Deploy em Produção

### Docker Compose
```bash
# Produção
docker-compose -f docker-compose.prod.yml up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d
```

### Kubernetes
```bash
# Aplicar configurações
kubectl apply -f k8s/

# Verificar pods
kubectl get pods

# Ver logs
kubectl logs -f deployment/auth-service
```

---

**Notus Scripts** - Automação completa do sistema 🚀
