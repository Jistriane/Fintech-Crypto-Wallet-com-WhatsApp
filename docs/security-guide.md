# Guia de Segurança - Notus

## 📋 Índice
1. [Visão Geral de Segurança](#visão-geral-de-segurança)
2. [Autenticação e Autorização](#autenticação-e-autorização)
3. [Proteção de Dados](#proteção-de-dados)
4. [Segurança de API](#segurança-de-api)
5. [Segurança de Blockchain](#segurança-de-blockchain)
6. [Monitoramento e Auditoria](#monitoramento-e-auditoria)
7. [Compliance](#compliance)
8. [Resposta a Incidentes](#resposta-a-incidentes)

## 🔒 Visão Geral de Segurança

O Notus implementa múltiplas camadas de segurança para proteger dados sensíveis, transações financeiras e informações pessoais dos usuários.

### Princípios de Segurança
- **Defesa em Profundidade**: Múltiplas camadas de proteção
- **Princípio do Menor Privilégio**: Acesso mínimo necessário
- **Segurança por Design**: Segurança integrada desde o início
- **Transparência**: Auditoria e monitoramento contínuos

## 🔐 Autenticação e Autorização

### Autenticação Multi-Fator (MFA)
```typescript
// Implementação de 2FA
export class TwoFactorService {
  async generateSecret(userId: string): Promise<string> {
    const secret = speakeasy.generateSecret({
      name: 'Notus Wallet',
      account: userId,
      issuer: 'Notus'
    });
    
    await this.storeSecret(userId, secret.base32);
    return secret.base32;
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const secret = await this.getSecret(userId);
    return speakeasy.totp.verify({
      secret,
      token,
      window: 2
    });
  }
}
```

### JWT com Refresh Tokens
```typescript
// Geração de tokens seguros
export class AuthService {
  generateTokens(user: User) {
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  async validateToken(token: string): Promise<User> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      return await this.getUserById(decoded.userId);
    } catch (error) {
      throw new UnauthorizedError('Invalid token');
    }
  }
}
```

### Controle de Acesso Baseado em Roles (RBAC)
```typescript
// Middleware de autorização
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Uso nos endpoints
router.get('/admin/users', 
  authenticateToken, 
  requireRole(['admin', 'super_admin']),
  getUsers
);
```

## 🛡️ Proteção de Dados

### Criptografia de Dados Sensíveis
```typescript
import crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('notus', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(
      this.algorithm, 
      this.key
    );
    
    decipher.setAAD(Buffer.from('notus', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Hash de Senhas
```typescript
import bcrypt from 'bcryptjs';

export class PasswordService {
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateSecurePassword(): Promise<string> {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}
```

### Sanitização de Dados
```typescript
import DOMPurify from 'dompurify';
import validator from 'validator';

export class SanitizationService {
  sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      // Remove HTML tags e scripts
      const clean = DOMPurify.sanitize(input);
      
      // Valida formato
      if (validator.isEmail(clean)) {
        return validator.normalizeEmail(clean);
      }
      
      return clean.trim();
    }
    
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item));
    }
    
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        sanitized[key] = this.sanitizeInput(value);
      }
      return sanitized;
    }
    
    return input;
  }
}
```

## 🔒 Segurança de API

### Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// Rate limiting por IP
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting por usuário
export const userLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // máximo 50 requests por usuário
  keyGenerator: (req) => req.user?.id || req.ip,
  message: 'Too many requests from this user'
});

// Rate limiting para endpoints sensíveis
export const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // máximo 5 tentativas de login
  keyGenerator: (req) => req.ip,
  message: 'Too many login attempts'
});
```

### Validação de Entrada
```typescript
import Joi from 'joi';

// Schemas de validação
export const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required(),
  phone: Joi.string().pattern(/^\+[1-9]\d{1,14}$/).optional()
});

export const transactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  toAddress: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  token: Joi.string().required()
});

// Middleware de validação
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    
    next();
  };
};
```

### Headers de Segurança
```typescript
import helmet from 'helmet';

// Configuração de headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.notus.com"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configurado
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Version']
}));
```

## ⛓️ Segurança de Blockchain

### Validação de Endereços
```typescript
import { ethers } from 'ethers';

export class BlockchainSecurityService {
  validateEthereumAddress(address: string): boolean {
    try {
      return ethers.utils.isAddress(address);
    } catch {
      return false;
    }
  }

  validateTransaction(tx: Transaction): boolean {
    // Verificar se o endereço de destino é válido
    if (!this.validateEthereumAddress(tx.toAddress)) {
      return false;
    }

    // Verificar se o valor é positivo
    if (tx.amount <= 0) {
      return false;
    }

    // Verificar se o usuário tem saldo suficiente
    return this.checkBalance(tx.fromAddress, tx.amount);
  }

  async checkBalance(address: string, amount: number): Promise<boolean> {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const balance = await provider.getBalance(address);
    return balance.gte(ethers.utils.parseEther(amount.toString()));
  }
}
```

### Assinatura de Transações
```typescript
export class TransactionSecurityService {
  async signTransaction(transaction: Transaction, privateKey: string): Promise<string> {
    const wallet = new ethers.Wallet(privateKey);
    
    // Verificar se a transação é válida
    if (!this.validateTransaction(transaction)) {
      throw new Error('Invalid transaction');
    }

    // Assinar a transação
    const signedTx = await wallet.signTransaction({
      to: transaction.toAddress,
      value: ethers.utils.parseEther(transaction.amount.toString()),
      gasLimit: 21000,
      gasPrice: await this.getGasPrice()
    });

    return signedTx;
  }

  async verifySignature(transaction: Transaction, signature: string): Promise<boolean> {
    try {
      const recoveredAddress = ethers.utils.verifyMessage(
        this.getTransactionHash(transaction),
        signature
      );
      return recoveredAddress.toLowerCase() === transaction.fromAddress.toLowerCase();
    } catch {
      return false;
    }
  }
}
```

## 📊 Monitoramento e Auditoria

### Logs de Segurança
```typescript
import winston from 'winston';

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'security.log' }),
    new winston.transports.Console()
  ]
});

export class SecurityAuditService {
  logLoginAttempt(userId: string, success: boolean, ip: string) {
    securityLogger.info('Login attempt', {
      userId,
      success,
      ip,
      timestamp: new Date().toISOString()
    });
  }

  logSuspiciousActivity(userId: string, activity: string, details: any) {
    securityLogger.warn('Suspicious activity detected', {
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  }

  logDataAccess(userId: string, resource: string, action: string) {
    securityLogger.info('Data access', {
      userId,
      resource,
      action,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Detecção de Anomalias
```typescript
export class AnomalyDetectionService {
  async detectSuspiciousActivity(userId: string, activity: any): Promise<boolean> {
    // Verificar múltiplos logins de IPs diferentes
    const recentLogins = await this.getRecentLogins(userId, 24); // últimas 24h
    const uniqueIPs = new Set(recentLogins.map(login => login.ip));
    
    if (uniqueIPs.size > 5) {
      await this.alertSecurityTeam(userId, 'Multiple IP logins');
      return true;
    }

    // Verificar transações de alto valor
    if (activity.type === 'transaction' && activity.amount > 10000) {
      await this.requireAdditionalVerification(userId);
      return true;
    }

    // Verificar tentativas de acesso a recursos sensíveis
    if (activity.resource === 'admin' && activity.user.role !== 'admin') {
      await this.blockUser(userId);
      return true;
    }

    return false;
  }
}
```

## 📋 Compliance

### KYC/AML
```typescript
export class ComplianceService {
  async performKYCCheck(userId: string): Promise<ComplianceResult> {
    const user = await this.getUser(userId);
    
    // Verificar documentos
    const documents = await this.getUserDocuments(userId);
    if (!this.validateDocuments(documents)) {
      return { status: 'rejected', reason: 'Invalid documents' };
    }

    // Verificar lista negra
    if (await this.checkBlacklist(user)) {
      return { status: 'rejected', reason: 'User in blacklist' };
    }

    // Verificar PEP (Politically Exposed Person)
    if (await this.checkPEP(user)) {
      return { status: 'pending', reason: 'PEP verification required' };
    }

    return { status: 'approved' };
  }

  async generateComplianceReport(): Promise<ComplianceReport> {
    const report = {
      totalUsers: await this.getTotalUsers(),
      kycApproved: await this.getKYCApprovedUsers(),
      kycPending: await this.getKYCPendingUsers(),
      kycRejected: await this.getKYCRejectedUsers(),
      suspiciousActivities: await this.getSuspiciousActivities(),
      generatedAt: new Date()
    };

    return report;
  }
}
```

### LGPD/GDPR
```typescript
export class DataProtectionService {
  async anonymizeUserData(userId: string): Promise<void> {
    // Anonimizar dados pessoais
    await this.updateUser(userId, {
      name: 'ANONYMIZED',
      email: `anonymized_${userId}@deleted.com`,
      phone: null,
      documents: null
    });

    // Manter apenas dados necessários para compliance
    await this.keepComplianceData(userId);
  }

  async exportUserData(userId: string): Promise<UserDataExport> {
    const user = await this.getUser(userId);
    const transactions = await this.getUserTransactions(userId);
    const documents = await this.getUserDocuments(userId);

    return {
      personalData: user,
      transactions,
      documents,
      exportedAt: new Date()
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    // Verificar se pode deletar (período de retenção)
    const canDelete = await this.checkRetentionPeriod(userId);
    if (!canDelete) {
      throw new Error('Data retention period not expired');
    }

    // Deletar dados pessoais
    await this.deleteUserPersonalData(userId);
    
    // Manter dados para compliance
    await this.archiveForCompliance(userId);
  }
}
```

## 🚨 Resposta a Incidentes

### Plano de Resposta
```typescript
export class IncidentResponseService {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // 1. Isolar o sistema afetado
    await this.isolateAffectedSystems(incident);

    // 2. Notificar equipe de segurança
    await this.notifySecurityTeam(incident);

    // 3. Coletar evidências
    await this.collectEvidence(incident);

    // 4. Implementar correções
    await this.implementFixes(incident);

    // 5. Monitorar recuperação
    await this.monitorRecovery(incident);
  }

  async notifySecurityTeam(incident: SecurityIncident): Promise<void> {
    const message = {
      severity: incident.severity,
      type: incident.type,
      description: incident.description,
      affectedSystems: incident.affectedSystems,
      timestamp: incident.timestamp
    };

    // Enviar notificação via Slack/Email
    await this.sendNotification(message);
  }
}
```

### Backup e Recuperação
```typescript
export class BackupService {
  async createBackup(): Promise<BackupInfo> {
    const timestamp = new Date().toISOString();
    const backupId = `backup_${timestamp}`;

    // Backup do banco de dados
    await this.backupDatabase(backupId);

    // Backup de arquivos
    await this.backupFiles(backupId);

    // Backup de configurações
    await this.backupConfigurations(backupId);

    return {
      id: backupId,
      timestamp,
      size: await this.getBackupSize(backupId),
      location: await this.getBackupLocation(backupId)
    };
  }

  async restoreBackup(backupId: string): Promise<void> {
    // Verificar integridade do backup
    await this.verifyBackupIntegrity(backupId);

    // Restaurar banco de dados
    await this.restoreDatabase(backupId);

    // Restaurar arquivos
    await this.restoreFiles(backupId);

    // Verificar sistema após restauração
    await this.verifySystemIntegrity();
  }
}
```

---

**Notus Security** - Segurança em primeiro lugar 🔒
