import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('WhatsApp Integration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to settings
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel('Senha').fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: 'Configurações' }).click();
  });

  test('should link WhatsApp number', async ({ page }) => {
    // Click link WhatsApp button
    await page.getByRole('button', { name: 'Vincular WhatsApp' }).click();

    // Enter phone number
    await page.getByLabel('Número do WhatsApp').fill('+5511999999999');
    await page.getByRole('button', { name: 'Enviar código' }).click();

    // Check verification message
    await expect(page.getByText('Código enviado para')).toBeVisible();
    await expect(page.getByText('+5511999999999')).toBeVisible();

    // Enter verification code
    await page.getByLabel('Código de verificação').fill('123456');
    await page.getByRole('button', { name: 'Verificar' }).click();

    // Check success message
    await expect(page.getByText('WhatsApp vinculado com sucesso')).toBeVisible();

    // Check WhatsApp status
    await expect(page.getByText('WhatsApp vinculado:')).toBeVisible();
    await expect(page.getByText('+5511999999999')).toBeVisible();
  });

  test('should configure notification preferences', async ({ page }) => {
    // Mock linked WhatsApp
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
    });
    await page.reload();

    // Navigate to notification settings
    await page.getByRole('link', { name: 'Notificações' }).click();

    // Toggle notifications
    await page.getByLabel('Transações enviadas').click();
    await page.getByLabel('Transações recebidas').click();
    await page.getByLabel('Swaps').click();
    await page.getByLabel('Liquidez').click();
    await page.getByLabel('KYC').click();
    await page.getByLabel('Segurança').click();

    // Save preferences
    await page.getByRole('button', { name: 'Salvar preferências' }).click();

    // Check success message
    await expect(page.getByText('Preferências salvas')).toBeVisible();

    // Check saved preferences
    const preferences = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockNotificationPreferences') || '{}'
      );
    });

    expect(preferences).toEqual({
      transactionsSent: true,
      transactionsReceived: true,
      swaps: true,
      liquidity: true,
      kyc: true,
      security: true,
    });
  });

  test('should receive transaction notifications', async ({ page }) => {
    // Mock linked WhatsApp and preferences
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
      window.localStorage.setItem('mockNotificationPreferences', JSON.stringify({
        transactionsSent: true,
        transactionsReceived: true,
      }));
    });
    await page.reload();

    // Navigate to wallet
    await page.getByRole('link', { name: 'Carteira' }).click();

    // Send transaction
    await page.getByRole('button', { name: 'Enviar' }).click();
    await page.getByLabel('Token').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await page.getByLabel('Endereço').fill('0x1234567890123456789012345678901234567890');
    await page.getByLabel('Valor').fill('0.1');
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

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
        status: 'PENDING',
      })
    );

    // Mock transaction confirmation
    await page.evaluate(() => {
      const notifications = JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
      notifications.push({
        type: 'TRANSACTION_SENT',
        token: 'MATIC',
        amount: '0.1',
        status: 'CONFIRMED',
      });
      window.localStorage.setItem(
        'mockWhatsAppNotifications',
        JSON.stringify(notifications)
      );
    });

    // Check confirmation notification
    const updatedNotifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(updatedNotifications).toContainEqual(
      expect.objectContaining({
        type: 'TRANSACTION_SENT',
        token: 'MATIC',
        amount: '0.1',
        status: 'CONFIRMED',
      })
    );
  });

  test('should receive security notifications', async ({ page }) => {
    // Mock linked WhatsApp and preferences
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
      window.localStorage.setItem('mockNotificationPreferences', JSON.stringify({
        security: true,
      }));
    });
    await page.reload();

    // Navigate to security settings
    await page.getByRole('link', { name: 'Segurança' }).click();

    // Enable 2FA
    await page.getByRole('button', { name: 'Ativar 2FA' }).click();
    await page.getByLabel('Código de verificação').fill('123456');
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'SECURITY_2FA_ENABLED',
      })
    );

    // Mock suspicious login attempt
    await page.evaluate(() => {
      const notifications = JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
      notifications.push({
        type: 'SECURITY_ALERT',
        event: 'SUSPICIOUS_LOGIN',
        location: 'Unknown Location',
      });
      window.localStorage.setItem(
        'mockWhatsAppNotifications',
        JSON.stringify(notifications)
      );
    });

    // Check security alert notification
    const updatedNotifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(updatedNotifications).toContainEqual(
      expect.objectContaining({
        type: 'SECURITY_ALERT',
        event: 'SUSPICIOUS_LOGIN',
      })
    );
  });

  test('should handle notification SLA', async ({ page }) => {
    // Mock linked WhatsApp
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
      window.localStorage.setItem('mockNotificationPreferences', JSON.stringify({
        transactionsSent: true,
      }));
    });
    await page.reload();

    // Send multiple transactions
    for (let i = 0; i < 5; i++) {
      await page.getByRole('link', { name: 'Carteira' }).click();
      await page.getByRole('button', { name: 'Enviar' }).click();
      await page.getByLabel('Token').click();
      await page.getByRole('option', { name: 'MATIC' }).click();
      await page.getByLabel('Endereço').fill('0x1234567890123456789012345678901234567890');
      await page.getByLabel('Valor').fill('0.1');
      await page.getByRole('button', { name: 'Confirmar' }).click();
      await page.getByRole('button', { name: 'Confirmar' }).click();
    }

    // Check notification delivery times
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    // Check that all notifications were sent within SLA
    const deliveryTimes = notifications
      .filter(n => n.type === 'TRANSACTION_SENT')
      .map(n => n.deliveryTime - n.createdAt);

    expect(Math.max(...deliveryTimes)).toBeLessThanOrEqual(3000); // 3 seconds SLA
  });

  test('should handle notification failures', async ({ page }) => {
    // Mock linked WhatsApp and failed notification
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
      window.localStorage.setItem('mockNotificationPreferences', JSON.stringify({
        transactionsSent: true,
      }));
      window.localStorage.setItem('mockNotificationFailure', 'true');
    });
    await page.reload();

    // Send transaction
    await page.getByRole('link', { name: 'Carteira' }).click();
    await page.getByRole('button', { name: 'Enviar' }).click();
    await page.getByLabel('Token').click();
    await page.getByRole('option', { name: 'MATIC' }).click();
    await page.getByLabel('Endereço').fill('0x1234567890123456789012345678901234567890');
    await page.getByLabel('Valor').fill('0.1');
    await page.getByRole('button', { name: 'Confirmar' }).click();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check notification retry
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    const retries = notifications
      .filter(n => n.type === 'TRANSACTION_SENT')
      .map(n => n.retryCount);

    expect(Math.max(...retries)).toBeGreaterThan(0);
    expect(Math.max(...retries)).toBeLessThanOrEqual(3); // Max 3 retries
  });

  test('should unlink WhatsApp number', async ({ page }) => {
    // Mock linked WhatsApp
    await page.evaluate(() => {
      window.localStorage.setItem('mockWhatsAppLinked', '+5511999999999');
    });
    await page.reload();

    // Click unlink button
    await page.getByRole('button', { name: 'Desvincular WhatsApp' }).click();

    // Confirm action
    await expect(page.getByText('Tem certeza?')).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar' }).click();

    // Check success message
    await expect(page.getByText('WhatsApp desvinculado')).toBeVisible();

    // Check WhatsApp status
    await expect(page.getByRole('button', { name: 'Vincular WhatsApp' })).toBeVisible();
  });
});
