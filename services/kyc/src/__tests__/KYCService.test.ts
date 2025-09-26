import { KYCService } from '../domain/KYCService';
import { NotusWhatsAppService } from '../infrastructure/whatsapp/NotusWhatsAppService';
import { UserRepository } from '@common/infrastructure/repositories/UserRepository';
import { User } from '@common/domain/entities/User';

describe('KYCService', () => {
  let kycService: KYCService;
  let userRepository: jest.Mocked<UserRepository>;
  let whatsappService: jest.Mocked<NotusWhatsAppService>;
  let mockOcrService: any;
  let mockFaceService: any;

  beforeEach(() => {
    // Mock dos serviços
    userRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByPhone: jest.fn(),
      update: jest.fn(),
      updateKYCStatus: jest.fn(),
      updateKYCLevel: jest.fn(),
      delete: jest.fn(),
      findByKYCStatus: jest.fn(),
      findByKYCLevel: jest.fn()
    } as any;

    whatsappService = {
      sendMessage: jest.fn(),
      notifyDocumentApproved: jest.fn(),
      notifyDocumentRejected: jest.fn(),
      notifyKYCApproved: jest.fn(),
      notifyKYCRejected: jest.fn()
    } as any;

    mockOcrService = {
      extractData: jest.fn()
    };

    mockFaceService = {
      verifyIdentity: jest.fn()
    };

    kycService = new KYCService(
      userRepository,
      mockOcrService,
      mockFaceService
    );
  });

  describe('startKYCProcess', () => {
    it('should start KYC process for valid user', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'PENDING',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.updateKYCStatus.mockResolvedValue(mockUser);

      // Act
      await kycService.startKYCProcess(userId);

      // Assert
      expect(userRepository.findById).toHaveBeenCalledWith(userId);
      expect(userRepository.updateKYCStatus).toHaveBeenCalledWith(userId, 'IN_PROGRESS');
    });

    it('should throw error for invalid user', async () => {
      // Arrange
      const userId = '123';
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(kycService.startKYCProcess(userId))
        .rejects
        .toThrow('User not found');
    });
  });

  describe('processDocument', () => {
    it('should approve valid document', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'IN_PROGRESS',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      const mockDocument = {
        type: 'ID_FRONT',
        image: Buffer.from('test'),
        metadata: {}
      };

      userRepository.findById.mockResolvedValue(mockUser);
      mockOcrService.extractData.mockResolvedValue({
        isValid: true,
        confidence: 0.98,
        extractedData: {
          name: 'John Doe',
          documentNumber: '123456789'
        }
      });

      // Act
      const result = await kycService.processDocument(userId, mockDocument);

      // Assert
      expect(result).toBe(true);
      expect(mockOcrService.extractData).toHaveBeenCalledWith(mockDocument.image);
      expect(whatsappService.notifyDocumentApproved).toHaveBeenCalledWith(
        mockUser.phone,
        userId,
        mockDocument.type
      );
    });

    it('should reject invalid document', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'IN_PROGRESS',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      const mockDocument = {
        type: 'ID_FRONT',
        image: Buffer.from('test'),
        metadata: {}
      };

      userRepository.findById.mockResolvedValue(mockUser);
      mockOcrService.extractData.mockResolvedValue({
        isValid: false,
        confidence: 0.5,
        extractedData: null
      });

      // Act
      const result = await kycService.processDocument(userId, mockDocument);

      // Assert
      expect(result).toBe(false);
      expect(whatsappService.notifyDocumentRejected).toHaveBeenCalledWith(
        mockUser.phone,
        userId,
        mockDocument.type,
        'OCR validation failed'
      );
    });

    it('should verify face match for selfie', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'IN_PROGRESS',
        'LEVEL_0',
        true,
        new Date(),
        new Date()
      );

      const mockDocument = {
        type: 'SELFIE',
        image: Buffer.from('test'),
        metadata: {}
      };

      userRepository.findById.mockResolvedValue(mockUser);
      mockOcrService.extractData.mockResolvedValue({
        isValid: true,
        confidence: 0.98,
        extractedData: {
          face: Buffer.from('face')
        }
      });

      mockFaceService.verifyIdentity.mockResolvedValue({
        isMatch: true,
        confidence: 0.96
      });

      // Act
      const result = await kycService.processDocument(userId, mockDocument);

      // Assert
      expect(result).toBe(true);
      expect(mockFaceService.verifyIdentity).toHaveBeenCalledWith(
        mockDocument.image,
        Buffer.from('face')
      );
    });
  });

  describe('getKYCStatus', () => {
    it('should return current KYC status and limits', async () => {
      // Arrange
      const userId = '123';
      const mockUser = new User(
        userId,
        '+5511999999999',
        'test@example.com',
        'APPROVED',
        'LEVEL_2',
        true,
        new Date(),
        new Date()
      );

      userRepository.findById.mockResolvedValue(mockUser);

      // Act
      const status = await kycService.getKYCStatus(userId);

      // Assert
      expect(status).toEqual({
        status: 'APPROVED',
        level: 'LEVEL_2',
        limits: {
          daily: '10000',
          monthly: '50000',
          singleTransaction: '5000'
        }
      });
    });

    it('should throw error for invalid user', async () => {
      // Arrange
      const userId = '123';
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(kycService.getKYCStatus(userId))
        .rejects
        .toThrow('User not found');
    });
  });
});
