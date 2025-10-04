#!/bin/bash

# Configurações
STACK_NAME="crypto-wallet-staging"
TEMPLATE_FILE="infrastructure/staging.yaml"
REGION="us-east-1"
ENVIRONMENT="staging"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando deploy do ambiente de staging...${NC}"

# Validar template
echo -e "\n${YELLOW}Validando template CloudFormation...${NC}"
aws cloudformation validate-template \
  --template-body file://$TEMPLATE_FILE \
  --region $REGION

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro na validação do template!${NC}"
  exit 1
fi

# Criar secrets necessários
echo -e "\n${YELLOW}Criando secrets no Secrets Manager...${NC}"

# Secret para banco de dados
aws secretsmanager create-secret \
  --name "$ENVIRONMENT/db" \
  --description "Credenciais do banco de dados para ambiente de staging" \
  --secret-string '{
    "username": "admin",
    "password": "'$(openssl rand -base64 32)'",
    "url": "postgresql://admin:password@db-host:5432/cryptowallet"
  }' \
  --region $REGION

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro ao criar secrets!${NC}"
  exit 1
fi

# Criar stack
echo -e "\n${YELLOW}Criando/atualizando stack CloudFormation...${NC}"
aws cloudformation deploy \
  --template-file $TEMPLATE_FILE \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=$ENVIRONMENT \
  --region $REGION

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro no deploy da stack!${NC}"
  exit 1
fi

# Obter outputs
echo -e "\n${YELLOW}Obtendo informações do ambiente...${NC}"
OUTPUTS=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output text \
  --region $REGION)

echo -e "\n${GREEN}Ambiente de staging implantado com sucesso!${NC}"
echo -e "\n${YELLOW}Outputs:${NC}"
echo "$OUTPUTS"

# Atualizar arquivo de configuração
echo -e "\n${YELLOW}Atualizando arquivo de configuração...${NC}"

# Extrair valores dos outputs
DB_ENDPOINT=$(echo "$OUTPUTS" | grep DatabaseEndpoint | cut -f2)
REDIS_ENDPOINT=$(echo "$OUTPUTS" | grep RedisEndpoint | cut -f2)
ALB_DNS=$(echo "$OUTPUTS" | grep LoadBalancerDNS | cut -f2)

# Criar arquivo de configuração
cat > .env.staging << EOF
# Ambiente
NODE_ENV=staging

# Endpoints
API_URL=http://$ALB_DNS
DATABASE_URL=postgresql://admin:password@$DB_ENDPOINT:5432/cryptowallet
REDIS_URL=redis://$REDIS_ENDPOINT:6379

# Monitoramento
PROMETHEUS_ENDPOINT=http://prometheus:9090
GRAFANA_ENDPOINT=http://grafana:3000

# Limites
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_DURATION=60
EOF

echo -e "\n${GREEN}Arquivo de configuração .env.staging criado com sucesso!${NC}"

# Criar repositórios ECR
echo -e "\n${YELLOW}Criando repositórios ECR...${NC}"
SERVICES=("auth-service" "wallet-service" "notification-service" "analytics-service")

for service in "${SERVICES[@]}"; do
  aws ecr create-repository \
    --repository-name $service \
    --image-scanning-configuration scanOnPush=true \
    --region $REGION

  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro ao criar repositório ECR para $service!${NC}"
    continue
  fi
done

# Build e push das imagens
echo -e "\n${YELLOW}Fazendo build e push das imagens...${NC}"

# Login no ECR
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com

for service in "${SERVICES[@]}"; do
  echo -e "\n${YELLOW}Building $service...${NC}"
  docker build -t $service:$ENVIRONMENT -f services/$service/Dockerfile .
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro no build de $service!${NC}"
    continue
  fi

  echo -e "${YELLOW}Pushing $service...${NC}"
  docker tag $service:$ENVIRONMENT $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$service:$ENVIRONMENT
  docker push $AWS_ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$service:$ENVIRONMENT

  if [ $? -ne 0 ]; then
    echo -e "${RED}Erro no push de $service!${NC}"
    continue
  fi
done

# Configurar monitoramento
echo -e "\n${YELLOW}Configurando monitoramento...${NC}"

# Instalar Prometheus
helm upgrade --install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  --create-namespace \
  --values infrastructure/prometheus-values.yaml \
  --set server.remoteWrite[0].url=https://aps-workspaces.$REGION.amazonaws.com/workspaces/$(echo "$OUTPUTS" | grep PrometheusWorkspaceId | cut -f2)/api/v1/remote_write \
  --set server.remoteWrite[0].sigv4.region=$REGION

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro na instalação do Prometheus!${NC}"
fi

# Instalar Grafana
helm upgrade --install grafana grafana/grafana \
  --namespace monitoring \
  --create-namespace \
  --values infrastructure/grafana-values.yaml \
  --set "grafana\.ini.auth\.aws\.workspace_id=$(echo "$OUTPUTS" | grep GrafanaWorkspaceId | cut -f2)"

if [ $? -ne 0 ]; then
  echo -e "${RED}Erro na instalação do Grafana!${NC}"
fi

echo -e "\n${GREEN}Deploy do ambiente de staging concluído com sucesso!${NC}"
echo -e "\nAcesse o ambiente em: http://$ALB_DNS"