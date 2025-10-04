# Guia de Deploy - Notus

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Ambientes](#ambientes)
3. [Deploy Local](#deploy-local)
4. [Deploy com Docker](#deploy-com-docker)
5. [Deploy em Produção](#deploy-em-produção)
6. [Monitoramento](#monitoramento)
7. [Backup e Recuperação](#backup-e-recuperação)
8. [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O Notus suporta múltiplas estratégias de deploy, desde desenvolvimento local até produção em escala. Este guia cobre todas as opções disponíveis.

### Estratégias de Deploy
- **Desenvolvimento**: Docker Compose local
- **Staging**: Kubernetes cluster
- **Produção**: Kubernetes multi-region
- **CI/CD**: GitHub Actions

## 🌍 Ambientes

### Desenvolvimento
- **Objetivo**: Desenvolvimento e testes
- **Infraestrutura**: Docker Compose
- **Banco**: PostgreSQL local
- **Cache**: Redis local
- **URL**: http://localhost:3000

### Staging
- **Objetivo**: Testes de integração
- **Infraestrutura**: Kubernetes
- **Banco**: PostgreSQL gerenciado
- **Cache**: Redis cluster
- **URL**: https://staging.notus.com

### Produção
- **Objetivo**: Ambiente de produção
- **Infraestrutura**: Kubernetes multi-region
- **Banco**: PostgreSQL cluster
- **Cache**: Redis cluster
- **URL**: https://notus.com

## 🏠 Deploy Local

### Pré-requisitos
```bash
# Node.js 20+
node --version

# Docker e Docker Compose
docker --version
docker-compose --version

# Git
git --version
```

### Instalação
```bash
# Clone o repositório
git clone https://github.com/Jistriane/Fintech-Crypto-Wallet-com-WhatsApp.git
cd Fintech-Crypto-Wallet-com-WhatsApp

# Instale dependências
npm run install:all

# Configure variáveis de ambiente
cp env.example .env
```

### Desenvolvimento com Docker
```bash
# Iniciar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

### Desenvolvimento Local
```bash
# Iniciar serviços individualmente
npm run dev:admin      # Frontend admin
npm run dev:auth       # Serviço de autenticação
npm run dev:services   # Microserviços
```

### Configuração do Banco
```bash
# Executar migrações
cd services/auth-service
npx prisma migrate dev

cd ../wallet-service
npx prisma migrate dev

# Gerar clientes Prisma
npx prisma generate
```

## 🐳 Deploy com Docker

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: notus
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  auth_service:
    build: ./services/auth-service
    ports:
      - "3333:3333"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/auth_service
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  admin:
    build: ./crypto-wallet-admin
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://auth_service:3333
    depends_on:
      - auth_service

volumes:
  postgres_data:
  redis_data:
```

### Dockerfiles

#### Frontend Admin
```dockerfile
# crypto-wallet-admin/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
RUN npm ci --only=production

EXPOSE 3000
CMD ["npm", "start"]
```

#### Backend Service
```dockerfile
# services/auth-service/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM base AS build
COPY . .
RUN npx prisma generate

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./

EXPOSE 3333
CMD ["npm", "start"]
```

### Comandos Docker
```bash
# Build de todos os serviços
docker-compose build

# Build de um serviço específico
docker-compose build auth_service

# Iniciar em background
docker-compose up -d

# Ver logs de um serviço
docker-compose logs -f auth_service

# Parar todos os serviços
docker-compose down

# Remover volumes
docker-compose down -v
```

## 🚀 Deploy em Produção

### Kubernetes

#### Namespace
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: notus
  labels:
    name: notus
```

#### ConfigMap
```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: notus-config
  namespace: notus
data:
  DATABASE_URL: "postgresql://user:pass@postgres:5432/notus"
  REDIS_URL: "redis://redis:6379"
  JWT_SECRET: "your-jwt-secret"
```

#### Secrets
```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: notus-secrets
  namespace: notus
type: Opaque
data:
  DATABASE_PASSWORD: <base64-encoded-password>
  JWT_SECRET: <base64-encoded-secret>
  ENCRYPTION_KEY: <base64-encoded-key>
```

#### Deployment
```yaml
# k8s/auth-service-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth-service
  namespace: notus
spec:
  replicas: 3
  selector:
    matchLabels:
      app: auth-service
  template:
    metadata:
      labels:
        app: auth-service
    spec:
      containers:
      - name: auth-service
        image: notus/auth-service:latest
        ports:
        - containerPort: 3333
        env:
        - name: DATABASE_URL
          valueFrom:
            configMapKeyRef:
              name: notus-config
              key: DATABASE_URL
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: notus-secrets
              key: JWT_SECRET
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3333
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3333
          initialDelaySeconds: 5
          periodSeconds: 5
```

#### Service
```yaml
# k8s/auth-service-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: auth-service
  namespace: notus
spec:
  selector:
    app: auth-service
  ports:
  - port: 3333
    targetPort: 3333
  type: ClusterIP
```

#### Ingress
```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: notus-ingress
  namespace: notus
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.notus.com
    secretName: notus-tls
  rules:
  - host: api.notus.com
    http:
      paths:
      - path: /auth
        pathType: Prefix
        backend:
          service:
            name: auth-service
            port:
              number: 3333
```

### Helm Charts

#### Chart.yaml
```yaml
# helm/notus/Chart.yaml
apiVersion: v2
name: notus
description: Notus Crypto Wallet
type: application
version: 1.0.0
appVersion: "1.0.0"
```

#### values.yaml
```yaml
# helm/notus/values.yaml
replicaCount: 3

image:
  repository: notus/notus
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: api.notus.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: notus-tls
      hosts:
        - api.notus.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80
```

### Deploy com Helm
```bash
# Adicionar repositório
helm repo add notus https://charts.notus.com
helm repo update

# Instalar chart
helm install notus notus/notus \
  --namespace notus \
  --create-namespace \
  --values values.yaml

# Atualizar deployment
helm upgrade notus notus/notus \
  --namespace notus \
  --values values.yaml

# Verificar status
helm status notus -n notus
```

## 📊 Monitoramento

### Prometheus
```yaml
# monitoring/prometheus-config.yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'notus-services'
    static_configs:
      - targets: ['auth-service:3333', 'wallet-service:3334']
    metrics_path: /metrics
    scrape_interval: 30s
```

### Grafana Dashboard
```json
{
  "dashboard": {
    "title": "Notus Services",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "{{service}}"
          }
        ]
      }
    ]
  }
}
```

### Alerting Rules
```yaml
# monitoring/alerts.yaml
groups:
- name: notus-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "High error rate detected"
      description: "Service {{ $labels.service }} has high error rate"

  - alert: ServiceDown
    expr: up == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "Service {{ $labels.instance }} is down"
```

## 💾 Backup e Recuperação

### Backup do Banco
```bash
#!/bin/bash
# scripts/backup-database.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="notus_backup_${DATE}.sql"

# Backup PostgreSQL
pg_dump -h postgres -U postgres -d notus > "${BACKUP_DIR}/${BACKUP_FILE}"

# Compactar backup
gzip "${BACKUP_DIR}/${BACKUP_FILE}"

# Upload para S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}.gz" s3://notus-backups/

# Limpar backups antigos
find ${BACKUP_DIR} -name "*.gz" -mtime +7 -delete
```

### Backup de Arquivos
```bash
#!/bin/bash
# scripts/backup-files.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="notus_files_${DATE}.tar.gz"

# Backup de arquivos
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" /app/uploads /app/logs

# Upload para S3
aws s3 cp "${BACKUP_DIR}/${BACKUP_FILE}" s3://notus-backups/
```

### Recuperação
```bash
#!/bin/bash
# scripts/restore.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file>"
  exit 1
fi

# Download do backup
aws s3 cp "s3://notus-backups/${BACKUP_FILE}" /tmp/

# Restaurar banco
gunzip -c "/tmp/${BACKUP_FILE}" | psql -h postgres -U postgres -d notus

# Restaurar arquivos
tar -xzf "/tmp/${BACKUP_FILE}" -C /

echo "Restore completed successfully"
```

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Serviço não inicia
```bash
# Verificar logs
docker-compose logs auth_service

# Verificar status
docker-compose ps

# Reiniciar serviço
docker-compose restart auth_service
```

#### 2. Banco de dados não conecta
```bash
# Verificar conexão
docker-compose exec postgres psql -U postgres -d notus

# Verificar variáveis de ambiente
docker-compose exec auth_service env | grep DATABASE
```

#### 3. Problemas de memória
```bash
# Verificar uso de memória
docker stats

# Aumentar limites
docker-compose up -d --scale auth_service=2
```

#### 4. Problemas de rede
```bash
# Verificar conectividade
docker-compose exec auth_service ping postgres

# Verificar DNS
docker-compose exec auth_service nslookup postgres
```

### Logs e Debugging
```bash
# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f auth_service

# Ver logs com timestamp
docker-compose logs -f -t auth_service

# Ver logs das últimas 100 linhas
docker-compose logs --tail=100 auth_service
```

### Health Checks
```bash
# Verificar saúde dos serviços
curl http://localhost:3333/health
curl http://localhost:3334/health
curl http://localhost:3335/health

# Verificar métricas
curl http://localhost:3333/metrics
```

---

**Notus Deployment** - Deploy seguro e escalável 🚀
