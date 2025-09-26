# Guia de Troubleshooting - Fintech Crypto Wallet com WhatsApp

## Índice

1. [Monitoramento e Alertas](#monitoramento-e-alertas)
2. [Problemas Comuns](#problemas-comuns)
3. [Logs e Diagnóstico](#logs-e-diagnóstico)
4. [Recuperação de Falhas](#recuperação-de-falhas)
5. [Performance](#performance)
6. [Segurança](#segurança)

## Monitoramento e Alertas

### Dashboards

- **Grafana**: http://grafana.example.com
  - Dashboard principal: `crypto-wallet-overview`
  - Dashboard de serviços: `crypto-wallet-services`
  - Dashboard de SLA: `crypto-wallet-sla`

- **Prometheus**: http://prometheus.example.com
  - Métricas principais: `crypto_wallet_*`
  - Alertas: `crypto_wallet_alerts`

- **Jaeger**: http://jaeger.example.com
  - Serviços: `auth-service`, `wallet-service`, `notification-service`

### Alertas Críticos

1. **High Error Rate**
   - Métrica: `rate(http_requests_total{status=~"5.."}[5m]) > 0.1`
   - Ação:
     ```bash
     # Verificar logs
     aws logs tail /ecs/crypto-wallet --follow
     
     # Verificar métricas
     curl -s 'http://prometheus:9090/api/v1/query' \
       --data-urlencode 'query=rate(http_requests_total{status=~"5.."}[5m])'
     ```

2. **High Latency**
   - Métrica: `http_request_duration_seconds{quantile="0.95"} > 2`
   - Ação:
     ```bash
     # Verificar traces lentos
     curl -s 'http://jaeger:16686/api/traces?service=auth-service&minDuration=2s'
     
     # Verificar CPU/Memória
     aws cloudwatch get-metric-statistics \
       --namespace AWS/ECS \
       --metric-name CPUUtilization \
       --dimensions Name=ServiceName,Value=auth-service \
       --start-time $(date -u -v-1H +"%Y-%m-%dT%H:%M:00Z") \
       --end-time $(date -u +"%Y-%m-%dT%H:%M:00Z") \
       --period 300 \
       --statistics Average
     ```

3. **Database Connection Issues**
   - Métrica: `db_connection_errors_total > 0`
   - Ação:
     ```bash
     # Verificar status do RDS
     aws rds describe-db-instances \
       --db-instance-identifier crypto-wallet
     
     # Verificar conexões ativas
     psql -h $DB_HOST -U $DB_USER -c "SELECT * FROM pg_stat_activity;"
     ```

## Problemas Comuns

### 1. Transações Pendentes

**Sintomas**:
- Status "pending" por mais de 30 minutos
- Usuário não recebe notificação
- Hash da transação não disponível

**Diagnóstico**:
```bash
# Verificar logs do wallet-service
aws logs tail /ecs/crypto-wallet/wallet-service --follow

# Verificar status na blockchain
curl -s "https://api.polygonscan.com/api/v2/transaction/$TX_HASH"

# Verificar fila de transações
aws sqs get-queue-attributes \
  --queue-url $QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages
```

**Solução**:
1. Se transação não foi enviada:
   ```bash
   # Reprocessar transação
   aws lambda invoke \
     --function-name transaction-retry \
     --payload '{"transactionId": "123"}' \
     output.json
   ```

2. Se transação está na blockchain:
   ```bash
   # Forçar atualização de status
   curl -X POST http://api.example.com/v1/transactions/$TX_ID/sync
   ```

### 2. Falhas no KYC

**Sintomas**:
- Upload de documentos falha
- Verificação fica pendente
- Usuário não recebe notificação

**Diagnóstico**:
```bash
# Verificar logs do KYC
aws logs tail /ecs/crypto-wallet/kyc-service --follow

# Verificar status do S3
aws s3 ls s3://crypto-wallet-kyc/pending/

# Verificar fila de processamento
aws sqs get-queue-attributes \
  --queue-url $KYC_QUEUE_URL \
  --attribute-names ApproximateNumberOfMessages
```

**Solução**:
1. Se upload falhou:
   ```bash
   # Verificar permissões do S3
   aws s3api get-bucket-policy --bucket crypto-wallet-kyc
   
   # Reprocessar upload
   aws lambda invoke \
     --function-name kyc-upload-retry \
     --payload '{"userId": "123", "documentType": "ID_FRONT"}' \
     output.json
   ```

2. Se verificação está pendente:
   ```bash
   # Forçar reprocessamento
   curl -X POST http://api.example.com/v1/kyc/requests/$REQUEST_ID/reprocess
   ```

### 3. Problemas com WhatsApp

**Sintomas**:
- Notificações não entregues
- Atraso nas notificações
- Erro ao vincular número

**Diagnóstico**:
```bash
# Verificar logs do notification-service
aws logs tail /ecs/crypto-wallet/notification-service --follow

# Verificar métricas do WhatsApp
curl -s 'http://prometheus:9090/api/v1/query' \
  --data-urlencode 'query=whatsapp_notifications_total'

# Verificar status da API
curl -I https://api.notus.com/v1/status
```

**Solução**:
1. Se API está indisponível:
   ```bash
   # Ativar fallback SMS
   aws ssm put-parameter \
     --name /crypto-wallet/notifications/fallback \
     --value SMS \
     --type String \
     --overwrite
   ```

2. Se notificações estão atrasadas:
   ```bash
   # Escalar workers
   aws ecs update-service \
     --cluster crypto-wallet \
     --service notification-service \
     --desired-count 4
   ```

## Logs e Diagnóstico

### Coleta de Logs

1. **Serviços Backend**:
```bash
# Últimos 100 logs de erro
aws logs filter-log-events \
  --log-group-name /ecs/crypto-wallet \
  --filter-pattern ERROR \
  --limit 100

# Logs por transação
aws logs filter-log-events \
  --log-group-name /ecs/crypto-wallet \
  --filter-pattern "$TRANSACTION_ID"
```

2. **Frontend**:
```bash
# Logs do CloudFront
aws logs get-log-records \
  --log-group-name /cloudfront/crypto-wallet \
  --filter-pattern "$USER_ID"

# Erros do cliente
curl -s 'http://prometheus:9090/api/v1/query' \
  --data-urlencode 'query=frontend_errors_total'
```

3. **Blockchain**:
```bash
# Status das transações
curl -s "https://api.polygonscan.com/api/v2/transaction/$TX_HASH"

# Logs do contrato
curl -s "https://api.polygonscan.com/api/v2/logs/$CONTRACT_ADDRESS"
```

### Análise de Performance

1. **Latência**:
```bash
# Latência por endpoint
curl -s 'http://prometheus:9090/api/v1/query' \
  --data-urlencode 'query=rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])'

# Traces lentos
curl -s 'http://jaeger:16686/api/traces?service=wallet-service&minDuration=1s'
```

2. **Recursos**:
```bash
# CPU por serviço
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=wallet-service \
  --start-time $(date -u -v-1H +"%Y-%m-%dT%H:%M:00Z") \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:00Z") \
  --period 300 \
  --statistics Average

# Memória por serviço
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=wallet-service \
  --start-time $(date -u -v-1H +"%Y-%m-%dT%H:%M:00Z") \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:00Z") \
  --period 300 \
  --statistics Average
```

## Recuperação de Falhas

### Database

1. **Failover RDS**:
```bash
# Forçar failover
aws rds reboot-db-instance \
  --db-instance-identifier crypto-wallet \
  --force-failover

# Verificar status
aws rds describe-db-instances \
  --db-instance-identifier crypto-wallet
```

2. **Restore de Backup**:
```bash
# Listar snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier crypto-wallet

# Restaurar snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier crypto-wallet-restored \
  --db-snapshot-identifier crypto-wallet-backup
```

### Cache

1. **Limpar Cache**:
```bash
# Limpar cache específico
redis-cli -h $REDIS_HOST -a $REDIS_PASS DEL "user:123:profile"

# Limpar cache por padrão
redis-cli -h $REDIS_HOST -a $REDIS_PASS --scan --pattern "user:*" | xargs redis-cli -h $REDIS_HOST -a $REDIS_PASS DEL
```

2. **Failover Redis**:
```bash
# Forçar failover
aws elasticache reboot-cache-cluster \
  --cache-cluster-id crypto-wallet \
  --cache-node-ids 0001

# Verificar status
aws elasticache describe-cache-clusters \
  --cache-cluster-id crypto-wallet
```

### Serviços

1. **Rollback de Deploy**:
```bash
# Reverter para versão anterior
aws ecs update-service \
  --cluster crypto-wallet \
  --service auth-service \
  --task-definition auth-service:$PREVIOUS_VERSION

# Verificar status
aws ecs describe-services \
  --cluster crypto-wallet \
  --services auth-service
```

2. **Restart de Serviço**:
```bash
# Forçar nova implantação
aws ecs update-service \
  --cluster crypto-wallet \
  --service auth-service \
  --force-new-deployment

# Verificar status
aws ecs describe-services \
  --cluster crypto-wallet \
  --services auth-service
```

## Performance

### Otimização

1. **Conexões de Banco**:
```sql
-- Verificar conexões ativas
SELECT * FROM pg_stat_activity;

-- Matar conexões inativas
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE state = 'idle' 
AND state_change < NOW() - INTERVAL '30 minutes';
```

2. **Cache**:
```bash
# Verificar hit rate
redis-cli -h $REDIS_HOST -a $REDIS_PASS INFO stats | grep hit_rate

# Verificar keys mais acessadas
redis-cli -h $REDIS_HOST -a $REDIS_PASS --stat
```

3. **API Gateway**:
```bash
# Verificar rate limiting
curl -s 'http://prometheus:9090/api/v1/query' \
  --data-urlencode 'query=rate(kong_http_requests_rate_limited[5m])'

# Ajustar limites
curl -X PATCH http://kong:8001/services/auth-service \
  -d "routes.1.plugins.1.config.minute=100"
```

### Scaling

1. **Auto Scaling**:
```bash
# Verificar políticas
aws application-autoscaling describe-scaling-policies \
  --service-namespace ecs \
  --resource-id service/crypto-wallet/auth-service

# Ajustar limites
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

2. **Capacity Planning**:
```bash
# Verificar utilização histórica
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=auth-service \
  --start-time $(date -u -v-7d +"%Y-%m-%dT%H:%M:00Z") \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:00Z") \
  --period 3600 \
  --statistics Average

# Ajustar capacidade
aws ecs update-service \
  --cluster crypto-wallet \
  --service auth-service \
  --desired-count 4
```

## Segurança

### Auditoria

1. **Logs de Acesso**:
```bash
# Verificar tentativas de login
aws logs filter-log-events \
  --log-group-name /ecs/crypto-wallet/auth-service \
  --filter-pattern "login attempt"

# Verificar acessos admin
aws logs filter-log-events \
  --log-group-name /ecs/crypto-wallet/admin-service \
  --filter-pattern "admin access"
```

2. **Alertas de Segurança**:
```bash
# Verificar alertas WAF
aws wafv2 get-web-acl \
  --name crypto-wallet \
  --scope REGIONAL

# Verificar bloqueios
curl -s 'http://prometheus:9090/api/v1/query' \
  --data-urlencode 'query=waf_blocks_total'
```

### Incidentes

1. **Bloqueio de IP**:
```bash
# Adicionar IP à blacklist
aws wafv2 update-ip-set \
  --name crypto-wallet-blacklist \
  --scope REGIONAL \
  --addresses "1.2.3.4/32"

# Verificar regras
aws wafv2 get-rule-group \
  --name crypto-wallet-rules \
  --scope REGIONAL
```

2. **Reset de Credenciais**:
```bash
# Forçar logout de usuário
redis-cli -h $REDIS_HOST -a $REDIS_PASS DEL "session:$USER_ID"

# Revogar tokens
curl -X POST http://api.example.com/v1/auth/revoke \
  -d "userId=$USER_ID"
```
