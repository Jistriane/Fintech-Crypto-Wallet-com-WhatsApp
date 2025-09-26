import { AuthService } from '../infrastructure/security/AuthService';
import { IUserRepository } from '../domain/repositories/IUserRepository';
import { NotusWhatsAppService } from '../../../services/kyc/src/infrastructure/whatsapp/NotusWhatsAppService';
import { User } from '../domain/entities/User';
import { RedisCache } from '../infrastructure/cache/RedisCache';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<IUserRepository>;
  let whatsappService: jest.Mocked<NotusWhatsAppService>;

  beforeEach(() => {
    userRepository = {
      findByPhone: jest.fn(),
      findById: jest.fn()
    } as any;

    whatsappService = {
      send2FACode: jest.fn()
    } as any;

    authService = new AuthService(userRepository, whatsappService);
  });

  describe('authenticate', () => {
    it('should start authentication process for valid user', async () => {
      // Arrange
      const phone = '+5511999999999';
      const deviceId = 'device123';
      const ip = '127.0.0.1';

      const mockUser = new User(
        'user123',
        phone,
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      userRepository.findByPhone.mockResolvedValue(mockUser);

      // Act
      const result = await authService.authenticate(phone, deviceId, ip);

      // Assert
      expect(result).toBeDefined();
      expect(result.sessionId).toBeDefined();
      expect(result.token).toBe(''); // Token vazio até 2FA
      expect(whatsappService.send2FACode).toHaveBeenCalled();
    });

    it('should throw error for invalid user', async () => {
      // Arrange
      const phone = '+5511999999999';
      const deviceId = 'device123';
      const ip = '127.0.0.1';

      userRepository.findByPhone.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.authenticate(phone, deviceId, ip))
        .rejects
        .toThrow('User not found');
    });

    it('should block after too many failed attempts', async () => {
      // Arrange
      const phone = '+5511999999999';
      const deviceId = 'device123';
      const ip = '127.0.0.1';

      userRepository.findByPhone.mockResolvedValue(null);

      // Simular muitas tentativas falhas
      for (let i = 0; i < 5; i++) {
        try {
          await authService.authenticate(phone, deviceId, ip);
        } catch {}
      }

      // Act & Assert
      await expect(authService.authenticate(phone, deviceId, ip))
        .rejects
        .toThrow('Too many failed attempts');
    });
  });

  describe('verify2FA', () => {
    it('should verify 2FA code successfully', async () => {
      // Arrange
      const sessionId = 'session123';
      const code = '123456';
      const mockSession = {
        userId: 'user123',
        phone: '+5511999999999',
        deviceId: 'device123',
        ip: '127.0.0.1'
      };

      const mockUser = new User(
        'user123',
        '+5511999999999',
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      // Mock do Redis para sessão e código
      jest.spyOn(RedisCache, 'get')
        .mockImplementation((key: string) => {
          if (key.includes('session')) return Promise.resolve(mockSession);
          if (key.includes('2fa')) return Promise.resolve(code);
          return Promise.resolve(null);
        });

      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verify2FA(sessionId, code);

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid code', async () => {
      // Arrange
      const sessionId = 'session123';
      const code = '123456';
      const wrongCode = '654321';
      const mockSession = {
        userId: 'user123',
        phone: '+5511999999999',
        deviceId: 'device123',
        ip: '127.0.0.1'
      };

      // Mock do Redis
      jest.spyOn(RedisCache, 'get')
        .mockImplementation((key: string) => {
          if (key.includes('session')) return Promise.resolve(mockSession);
          if (key.includes('2fa')) return Promise.resolve(code);
          return Promise.resolve(null);
        });

      // Act & Assert
      await expect(authService.verify2FA(sessionId, wrongCode))
        .rejects
        .toThrow('Invalid code');
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user123',
        kycLevel: 'LEVEL_2',
        phone: '+5511999999999',
        sessionId: 'session123'
      };

      const token = authService['generateToken'](mockPayload);
      const mockSession = {
        userId: 'user123',
        kycLevel: 'LEVEL_2',
        phone: '+5511999999999',
        deviceId: 'device123',
        ip: '127.0.0.1',
        createdAt: new Date(),
        lastActivity: new Date()
      };

      // Mock do Redis
      jest.spyOn(RedisCache, 'get')
        .mockImplementation((key: string) => {
          if (key.includes('session')) return Promise.resolve(mockSession);
          return Promise.resolve(null);
        });

      // Act
      const result = await authService.validateToken(token);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(mockPayload.userId);
      expect(result.kycLevel).toBe(mockPayload.kycLevel);
    });

    it('should throw error for invalid token', async () => {
      // Arrange
      const token = 'invalid_token';

      // Act & Assert
      await expect(authService.validateToken(token))
        .rejects
        .toThrow('Invalid token');
    });

    it('should throw error for expired session', async () => {
      // Arrange
      const mockPayload = {
        userId: 'user123',
        kycLevel: 'LEVEL_2',
        phone: '+5511999999999',
        sessionId: 'session123'
      };

      const token = authService['generateToken'](mockPayload);

      // Mock do Redis retornando null (sessão expirada)
      jest.spyOn(RedisCache, 'get').mockResolvedValue(null);

      // Act & Assert
      await expect(authService.validateToken(token))
        .rejects
        .toThrow('Invalid session');
    });
  });

  describe('revokeSession', () => {
    it('should revoke session successfully', async () => {
      // Arrange
      const sessionId = 'session123';
      const mockDel = jest.spyOn(RedisCache, 'del');

      // Act
      await authService.revokeSession(sessionId);

      // Assert
      expect(mockDel).toHaveBeenCalled();
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all user sessions', async () => {
      // Arrange
      const userId = 'user123';
      const mockKeys = ['session:1', 'session:2'];
      const mockSessions = [
        { userId: 'user123' },
        { userId: 'user123' }
      ];

      // Mock do Redis
      jest.spyOn(RedisCache.getInstance(), 'keys')
        .mockResolvedValue(mockKeys);
      
      jest.spyOn(RedisCache, 'get')
        .mockImplementation((key: string, index: number) => 
          Promise.resolve(mockSessions[index])
        );

      const mockDel = jest.spyOn(RedisCache, 'del');

      // Act
      await authService.revokeAllSessions(userId);

      // Assert
      expect(mockDel).toHaveBeenCalledTimes(mockKeys.length);
    });
  });
});
