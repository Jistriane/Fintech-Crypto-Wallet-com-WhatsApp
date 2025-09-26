import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Register a test user
    const registerResponse = await request.post('/api/auth/register', {
      data: {
        email: faker.internet.email(),
        password: faker.internet.password(),
        name: faker.person.fullName(),
      },
    });
    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    userId = registerData.user.id;

    // Login to get auth token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: registerData.user.email,
        password: registerData.user.password,
      },
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    authToken = loginData.token;
  });

  test('should create and manage wallet', async ({ request }) => {
    // Create wallet
    const createWalletResponse = await request.post('/api/wallet/create', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(createWalletResponse.ok()).toBeTruthy();
    const walletData = await createWalletResponse.json();
    expect(walletData.address).toBeTruthy();

    // Get wallet balance
    const balanceResponse = await request.get('/api/wallet/balance', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(balanceResponse.ok()).toBeTruthy();
    const balanceData = await balanceResponse.json();
    expect(balanceData).toHaveProperty('MATIC');
    expect(balanceData).toHaveProperty('USDC');

    // Get transaction history
    const historyResponse = await request.get('/api/wallet/transactions', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(historyResponse.ok()).toBeTruthy();
    const historyData = await historyResponse.json();
    expect(Array.isArray(historyData)).toBeTruthy();
  });

  test('should handle KYC flow', async ({ request }) => {
    // Get KYC status
    const statusResponse = await request.get('/api/kyc/status', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(statusResponse.ok()).toBeTruthy();
    const statusData = await statusResponse.json();
    expect(statusData.level).toBe(0);

    // Submit level 1 KYC
    const formData = new FormData();
    formData.append('idFront', new Blob(['mock-id-front'], { type: 'image/jpeg' }));
    formData.append('idBack', new Blob(['mock-id-back'], { type: 'image/jpeg' }));
    formData.append('selfie', new Blob(['mock-selfie'], { type: 'image/jpeg' }));

    const submitResponse = await request.post('/api/kyc/submit/1', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: formData,
    });
    expect(submitResponse.ok()).toBeTruthy();
    const submitData = await submitResponse.json();
    expect(submitData.status).toBe('IN_PROGRESS');

    // Get updated KYC status
    const updatedStatusResponse = await request.get('/api/kyc/status', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(updatedStatusResponse.ok()).toBeTruthy();
    const updatedStatusData = await updatedStatusResponse.json();
    expect(updatedStatusData.status).toBe('IN_PROGRESS');
  });

  test('should handle WhatsApp integration', async ({ request }) => {
    // Link WhatsApp
    const linkResponse = await request.post('/api/whatsapp/link', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        phoneNumber: '+5511999999999',
      },
    });
    expect(linkResponse.ok()).toBeTruthy();
    const linkData = await linkResponse.json();
    expect(linkData.verificationCode).toBeTruthy();

    // Verify WhatsApp
    const verifyResponse = await request.post('/api/whatsapp/verify', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        code: linkData.verificationCode,
      },
    });
    expect(verifyResponse.ok()).toBeTruthy();
    const verifyData = await verifyResponse.json();
    expect(verifyData.linked).toBeTruthy();

    // Update notification preferences
    const preferencesResponse = await request.put('/api/notifications/preferences', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        transactionsSent: true,
        transactionsReceived: true,
        swaps: true,
        liquidity: true,
        kyc: true,
        security: true,
      },
    });
    expect(preferencesResponse.ok()).toBeTruthy();
  });

  test('should handle DeFi operations', async ({ request }) => {
    // Get swap quote
    const quoteResponse = await request.get('/api/defi/swap/quote', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      params: {
        fromToken: 'MATIC',
        toToken: 'USDC',
        amount: '1000000000000000000', // 1 MATIC
      },
    });
    expect(quoteResponse.ok()).toBeTruthy();
    const quoteData = await quoteResponse.json();
    expect(quoteData.toAmount).toBeTruthy();
    expect(quoteData.price).toBeTruthy();
    expect(quoteData.priceImpact).toBeTruthy();

    // Execute swap
    const swapResponse = await request.post('/api/defi/swap', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        fromToken: 'MATIC',
        toToken: 'USDC',
        amount: '1000000000000000000', // 1 MATIC
        slippage: 0.5,
      },
    });
    expect(swapResponse.ok()).toBeTruthy();
    const swapData = await swapResponse.json();
    expect(swapData.transactionHash).toBeTruthy();

    // Get liquidity pools
    const poolsResponse = await request.get('/api/defi/pools', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(poolsResponse.ok()).toBeTruthy();
    const poolsData = await poolsResponse.json();
    expect(Array.isArray(poolsData)).toBeTruthy();
    expect(poolsData[0]).toHaveProperty('tokenA');
    expect(poolsData[0]).toHaveProperty('tokenB');
    expect(poolsData[0]).toHaveProperty('tvl');
    expect(poolsData[0]).toHaveProperty('apy');

    // Add liquidity
    const addLiquidityResponse = await request.post('/api/defi/liquidity/add', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        tokenA: 'MATIC',
        tokenB: 'USDC',
        amountA: '1000000000000000000', // 1 MATIC
        amountB: '1000000', // 1 USDC
        slippage: 0.5,
      },
    });
    expect(addLiquidityResponse.ok()).toBeTruthy();
    const addLiquidityData = await addLiquidityResponse.json();
    expect(addLiquidityData.transactionHash).toBeTruthy();
    expect(addLiquidityData.lpTokens).toBeTruthy();

    // Get liquidity positions
    const positionsResponse = await request.get('/api/defi/positions', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    expect(positionsResponse.ok()).toBeTruthy();
    const positionsData = await positionsResponse.json();
    expect(Array.isArray(positionsData)).toBeTruthy();
    expect(positionsData[0]).toHaveProperty('poolId');
    expect(positionsData[0]).toHaveProperty('lpTokens');
    expect(positionsData[0]).toHaveProperty('value');

    // Remove liquidity
    const removeLiquidityResponse = await request.post('/api/defi/liquidity/remove', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        poolId: positionsData[0].poolId,
        lpTokens: positionsData[0].lpTokens,
        slippage: 0.5,
      },
    });
    expect(removeLiquidityResponse.ok()).toBeTruthy();
    const removeLiquidityData = await removeLiquidityResponse.json();
    expect(removeLiquidityData.transactionHash).toBeTruthy();
  });

  test('should handle admin operations', async ({ request }) => {
    // Mock admin token
    const adminLoginResponse = await request.post('/api/auth/login', {
      data: {
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      },
    });
    expect(adminLoginResponse.ok()).toBeTruthy();
    const adminLoginData = await adminLoginResponse.json();
    const adminToken = adminLoginData.token;

    // Get users list
    const usersResponse = await request.get('/api/admin/users', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(usersResponse.ok()).toBeTruthy();
    const usersData = await usersResponse.json();
    expect(Array.isArray(usersData)).toBeTruthy();

    // Get KYC requests
    const kycResponse = await request.get('/api/admin/kyc/requests', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    expect(kycResponse.ok()).toBeTruthy();
    const kycData = await kycResponse.json();
    expect(Array.isArray(kycData)).toBeTruthy();

    // Get analytics
    const analyticsResponse = await request.get('/api/admin/analytics', {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
      params: {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      },
    });
    expect(analyticsResponse.ok()).toBeTruthy();
    const analyticsData = await analyticsResponse.json();
    expect(analyticsData).toHaveProperty('userGrowth');
    expect(analyticsData).toHaveProperty('transactionVolume');
    expect(analyticsData).toHaveProperty('walletDistribution');
  });

  test('should handle error cases', async ({ request }) => {
    // Invalid token
    const invalidTokenResponse = await request.get('/api/wallet/balance', {
      headers: {
        Authorization: 'Bearer invalid-token',
      },
    });
    expect(invalidTokenResponse.status()).toBe(401);

    // Invalid KYC level
    const invalidKycResponse = await request.post('/api/kyc/submit/4', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {},
    });
    expect(invalidKycResponse.status()).toBe(400);

    // Invalid swap parameters
    const invalidSwapResponse = await request.post('/api/defi/swap', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        fromToken: 'INVALID',
        toToken: 'USDC',
        amount: '1',
      },
    });
    expect(invalidSwapResponse.status()).toBe(400);

    // Insufficient balance
    const insufficientBalanceResponse = await request.post('/api/defi/swap', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        fromToken: 'MATIC',
        toToken: 'USDC',
        amount: '1000000000000000000000000', // 1M MATIC
      },
    });
    expect(insufficientBalanceResponse.status()).toBe(400);
  });
});
