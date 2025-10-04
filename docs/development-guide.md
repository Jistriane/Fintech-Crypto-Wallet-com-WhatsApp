# Guia de Desenvolvimento - Notus

## 📋 Índice
1. [Configuração do Ambiente](#configuração-do-ambiente)
2. [Estrutura do Código](#estrutura-do-código)
3. [Padrões de Desenvolvimento](#padrões-de-desenvolvimento)
4. [Testes](#testes)
5. [Debugging](#debugging)
6. [Performance](#performance)
7. [Contribuição](#contribuição)

## 🛠️ Configuração do Ambiente

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose
- Git
- VS Code (recomendado)

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

### Desenvolvimento Local
```bash
# Iniciar todos os serviços
npm run dev

# Ou iniciar individualmente
npm run dev:admin      # Frontend admin
npm run dev:auth       # Serviço de autenticação
npm run dev:services   # Microserviços
```

### Docker Development
```bash
# Iniciar com Docker
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down
```

## 📁 Estrutura do Código

### Frontend (crypto-wallet-admin)
```
src/
├── app/                    # App Router (Next.js 13+)
│   ├── admin/             # Páginas administrativas
│   ├── auth/              # Páginas de autenticação
│   └── layout.tsx         # Layout principal
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── forms/            # Formulários
│   └── charts/           # Gráficos
├── contexts/             # Contextos React
├── hooks/                # Custom hooks
├── lib/                  # Utilitários
├── services/             # Serviços de API
├── types/                # Definições TypeScript
└── providers/            # Providers
```

### Backend Services
```
services/auth-service/
├── src/
│   ├── controllers/       # Controladores
│   ├── routes/          # Rotas
│   ├── services/        # Lógica de negócio
│   ├── repositories/    # Acesso a dados
│   ├── interfaces/     # Interfaces
│   ├── middleware/     # Middlewares
│   └── utils/         # Utilitários
├── prisma/             # Schema e migrações
├── tests/             # Testes
└── Dockerfile         # Container
```

### Mobile (crypto-wallet-mobile)
```
src/
├── components/         # Componentes
├── screens/           # Telas
├── navigation/        # Navegação
├── services/         # Serviços
├── store/           # Estado global
├── types/          # Tipos TypeScript
└── theme/          # Tema
```

## 🎯 Padrões de Desenvolvimento

### TypeScript
```typescript
// Sempre use tipos explícitos
interface User {
  id: string;
  name: string;
  email: string;
}

// Use generics quando apropriado
interface ApiResponse<T> {
  data: T;
  success: boolean;
}

// Prefira interfaces sobre types
interface UserService {
  getUser(id: string): Promise<User>;
  createUser(user: Omit<User, 'id'>): Promise<User>;
}
```

### React Components
```typescript
// Use function components com hooks
import { useState, useEffect } from 'react';

interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

export function UserCard({ user, onEdit }: UserCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = async () => {
    setIsLoading(true);
    try {
      await onEdit(user);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={handleEdit} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Edit'}
      </button>
    </div>
  );
}
```

### API Controllers
```typescript
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { validateUser } from '../validators/user.validator';

export class UserController {
  constructor(private userService: UserService) {}

  async getUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const users = await this.userService.findAll(+page, +limit);
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      const validation = validateUser(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.errors
        });
      }

      const user = await this.userService.create(req.body);
      res.status(201).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}
```

### Database (Prisma)
```typescript
// Schema
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Repository
export class UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(page: number, limit: number) {
    return this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
  }

  async create(data: CreateUserData) {
    return this.prisma.user.create({
      data
    });
  }
}
```

## 🧪 Testes

### Configuração Jest
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Testes Unitários
```typescript
// user.service.test.ts
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';

describe('UserService', () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    } as any;

    userService = new UserService(mockRepository);
  });

  describe('findAll', () => {
    it('should return users with pagination', async () => {
      const mockUsers = [
        { id: '1', name: 'John', email: 'john@example.com' }
      ];
      mockRepository.findAll.mockResolvedValue(mockUsers);

      const result = await userService.findAll(1, 10);

      expect(result).toEqual(mockUsers);
      expect(mockRepository.findAll).toHaveBeenCalledWith(1, 10);
    });
  });
});
```

### Testes de Integração
```typescript
// auth.integration.test.ts
import request from 'supertest';
import { app } from '../app';

describe('Auth Integration', () => {
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

### Testes E2E
```typescript
// user.e2e.test.ts
import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('should create a new user', async ({ page }) => {
    await page.goto('/admin/users');
    
    await page.click('[data-testid="create-user-button"]');
    
    await page.fill('[data-testid="user-name"]', 'John Doe');
    await page.fill('[data-testid="user-email"]', 'john@example.com');
    
    await page.click('[data-testid="save-user-button"]');
    
    await expect(page.locator('[data-testid="user-list"]')).toContainText('John Doe');
  });
});
```

## 🐛 Debugging

### Frontend Debugging
```typescript
// Use React DevTools
import { useState, useEffect } from 'react';

function UserComponent() {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    console.log('Users updated:', users);
  }, [users]);

  // Use debugger para breakpoints
  const handleUserClick = (user: User) => {
    debugger; // Breakpoint aqui
    console.log('User clicked:', user);
  };
}
```

### Backend Debugging
```typescript
// Use logging estruturado
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

export class UserService {
  async createUser(userData: CreateUserData) {
    logger.debug('Creating user', { userData });
    
    try {
      const user = await this.userRepository.create(userData);
      logger.info('User created successfully', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, userData });
      throw error;
    }
  }
}
```

### Docker Debugging
```bash
# Ver logs de um serviço específico
docker-compose logs -f auth_service

# Entrar no container
docker-compose exec auth_service sh

# Ver status dos containers
docker-compose ps

# Rebuild um serviço específico
docker-compose build auth_service
docker-compose up -d auth_service
```

## ⚡ Performance

### Frontend Performance
```typescript
// Use React.memo para componentes pesados
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }: { data: any[] }) => {
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
});

// Use useMemo para cálculos pesados
import { useMemo } from 'react';

function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  return (
    <div>
      {sortedUsers.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

### Backend Performance
```typescript
// Use cache para consultas frequentes
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export class UserService {
  async getUser(id: string) {
    // Verificar cache primeiro
    const cached = await redis.get(`user:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Buscar no banco
    const user = await this.userRepository.findById(id);
    
    // Cachear resultado
    await redis.setex(`user:${id}`, 300, JSON.stringify(user));
    
    return user;
  }
}

// Use paginação para listas grandes
export class UserController {
  async getUsers(req: Request, res: Response) {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 10);
    
    const users = await this.userService.findAll(page, limit);
    res.json(users);
  }
}
```

### Database Performance
```sql
-- Use índices apropriados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Use queries otimizadas
SELECT u.*, COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
WHERE u.created_at >= '2024-01-01'
GROUP BY u.id
ORDER BY u.created_at DESC
LIMIT 10;
```

## 🤝 Contribuição

### Workflow
1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Faça commit: `git commit -m 'feat: adiciona nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

### Padrões de Commit
```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
style: formatação
refactor: refatoração
test: testes
chore: tarefas de manutenção
```

### Code Review
- Código limpo e legível
- Testes adequados
- Documentação atualizada
- Performance considerada
- Segurança verificada

### Checklist
- [ ] Código testado
- [ ] Documentação atualizada
- [ ] Performance verificada
- [ ] Segurança considerada
- [ ] Padrões seguidos
- [ ] CI/CD passando

---

**Notus Development** - Guia completo para desenvolvedores 🚀
