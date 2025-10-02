import { AuthService } from '../infrastructure/security/AuthService';
import { KYCLevel, KYCStatus, TokenPayload } from '../types';
import { mockLogger, mockUserRepository, mockWhatsAppService, testUser } from './setup';

describe('AuthService', () => {
  let authService: AuthService;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue('OK');
    mockUserRepository.findOne.mockResolvedValue(testUser);

    authService = new AuthService(
      mockUserRepository,
      mockRedisClient,
      mockWhatsAppService,
      mockLogger,
      'test_secret',
      'test_master_key'
    );
  });

  describe('validateSession', () => {
    it('should validate a valid session', async () => {
      const session = {
        userId: testUser.id,
        deviceId: 'test_device',
        ip: '127.0.0.1',
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(session));

      const result = await authService.validateSession(
        'test_token',
        'test_device',
        '127.0.0.1'
      );

      expect(result).toBeDefined();
      expect(result?.userId).toBe(session.userId);
      expect(result?.deviceId).toBe(session.deviceId);
      expect(result?.ip).toBe(session.ip);
    });

    it('should return null for invalid session', async () => {
      mockRedisClient.get.mockResolvedValue(null);

      const result = await authService.validateSession(
        'invalid_token',
        'test_device',
        '127.0.0.1'
      );

      expect(result).toBeNull();
    });

    it('should return null for mismatched device or IP', async () => {
      const session = {
        userId: testUser.id,
        deviceId: 'other_device',
        ip: '192.168.1.1',
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(session));

      const result = await authService.validateSession(
        'test_token',
        'test_device',
        '127.0.0.1'
      );

      expect(result).toBeNull();
    });
  });

  describe('createSession', () => {
    it('should create a new session', async () => {
      const payload: TokenPayload = {
        userId: testUser.id,
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        sessionId: 'test_session',
      };

      mockRedisClient.set.mockResolvedValue('OK');
      jest.spyOn(authService as any, 'generateToken').mockReturnValue('test_token');

      const result = await authService.createSession(
        payload,
        'test_device',
        '127.0.0.1'
      );

      expect(result).toBeDefined();
      expect(result.token).toBe('test_token');
      expect(result.expiresIn).toBeDefined();
    });

    it('should fail if Redis fails', async () => {
      const payload: TokenPayload = {
        userId: testUser.id,
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        sessionId: 'test_session',
      };

      mockRedisClient.set.mockRejectedValue(new Error('Redis error'));

      await expect(
        authService.createSession(payload, 'test_device', '127.0.0.1')
      ).rejects.toThrow();
    });

    it('should fail if token generation fails', async () => {
      const payload: TokenPayload = {
        userId: testUser.id,
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        sessionId: 'test_session',
      };

      jest.spyOn(authService as any, 'generateToken').mockImplementation(() => {
        throw new Error('Token error');
      });

      await expect(
        authService.createSession(payload, 'test_device', '127.0.0.1')
      ).rejects.toThrow();
    });
  });

  describe('revokeSession', () => {
    it('should revoke an existing session', async () => {
      mockRedisClient.del.mockResolvedValue(1);

      const result = await authService.revokeSession('test_token');

      expect(result).toBe(true);
      expect(mockRedisClient.del).toHaveBeenCalledWith('session:test_token');
    });
  });

  describe('refreshSession', () => {
    it('should refresh a valid session', async () => {
      const session = {
        userId: testUser.id,
        deviceId: 'test_device',
        ip: '127.0.0.1',
        kycLevel: KYCLevel.LEVEL_2,
        phone: testUser.phone,
        createdAt: new Date(),
        lastActivity: new Date(),
      };

      mockRedisClient.get.mockResolvedValue(JSON.stringify(session));
      mockRedisClient.set.mockResolvedValue('OK');
      jest.spyOn(authService as any, 'generateToken').mockReturnValue('new_token');

      const result = await authService.refreshSession(
        'test_token',
        'test_device',
        '127.0.0.1'
      );

      expect(result).toBeDefined();
      expect(result.token).toBe('new_token');
      expect(result.expiresIn).toBeDefined();
    });
  });

  describe('generateNonce', () => {
    it('should generate a valid nonce', async () => {
      const nonce = await authService.generateNonce();

      expect(nonce).toBeDefined();
      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });
  });
});