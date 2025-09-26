import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import path from 'path';

test.describe('KYC Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to KYC page
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL);
    await page.getByLabel('Senha').fill(process.env.TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');
    await page.getByRole('link', { name: 'KYC' }).click();
  });

  test('should display KYC levels', async ({ page }) => {
    // Check if all KYC levels are displayed
    await expect(page.getByText('Nível 0')).toBeVisible();
    await expect(page.getByText('Nível 1')).toBeVisible();
    await expect(page.getByText('Nível 2')).toBeVisible();
    await expect(page.getByText('Nível 3')).toBeVisible();

    // Check if level 0 is completed and level 1 is available
    await expect(
      page.getByRole('heading', { name: 'Nível 0' }).locator('..').getByText('COMPLETED')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nível 1' }).locator('..').getByText('AVAILABLE')
    ).toBeVisible();

    // Check if higher levels are locked
    await expect(
      page.getByRole('heading', { name: 'Nível 2' }).locator('..').getByText('LOCKED')
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nível 3' }).locator('..').getByText('LOCKED')
    ).toBeVisible();
  });

  test('should complete KYC level 1', async ({ page }) => {
    // Start level 1 verification
    await page.getByRole('heading', { name: 'Nível 1' }).click();

    // Upload front of ID
    const idFrontPath = path.join(__dirname, '../fixtures/id_front.jpg');
    await page.getByTestId('id-front-upload').setInputFiles(idFrontPath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Upload back of ID
    const idBackPath = path.join(__dirname, '../fixtures/id_back.jpg');
    await page.getByTestId('id-back-upload').setInputFiles(idBackPath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Take selfie
    await page.getByRole('button', { name: 'Tirar selfie' }).click();
    await page.getByTestId('camera-capture').click();
    await expect(page.getByText('Selfie capturada')).toBeVisible();

    // Submit verification
    await page.getByRole('button', { name: 'Enviar documentos' }).click();

    // Check if verification is pending
    await expect(page.getByText('Verificação em análise')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nível 1' }).locator('..').getByText('IN_PROGRESS')
    ).toBeVisible();
  });

  test('should complete KYC level 2', async ({ page }) => {
    // Mock level 1 approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '1');
    });
    await page.reload();

    // Start level 2 verification
    await page.getByRole('heading', { name: 'Nível 2' }).click();

    // Upload proof of address
    const addressProofPath = path.join(__dirname, '../fixtures/address_proof.pdf');
    await page.getByTestId('address-proof-upload').setInputFiles(addressProofPath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Submit verification
    await page.getByRole('button', { name: 'Enviar documentos' }).click();

    // Check if verification is pending
    await expect(page.getByText('Verificação em análise')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nível 2' }).locator('..').getByText('IN_PROGRESS')
    ).toBeVisible();
  });

  test('should complete KYC level 3', async ({ page }) => {
    // Mock level 2 approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '2');
    });
    await page.reload();

    // Start level 3 verification
    await page.getByRole('heading', { name: 'Nível 3' }).click();

    // Upload proof of income
    const incomePath = path.join(__dirname, '../fixtures/income_proof.pdf');
    await page.getByTestId('income-proof-upload').setInputFiles(incomePath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Submit verification
    await page.getByRole('button', { name: 'Enviar documentos' }).click();

    // Check if verification is pending
    await expect(page.getByText('Verificação em análise')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Nível 3' }).locator('..').getByText('IN_PROGRESS')
    ).toBeVisible();
  });

  test('should handle document rejection', async ({ page }) => {
    // Start level 1 verification
    await page.getByRole('heading', { name: 'Nível 1' }).click();

    // Upload invalid ID front
    const invalidIdPath = path.join(__dirname, '../fixtures/invalid_id.jpg');
    await page.getByTestId('id-front-upload').setInputFiles(invalidIdPath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Upload invalid ID back
    await page.getByTestId('id-back-upload').setInputFiles(invalidIdPath);
    await expect(page.getByText('Documento enviado')).toBeVisible();

    // Take selfie
    await page.getByRole('button', { name: 'Tirar selfie' }).click();
    await page.getByTestId('camera-capture').click();
    await expect(page.getByText('Selfie capturada')).toBeVisible();

    // Submit verification
    await page.getByRole('button', { name: 'Enviar documentos' }).click();

    // Mock document rejection
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycStatus', 'REJECTED');
      window.localStorage.setItem(
        'mockKycReason',
        'Documento ilegível. Por favor, envie uma foto mais clara.'
      );
    });
    await page.reload();

    // Check rejection message
    await expect(page.getByText('Verificação rejeitada')).toBeVisible();
    await expect(
      page.getByText('Documento ilegível. Por favor, envie uma foto mais clara.')
    ).toBeVisible();
  });

  test('should display transaction limits', async ({ page }) => {
    // Check level 0 limits
    await expect(page.getByText('Limite diário: $1,000')).toBeVisible();
    await expect(page.getByText('Limite mensal: $5,000')).toBeVisible();

    // Mock level 1 approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '1');
    });
    await page.reload();

    // Check level 1 limits
    await expect(page.getByText('Limite diário: $10,000')).toBeVisible();
    await expect(page.getByText('Limite mensal: $50,000')).toBeVisible();

    // Mock level 2 approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '2');
    });
    await page.reload();

    // Check level 2 limits
    await expect(page.getByText('Limite diário: $50,000')).toBeVisible();
    await expect(page.getByText('Limite mensal: $200,000')).toBeVisible();

    // Mock level 3 approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '3');
    });
    await page.reload();

    // Check level 3 limits
    await expect(page.getByText('Limite diário: $100,000')).toBeVisible();
    await expect(page.getByText('Limite mensal: $500,000')).toBeVisible();
  });

  test('should receive WhatsApp notifications', async ({ page }) => {
    // Start level 1 verification
    await page.getByRole('heading', { name: 'Nível 1' }).click();

    // Upload documents and submit
    const idFrontPath = path.join(__dirname, '../fixtures/id_front.jpg');
    const idBackPath = path.join(__dirname, '../fixtures/id_back.jpg');
    await page.getByTestId('id-front-upload').setInputFiles(idFrontPath);
    await page.getByTestId('id-back-upload').setInputFiles(idBackPath);
    await page.getByRole('button', { name: 'Tirar selfie' }).click();
    await page.getByTestId('camera-capture').click();
    await page.getByRole('button', { name: 'Enviar documentos' }).click();

    // Check WhatsApp notification
    const notifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'KYC_SUBMITTED',
        level: 1,
      })
    );

    // Mock approval
    await page.evaluate(() => {
      window.localStorage.setItem('mockKycLevel', '1');
      window.localStorage.setItem('mockKycStatus', 'APPROVED');
    });
    await page.reload();

    // Check approval notification
    const updatedNotifications = await page.evaluate(() => {
      return JSON.parse(
        window.localStorage.getItem('mockWhatsAppNotifications') || '[]'
      );
    });

    expect(updatedNotifications).toContainEqual(
      expect.objectContaining({
        type: 'KYC_APPROVED',
        level: 1,
      })
    );
  });
});
