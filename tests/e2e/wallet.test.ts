import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { ethers } from 'ethers';

test.describe('Wallet Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to wallet page
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel('Senha').fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: 'Carteira' }).click();
  });

  test('should display wallet overview', async ({ page }) => {
    // Check wallet balance and tokens
    await expect(page.getByTestId('total-balance')).toBeVisible();
    await expect(page.getByTestId('token-list')).toBeVisible();

    // Check network selector
    await expect(page.getByRole('button', { name: 'Polygon' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'BSC' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Arbitrum' })).toBeVisible();

    // Check transaction history
    await expect(page.getByRole('heading', { name: 'Histórico' })).toBeVisible();
    await expect(page.getByTestId('transaction-list')).toBeVisible();
  });

  test('should send tokens', async ({ page }) => {
    // Mock wallet balance
    await page.evaluate(() => {
      window.localStorage.setItem('mockBalance', JSON.stringify({
        MATIC: '1000000000000000000', // 1 MATIC
        USDC: '1000000', // 1 USDC
      }));
    });
    await page.reload();

    // Click send button
    await page.getByRole('button', { name: 'Enviar' }).click();

    // Fill send form
    await page.getByLabel('Token').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await page.getByLabel('Endereço').fill('0x1234567890123456789012345678901234567890');
    await page.getByLabel('Valor').fill('0.1');

    // Submit transaction
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check confirmation dialog
    await expect(page.getByText('Confirmar transação')).toBeVisible();
    await expect(page.getByText('0.1 MATIC')).toBeVisible();
    await expect(page.getByText('Taxa de rede:')).toBeVisible();

    // Confirm transaction
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check success message
    await expect(page.getByText('Transação enviada')).toBeVisible();
    await expect(page.getByText('ID da transação:')).toBeVisible();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'TRANSACTION_SENT',
        token: 'MATIC',
        amount: '0.1',
      })
    );
  });

  test('should receive tokens', async ({ page }) => {
    // Click receive button
    await page.getByRole('button', { name: 'Receber' }).click();

    // Check wallet address
    await expect(page.getByTestId('wallet-address')).toBeVisible();
    await expect(page.getByTestId('qr-code')).toBeVisible();

    // Copy address
    await page.getByRole('button', { name: 'Copiar' }).click();
    await expect(page.getByText('Endereço copiado')).toBeVisible();

    // Share address
    await page.getByRole('button', { name: 'Compartilhar' }).click();
    await expect(page.getByText('Compartilhar via')).toBeVisible();
  });

  test('should swap tokens', async ({ page }) => {
    // Mock wallet balance
    await page.evaluate(() => {
      window.localStorage.setItem('mockBalance', JSON.stringify({
        MATIC: '1000000000000000000', // 1 MATIC
        USDC: '1000000', // 1 USDC
      }));
    });
    await page.reload();

    // Navigate to swap
    await page.getByRole('link', { name: 'Swap' }).click();

    // Select tokens
    await page.getByTestId('from-token').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await page.getByTestId('to-token').click();
    await page.getByRole('option', { name: 'USDC' }).click();

    // Enter amount
    await page.getByLabel('Valor').fill('0.1');

    // Check swap details
    await expect(page.getByText('Taxa de rede:')).toBeVisible();
    await expect(page.getByText('Preço:')).toBeVisible();
    await expect(page.getByText('Impacto no preço:')).toBeVisible();

    // Submit swap
    await page.getByRole('button', { name: 'Revisar Swap' }).click();

    // Check confirmation dialog
    await expect(page.getByText('Confirmar Swap')).toBeVisible();
    await expect(page.getByText('0.1 MATIC')).toBeVisible();
    await expect(page.getByText('≈')).toBeVisible();
    await expect(page.getByText('USDC')).toBeVisible();

    // Confirm swap
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check success message
    await expect(page.getByText('Swap realizado')).toBeVisible();
    await expect(page.getByText('ID da transação:')).toBeVisible();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'SWAP_COMPLETED',
        fromToken: 'MATIC',
        toToken: 'USDC',
      })
    );
  });

  test('should add liquidity', async ({ page }) => {
    // Mock wallet balance
    await page.evaluate(() => {
      window.localStorage.setItem('mockBalance', JSON.stringify({
        MATIC: '1000000000000000000', // 1 MATIC
        USDC: '1000000', // 1 USDC
      }));
    });
    await page.reload();

    // Navigate to liquidity
    await page.getByRole('link', { name: 'Liquidez' }).click();

    // Click add liquidity
    await page.getByRole('button', { name: 'Adicionar Liquidez' }).click();

    // Select tokens
    await page.getByTestId('token-a').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await page.getByTestId('token-b').click();
    await page.getByRole('option', { name: 'USDC' }).click();

    // Enter amounts
    await page.getByLabel('Valor Token A').fill('0.1');
    await expect(page.getByLabel('Valor Token B')).toHaveValue('0.08'); // Auto-filled based on price

    // Check pool details
    await expect(page.getByText('Taxa da pool:')).toBeVisible();
    await expect(page.getByText('Sua participação:')).toBeVisible();

    // Submit liquidity
    await page.getByRole('button', { name: 'Revisar' }).click();

    // Check confirmation dialog
    await expect(page.getByText('Confirmar Adição de Liquidez')).toBeVisible();
    await expect(page.getByText('0.1 MATIC + 0.08 USDC')).toBeVisible();
    await expect(page.getByText('LP Tokens:')).toBeVisible();

    // Confirm liquidity
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check success message
    await expect(page.getByText('Liquidez adicionada')).toBeVisible();
    await expect(page.getByText('ID da transação:')).toBeVisible();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'LIQUIDITY_ADDED',
        tokenA: 'MATIC',
        tokenB: 'USDC',
      })
    );
  });

  test('should remove liquidity', async ({ page }) => {
    // Mock liquidity position
    await page.evaluate(() => {
      window.localStorage.setItem('mockLiquidityPosition', JSON.stringify({
        tokenA: 'MATIC',
        tokenB: 'USDC',
        tokenAAmount: '0.1',
        tokenBAmount: '0.08',
        lpTokens: '0.09',
      }));
    });
    await page.reload();

    // Navigate to liquidity
    await page.getByRole('link', { name: 'Liquidez' }).click();

    // Click remove liquidity
    await page.getByRole('button', { name: 'Remover Liquidez' }).click();

    // Select position
    await page.getByText('MATIC/USDC').click();

    // Enter percentage
    await page.getByLabel('Porcentagem').fill('50');

    // Check removal details
    await expect(page.getByText('Você receberá:')).toBeVisible();
    await expect(page.getByText('0.05 MATIC')).toBeVisible();
    await expect(page.getByText('0.04 USDC')).toBeVisible();

    // Submit removal
    await page.getByRole('button', { name: 'Revisar' }).click();

    // Check confirmation dialog
    await expect(page.getByText('Confirmar Remoção de Liquidez')).toBeVisible();
    await expect(page.getByText('50% da posição')).toBeVisible();

    // Confirm removal
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check success message
    await expect(page.getByText('Liquidez removida')).toBeVisible();
    await expect(page.getByText('ID da transação:')).toBeVisible();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'LIQUIDITY_REMOVED',
        tokenA: 'MATIC',
        tokenB: 'USDC',
      })
    );
  });

  test('should display transaction history with filters', async ({ page }) => {
    // Mock transaction history
    await page.evaluate(() => {
      window.localStorage.setItem('mockTransactions', JSON.stringify([
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
        {
          id: '0x789',
          type: 'LIQUIDITY_ADD',
          tokenA: 'MATIC',
          tokenB: 'USDC',
          status: 'COMPLETED',
          timestamp: Date.now() - 10800000,
        },
      ]));
    });
    await page.reload();

    // Check transaction list
    await expect(page.getByTestId('transaction-list')).toBeVisible();
    await expect(page.getByText('Envio')).toBeVisible();
    await expect(page.getByText('Swap')).toBeVisible();
    await expect(page.getByText('Adição de Liquidez')).toBeVisible();

    // Apply type filter
    await page.getByLabel('Tipo').click();
    await page.getByRole('option', { name: 'Envio' }).click();
    await expect(page.getByText('Swap')).not.toBeVisible();
    await expect(page.getByText('Adição de Liquidez')).not.toBeVisible();

    // Apply token filter
    await page.getByLabel('Token').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await expect(page.getByText('0.1 MATIC')).toBeVisible();

    // Check transaction details
    await page.getByText('0.1 MATIC').click();
    await expect(page.getByText('Detalhes da Transação')).toBeVisible();
    await expect(page.getByText('ID: 0x123')).toBeVisible();
    await expect(page.getByText('Status: Concluída')).toBeVisible();
  });
});
