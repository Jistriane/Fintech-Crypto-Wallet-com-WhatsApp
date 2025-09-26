# Guia de Deploy - Fintech Crypto Wallet com WhatsApp

## Índice

1. [Requisitos](#requisitos)
2. [Infraestrutura AWS](#infraestrutura-aws)
3. [Configuração de Ambiente](#configuração-de-ambiente)
4. [Deploy dos Serviços](#deploy-dos-serviços)
5. [Monitoramento](#monitoramento)
6. [Manutenção](#manutenção)

## Requisitos

### Hardware

- **Produção**
  - ECS Fargate:
    - CPU: 2 vCPU por serviço
    - Memória: 4GB por serviço
  - RDS:
    - Instância: db.r6g.xlarge
    - Storage: 100GB gp3
  - ElastiCache:
    - Instância: cache.r6g.large
    - Memória: 16GB

- **Staging**
  - ECS Fargate:
    - CPU: 1 vCPU por serviço
    - Memória: 2GB por serviço
  - RDS:
    - Instância: db.t4g.large
    - Storage: 50GB gp3
  - ElastiCache:
    - Instância: cache.t4g.medium
    - Memória: 8GB

### Software

- Docker 24.0+
- Node.js 18.0+
- PostgreSQL 15.0+
- Redis 7.0+
- Kong Gateway 3.0+
- Prometheus 2.45+
- Grafana 10.0+
- Jaeger 1.45+

### Redes

- VPC dedicada
- Subnets públicas e privadas
- NAT Gateway
- Internet Gateway
- VPC Endpoints para serviços AWS

## Infraestrutura AWS

### CloudFormation

1. Deploy da VPC:
```bash
aws cloudformation deploy \
  --template-file infrastructure/vpc.yaml \
  --stack-name crypto-wallet-vpc \
  --parameter-overrides \
    Environment=production \
    VpcCidr=10.0.0.0/16
```

2. Deploy do ECS Cluster:
```bash
aws cloudformation deploy \
  --template-file infrastructure/ecs.yaml \
  --stack-name crypto-wallet-ecs \
  --parameter-overrides \
    Environment=production \
    VpcStackName=crypto-wallet-vpc
```

3. Deploy do RDS:
```bash
aws cloudformation deploy \
  --template-file infrastructure/rds.yaml \
  --stack-name crypto-wallet-rds \
  --parameter-overrides \
    Environment=production \
    VpcStackName=crypto-wallet-vpc \
    DBInstanceClass=db.r6g.xlarge
```

4. Deploy do ElastiCache:
```bash
aws cloudformation deploy \
  --template-file infrastructure/elasticache.yaml \
  --stack-name crypto-wallet-redis \
  --parameter-overrides \
    Environment=production \
    VpcStackName=crypto-wallet-vpc \
    CacheNodeType=cache.r6g.large
```

### Security Groups

- **ECS Tasks**
  - Inbound: ALB Security Group
  - Outbound: All

- **RDS**
  - Inbound: ECS Tasks Security Group
  - Outbound: None

- **ElastiCache**
  - Inbound: ECS Tasks Security Group
  - Outbound: None

- **ALB**
  - Inbound: 80, 443
  - Outbound: ECS Tasks Security Group

### IAM Roles

1. ECS Task Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "kms:Decrypt",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": [
        "arn:aws:secretsmanager:*:*:secret:crypto-wallet-*",
        "arn:aws:kms:*:*:key/*",
        "arn:aws:s3:::crypto-wallet-*/*"
      ]
    }
  ]
}
```

2. ECS Task Execution Role:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    }
  ]
}
```

## Configuração de Ambiente

### Variáveis de Ambiente

1. Crie os secrets no AWS Secrets Manager:
```bash
aws secretsmanager create-secret \
  --name crypto-wallet-production \
  --secret-string '{
    "DATABASE_URL": "postgresql://user:pass@host:5432/db",
    "REDIS_URL": "redis://host:6379",
    "JWT_SECRET": "your-jwt-secret",
    "WHATSAPP_API_KEY": "your-api-key"
  }'
```

2. Configure as variáveis no ECS Task Definition:
```json
{
  "environment": [
    {
      "name": "NODE_ENV",
      "value": "production"
    },
    {
      "name": "PORT",
      "value": "3000"
    }
  ],
  "secrets": [
    {
      "name": "DATABASE_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:crypto-wallet-production:DATABASE_URL::"
    },
    {
      "name": "REDIS_URL",
      "valueFrom": "arn:aws:secretsmanager:region:account:secret:crypto-wallet-production:REDIS_URL::"
    }
  ]
}
```

### SSL/TLS

1. Solicite certificado no ACM:
```bash
aws acm request-certificate \
  --domain-name api.example.com \
  --validation-method DNS \
  --subject-alternative-names "*.api.example.com"
```

2. Configure o ALB:
```bash
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT_ARN \
  --default-actions Type=forward,TargetGroupArn=$TG_ARN
```

## Deploy dos Serviços

### Pipeline CI/CD

1. Configure o GitHub Actions:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build and push images
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml push
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster crypto-wallet \
            --service auth-service \
            --force-new-deployment
```

### Ordem de Deploy

1. Database Migrations:
```bash
npm run typeorm migration:run
```

2. Kong Gateway:
```bash
kubectl apply -f k8s/kong/
```

3. Serviços Core:
```bash
aws ecs update-service --cluster crypto-wallet --service auth-service
aws ecs update-service --cluster crypto-wallet --service wallet-service
aws ecs update-service --cluster crypto-wallet --service notification-service
```

4. Serviços Auxiliares:
```bash
aws ecs update-service --cluster crypto-wallet --service analytics-service
```

5. Frontend:
```bash
aws s3 sync build/ s3://crypto-wallet-web
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### Rollback

1. Reverter deploy:
```bash
aws ecs update-service \
  --cluster crypto-wallet \
  --service auth-service \
  --task-definition auth-service:$PREVIOUS_VERSION
```

2. Reverter migrations:
```bash
npm run typeorm migration:revert
```

## Monitoramento

### Prometheus

1. Deploy do Prometheus:
```bash
helm install prometheus prometheus-community/prometheus \
  -f prometheus-values.yaml \
  -n monitoring
```

2. Configure targets:
```yaml
scrape_configs:
  - job_name: 'crypto-wallet'
    ec2_sd_configs:
      - region: us-east-1
        port: 9090
    relabel_configs:
      - source_labels: [__meta_ec2_tag_Service]
        target_label: service
```

### Grafana

1. Deploy do Grafana:
```bash
helm install grafana grafana/grafana \
  -f grafana-values.yaml \
  -n monitoring
```

2. Import dashboards:
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @dashboards/services.json \
  http://grafana:3000/api/dashboards/db
```

### Alertas

1. Configure alertas no Prometheus:
```yaml
groups:
  - name: crypto-wallet
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
```

2. Configure notificações no Grafana:
```yaml
notifiers:
  - name: ops-team
    type: slack
    settings:
      url: https://hooks.slack.com/services/xxx
```

## Manutenção

### Backup

1. RDS Snapshots:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier crypto-wallet \
  --db-snapshot-identifier crypto-wallet-backup
```

2. ElastiCache Backup:
```bash
aws elasticache create-snapshot \
  --cache-cluster-id crypto-wallet \
  --snapshot-name crypto-wallet-backup
```

### Logs

1. Configurar retenção:
```bash
aws logs put-retention-policy \
  --log-group-name /ecs/crypto-wallet \
  --retention-in-days 30
```

2. Exportar logs:
```bash
aws logs create-export-task \
  --log-group-name /ecs/crypto-wallet \
  --from 1620000000000 \
  --to 1620086400000 \
  --destination crypto-wallet-logs \
  --destination-prefix exports
```

### Scaling

1. Auto Scaling:
```bash
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/crypto-wallet/auth-service \
  --min-capacity 2 \
  --max-capacity 10
```

2. Scaling Policies:
```bash
aws application-autoscaling put-scaling-policy \
  --policy-name cpu-tracking \
  --service-namespace ecs \
  --scalable-dimension ecs:service:DesiredCount \
  --resource-id service/crypto-wallet/auth-service \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 75.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```
