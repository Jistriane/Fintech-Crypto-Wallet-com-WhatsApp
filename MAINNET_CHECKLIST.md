# 🔐 CHECKLIST PARA DEPLOY EM MAINNET

## ⚠️ **CRÍTICO - VERIFICAR ANTES DO DEPLOY**

### **1. SEGURANÇA - CHAVES E SENHAS**
- [ ] **JWT_SECRET**: Gerar nova chave forte (64+ caracteres)
- [ ] **REFRESH_TOKEN_SECRET**: Gerar nova chave forte (64+ caracteres)
- [ ] **MASTER_KEY**: Gerar nova chave forte (128+ caracteres)
- [ ] **ENCRYPTION_KEY**: Gerar nova chave forte (32 caracteres)
- [ ] **DB_PASSWORD**: Gerar senha forte para PostgreSQL
- [ ] **REDIS_PASSWORD**: Gerar senha forte para Redis
- [ ] **NOTUS_API_KEY**: Configurar chave real da API Notus
- [ ] **WHATSAPP_API_TOKEN**: Configurar token real do WhatsApp

### **2. BLOCKCHAIN - CONFIGURAÇÕES MAINNET**
- [ ] **ETHEREUM_RPC_URL**: Configurar Infura/Alchemy para Ethereum mainnet
- [ ] **POLYGON_RPC_URL**: Configurar Infura/Alchemy para Polygon mainnet
- [ ] **BSC_RPC_URL**: Verificar se está usando BSC mainnet (não testnet)
- [ ] **CHAIN_IDS**: Verificar se estão corretos (1, 137, 56)

### **3. BANCO DE DADOS - CONFIGURAÇÕES DE PRODUÇÃO**
- [ ] **DATABASE_URL**: Configurar URL real do banco de produção
- [ ] **REDIS_URL**: Configurar URL real do Redis de produção
- [ ] **DB_POOL**: Configurar pool de conexões adequado
- [ ] **BACKUP**: Configurar backup automático

### **4. MONITORAMENTO E LOGS**
- [ ] **SENTRY_DSN**: Configurar Sentry para monitoramento
- [ ] **LOG_LEVEL**: Configurar para 'warn' ou 'error'
- [ ] **PROMETHEUS**: Configurar métricas
- [ ] **GRAFANA**: Configurar dashboards

### **5. REDE E SEGURANÇA**
- [ ] **CORS_ORIGIN**: Configurar domínios reais
- [ ] **HELMET**: Habilitar headers de segurança
- [ ] **RATE_LIMITING**: Configurar limites adequados
- [ ] **SSL/TLS**: Configurar certificados SSL

### **6. COMPLIANCE E AUDITORIA**
- [ ] **LGPD**: Configurar retenção de dados
- [ ] **AUDIT_LOG**: Habilitar logs de auditoria
- [ ] **PRIVACY_MODE**: Habilitar modo privacidade
- [ ] **DATA_RETENTION**: Configurar retenção de dados

### **7. CONFIGURAÇÕES DE AMBIENTE**
- [ ] **NODE_ENV**: Configurar para 'production'
- [ ] **ENVIRONMENT**: Configurar para 'mainnet'
- [ ] **TEST_MODE**: Desabilitar em produção
- [ ] **MOCK_DATA**: Desabilitar em produção
- [ ] **DEBUG_MODE**: Desabilitar em produção

### **8. ALERTAS E NOTIFICAÇÕES**
- [ ] **ALERT_EMAIL**: Configurar email para alertas
- [ ] **ALERT_SLACK**: Configurar webhook do Slack
- [ ] **MONITORING**: Configurar alertas de sistema

### **9. BACKUP E RECUPERAÇÃO**
- [ ] **BACKUP_ENABLED**: Habilitar backup automático
- [ ] **BACKUP_SCHEDULE**: Configurar cronograma
- [ ] **BACKUP_RETENTION**: Configurar retenção
- [ ] **DISASTER_RECOVERY**: Testar recuperação

### **10. TESTES FINAIS**
- [ ] **SMOKE_TESTS**: Executar testes de fumaça
- [ ] **LOAD_TESTS**: Executar testes de carga
- [ ] **SECURITY_TESTS**: Executar testes de segurança
- [ ] **INTEGRATION_TESTS**: Executar testes de integração

---

## 🚨 **COMANDOS PARA GERAR CHAVES SEGURAS**

```bash
# Gerar chaves seguras
node scripts/generate-secure-keys.js

# Verificar configurações
npm run check:mainnet

# Executar testes de segurança
npm run test:security

# Verificar contratos
npm run verify:contracts
```

---

## 📋 **ARQUIVOS A VERIFICAR**

- [ ] `config/mainnet/.env-mainnet`
- [ ] `docker-compose.yml`
- [ ] `docker-compose.prod.yml`
- [ ] `scripts/deploy-mainnet-secure.ts`
- [ ] `hardhat.config.ts`
- [ ] `contracts/` (todos os contratos)

---

## ⚠️ **AVISOS IMPORTANTES**

1. **NUNCA** commite chaves reais no Git
2. **SEMPRE** use variáveis de ambiente
3. **SEMPRE** teste em ambiente de homologação primeiro
4. **SEMPRE** faça backup antes do deploy
5. **SEMPRE** monitore logs após o deploy

---

## 🎯 **STATUS DO DEPLOY**

- [ ] **Configurações**: ✅ Prontas
- [ ] **Chaves**: ❌ Pendente
- [ ] **Testes**: ❌ Pendente
- [ ] **Deploy**: ❌ Pendente

**Status Atual**: 🔴 **NÃO PRONTO PARA MAINNET**
