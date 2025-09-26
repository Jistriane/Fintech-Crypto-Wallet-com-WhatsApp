# Guia de Desenvolvimento

## Configuração do Ambiente

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- Git
- Visual Studio Code (recomendado)

### Extensões Recomendadas (VS Code)
- ESLint
- Prettier
- Docker
- GitLens
- Jest Runner
- TypeScript Hero

### Setup Inicial
1. Clone o repositório:
```bash
git clone git@github.com:fintech/crypto-wallet.git
cd crypto-wallet
```

2. Instale as dependências:
```bash
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp config/dev/.env-dev .env
# Edite .env com suas configurações
```

4. Inicie os serviços:
```bash
docker-compose up -d
```

5. Execute as migrations:
```bash
yarn workspace @common typeorm migration:run
```

## Estrutura do Projeto

```
.
├── services/                # Microserviços
│   ├── kyc/                # Serviço de KYC
│   ├── defi/               # Serviço DeFi
│   └── liquidity/          # Serviço de Liquidez
├── packages/
│   └── common/             # Código compartilhado
├── config/                 # Configurações por ambiente
├── docker/                 # Arquivos Docker
├── docs/                   # Documentação
└── test/                   # Testes de integração
```

### Organização dos Serviços
Cada serviço segue a estrutura Clean Architecture:
```
service/
├── src/
│   ├── api/               # Controllers e rotas
│   ├── application/       # Use cases
│   ├── domain/           # Entidades e regras
│   └── infrastructure/   # Implementações
├── test/                 # Testes unitários
└── package.json
```

## Padrões de Código

### Nomenclatura
- **Arquivos**: PascalCase para classes, camelCase para outros
- **Classes**: PascalCase
- **Interfaces**: Prefixo "I" + PascalCase
- **Variáveis/Funções**: camelCase
- **Constantes**: UPPER_SNAKE_CASE

### Imports
- Ordem: externos, internos, relativos
```typescript
// Externos
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

// Internos (@common)
import { User } from '@common/domain/entities';
import { IUserRepository } from '@common/domain/repositories';

// Relativos
import { KYCService } from '../services';
```

### Async/Await
- Sempre use async/await em vez de .then()
- Trate erros com try/catch
```typescript
async function example() {
  try {
    const result = await someAsyncOperation();
    return result;
  } catch (error) {
    // Log e re-throw com contexto
    logger.error('Failed to perform operation', { error });
    throw new OperationError(error.message);
  }
}
```

### Error Handling
- Use classes de erro customizadas
- Inclua contexto nos erros
- Log apropriado por nível
```typescript
export class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

// Uso
throw new ValidationError('Invalid format', 'email');
```

## Testes

### Unitários
```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<IUserRepository>;

  beforeEach(() => {
    repository = createMock<IUserRepository>();
    service = new UserService(repository);
  });

  it('should create user', async () => {
    // Arrange
    const userData = { /* ... */ };
    repository.create.mockResolvedValue(userData);

    // Act
    const result = await service.createUser(userData);

    // Assert
    expect(result).toEqual(userData);
    expect(repository.create).toHaveBeenCalledWith(userData);
  });
});
```

### Integração
```typescript
describe('KYC API', () => {
  it('should complete KYC flow', async () => {
    // Arrange
    const user = await createTestUser();
    
    // Act
    await api.post('/kyc/start').send({ userId: user.id });
    await api.post('/kyc/documents').send({ /* ... */ });
    
    // Assert
    const status = await api.get(`/kyc/status/${user.id}`);
    expect(status.body.level).toBe('LEVEL_2');
  });
});
```

## Blockchain

### Providers
- Use providers do pacote comum
- Configure timeouts e retries
```typescript
import { BlockchainProvider } from '@common/infrastructure/blockchain';

const provider = BlockchainProvider.getProvider('POLYGON');
const balance = await provider.getBalance(address);
```

### Transações
- Sempre use nonce gerenciado
- Implemente retry com backoff
- Monitore gas price
```typescript
async function sendTransaction(tx: Transaction): Promise<string> {
  const nonce = await getNonce(tx.from);
  const gasPrice = await getOptimalGasPrice();
  
  return await retryWithBackoff(
    () => provider.sendTransaction({ ...tx, nonce, gasPrice })
  );
}
```

## Cache

### Redis
- Use o cliente do pacote comum
- Implemente fallback
```typescript
import { RedisCache } from '@common/infrastructure/cache';

async function getData(key: string): Promise<Data> {
  // Tenta cache
  const cached = await RedisCache.get<Data>(key);
  if (cached) return cached;

  // Fallback para DB
  const data = await repository.find();
  await RedisCache.set(key, data, 3600);
  return data;
}
```

## Logging

### Winston
- Use níveis apropriados
- Inclua contexto
- Evite dados sensíveis
```typescript
import { logger } from '@common/infrastructure/logging';

logger.info('User created', {
  userId,
  kycLevel,
  // NÃO inclua: senha, privateKey, etc
});

logger.error('Transaction failed', {
  txHash,
  error: error.message,
  stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
});
```

## Segurança

### Chaves Privadas
- Nunca log ou exponha
- Use o serviço de criptografia
```typescript
import { WalletEncryption } from '@common/infrastructure/security';

const encrypted = await WalletEncryption.encryptPrivateKey(
  privateKey,
  userId
);
```

### Input Validation
- Valide toda entrada
- Sanitize dados
```typescript
import { validate } from 'class-validator';

@ValidateNested()
class CreateUserDto {
  @IsString()
  @Length(10, 15)
  phone: string;

  @IsEmail()
  email: string;
}
```

## CI/CD

### Commits
- Use commits semânticos
```
feat: add wallet creation
fix: handle race condition in nonce
docs: update API documentation
test: add integration tests for KYC
```

### Pull Requests
- Use o template
- Inclua testes
- Atualize documentação
- Adicione migrations se necessário

### Deploy
- Staging: automático na develop
- Produção: aprovação manual
- Monitore métricas pós-deploy

## Troubleshooting

### Logs
- Use o Kibana
- Filtre por correlationId
- Verifique níveis ERROR

### Métricas
- Dashboard no Grafana
- Alertas no Slack
- APM para performance

### Debug
- Use o debugger do VS Code
- Adicione logs temporários
- Reproduza localmente

## Contribuição

### Processo
1. Crie branch da develop
2. Implemente mudanças
3. Adicione testes
4. Atualize docs
5. Abra PR
6. Aguarde review

### Code Review
- Verifique cobertura
- Valide segurança
- Confirme performance
- Teste edge cases
