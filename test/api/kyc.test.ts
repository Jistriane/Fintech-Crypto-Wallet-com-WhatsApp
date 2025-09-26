import axios from 'axios';
import { KYCStatus, KYCLevel } from '@common/types';

const API_URL = process.env.KYC_SERVICE_URL;

describe('KYC API', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Criar usuário de teste
    const user = await global.createTestUser();
    userId = user.id;

    // Autenticar
    const auth = await global.authenticate(user.phone);
    authToken = auth.token;
  });

  describe('POST /api/v1/kyc/start', () => {
    it('should start KYC process', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/kyc/start`,
        { userId },
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('message', 'KYC process started successfully');

      // Verificar status do usuário
      const userResponse = await axios.get(
        `${API_URL}/api/v1/kyc/users/${userId}/status`,
        { headers }
      );
      expect(userResponse.data.status).toBe('IN_PROGRESS');
    });

    it('should reject unauthorized request', async () => {
      // Act & Assert
      await expect(axios.post(`${API_URL}/api/v1/kyc/start`, { userId }))
        .rejects
        .toThrow('Request failed with status code 401');
    });
  });

  describe('POST /api/v1/kyc/documents', () => {
    it('should process ID front document', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const document = {
        type: 'ID_FRONT',
        image: Buffer.from('test').toString('base64'),
        metadata: {
          documentNumber: '123456789'
        }
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/kyc/documents`,
        document,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isValid', true);
    });

    it('should process ID back document', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const document = {
        type: 'ID_BACK',
        image: Buffer.from('test').toString('base64'),
        metadata: {
          documentNumber: '123456789'
        }
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/kyc/documents`,
        document,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isValid', true);
    });

    it('should process selfie', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const document = {
        type: 'SELFIE',
        image: Buffer.from('test').toString('base64')
      };

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/kyc/documents`,
        document,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('isValid', true);
    });

    it('should reject invalid document type', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };
      const document = {
        type: 'INVALID',
        image: Buffer.from('test').toString('base64')
      };

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/kyc/documents`,
        document,
        { headers }
      )).rejects.toThrow('Request failed with status code 400');
    });
  });

  describe('GET /api/v1/kyc/status', () => {
    it('should return current KYC status and limits', async () => {
      // Arrange
      const headers = { Authorization: `Bearer ${authToken}` };

      // Completar processo de KYC
      await global.completeKYC(userId);

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/kyc/users/${userId}/status`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        status: 'APPROVED',
        level: 'LEVEL_2',
        limits: {
          daily: '10000',
          monthly: '50000',
          singleTransaction: '5000'
        }
      });
    });

    it('should return pending status for new user', async () => {
      // Arrange
      const newUser = await global.createTestUser();
      const auth = await global.authenticate(newUser.phone);
      const headers = { Authorization: `Bearer ${auth.token}` };

      // Act
      const response = await axios.get(
        `${API_URL}/api/v1/kyc/users/${newUser.id}/status`,
        { headers }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        status: 'PENDING',
        level: 'LEVEL_0',
        limits: {
          daily: '0',
          monthly: '0',
          singleTransaction: '0'
        }
      });
    });
  });

  describe('POST /api/v1/kyc/webhook/notus', () => {
    it('should process valid webhook', async () => {
      // Arrange
      const webhook = {
        type: 'document_upload',
        phone: '+5511999999999',
        userId,
        data: {
          documentType: 'ID_FRONT',
          image: Buffer.from('test').toString('base64')
        }
      };

      const signature = 'valid_signature'; // TODO: Implementar assinatura real

      // Act
      const response = await axios.post(
        `${API_URL}/api/v1/kyc/webhook/notus`,
        webhook,
        {
          headers: {
            'X-Notus-Signature': signature
          }
        }
      );

      // Assert
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
    });

    it('should reject invalid signature', async () => {
      // Arrange
      const webhook = {
        type: 'document_upload',
        phone: '+5511999999999',
        userId,
        data: {
          documentType: 'ID_FRONT',
          image: Buffer.from('test').toString('base64')
        }
      };

      // Act & Assert
      await expect(axios.post(
        `${API_URL}/api/v1/kyc/webhook/notus`,
        webhook,
        {
          headers: {
            'X-Notus-Signature': 'invalid_signature'
          }
        }
      )).rejects.toThrow('Request failed with status code 401');
    });
  });
});
