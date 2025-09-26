import { test as setup, expect } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  // Try to authenticate
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL);
  await page.getByLabel('Senha').fill(process.env.TEST_USER_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();

  // Wait for successful login
  await expect(page).toHaveURL('/');

  // Save storage state
  await page.context().storageState({ path: 'tests/e2e/storage-state.json' });
});

setup('mock api responses', async ({ page }) => {
  // Mock API responses
  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Mock authentication
    if (url.includes('/api/auth/login') && method === 'POST') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          token: 'mock-token',
          user: {
            id: '123',
            email: process.env.TEST_USER_EMAIL,
            name: 'Test User',
            kycLevel: 0,
          },
        }),
      });
      return;
    }

    // Mock wallet balance
    if (url.includes('/api/wallet/balance') && method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          MATIC: '1000000000000000000', // 1 MATIC
          USDC: '1000000', // 1 USDC
        }),
      });
      return;
    }

    // Mock transaction history
    if (url.includes('/api/wallet/transactions') && method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: '0x123',
            type: 'SEND',
            token: 'MATIC',
            amount: '0.1',
            status: 'COMPLETED',
            timestamp: Date.now() - 3600000,
          },
          {
            id: '0x456',
            type: 'SWAP',
            fromToken: 'MATIC',
            toToken: 'USDC',
            status: 'COMPLETED',
            timestamp: Date.now() - 7200000,
          },
        ]),
      });
      return;
    }

    // Mock KYC status
    if (url.includes('/api/kyc/status') && method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          level: 0,
          status: 'COMPLETED',
          nextLevel: 1,
          nextLevelStatus: 'AVAILABLE',
        }),
      });
      return;
    }

    // Mock WhatsApp status
    if (url.includes('/api/whatsapp/status') && method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          linked: false,
          number: null,
        }),
      });
      return;
    }

    // Mock notification preferences
    if (url.includes('/api/notifications/preferences') && method === 'GET') {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          transactionsSent: true,
          transactionsReceived: true,
          swaps: true,
          liquidity: true,
          kyc: true,
          security: true,
        }),
      });
      return;
    }

    // Continue with actual request if no mock is defined
    await route.continue();
  });

  // Save storage state with mocked responses
  await page.context().storageState({ path: 'tests/e2e/storage-state-with-mocks.json' });
});
