import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Authentication Flow', () => {
  const email = faker.internet.email();
  const password = faker.internet.password();
  const name = faker.person.fullName();
  const phone = faker.phone.number('+55119########');

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user', async ({ page }) => {
    // Go to register page
    await page.getByRole('link', { name: 'Criar conta' }).click();

    // Fill registration form
    await page.getByLabel('Nome completo').fill(name);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Telefone').fill(phone);
    await page.getByLabel('Senha').fill(password);

    // Submit form
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Wait for verification code page
    await expect(page).toHaveURL(/.*\/verify-code/);
    await expect(page.getByText('Digite o código enviado')).toBeVisible();

    // Get verification code from WhatsApp API mock
    const code = await page.evaluate(() => {
      return window.localStorage.getItem('mockVerificationCode');
    });

    // Fill verification code
    await page.getByTestId('code-input').fill(code);

    // Wait for redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Bem-vindo')).toBeVisible();
  });

  test('should login with registered user', async ({ page }) => {
    // Go to login page
    await page.getByRole('link', { name: 'Entrar' }).click();

    // Fill login form
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill(password);

    // Submit form
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Wait for redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Bem-vindo')).toBeVisible();
  });

  test('should reset password', async ({ page }) => {
    // Go to login page
    await page.getByRole('link', { name: 'Entrar' }).click();

    // Click forgot password link
    await page.getByRole('link', { name: 'Esqueci minha senha' }).click();

    // Fill email
    await page.getByLabel('Email').fill(email);

    // Submit form
    await page.getByRole('button', { name: 'Enviar código' }).click();

    // Wait for verification code page
    await expect(page).toHaveURL(/.*\/verify-code/);
    await expect(page.getByText('Digite o código enviado')).toBeVisible();

    // Get verification code from WhatsApp API mock
    const code = await page.evaluate(() => {
      return window.localStorage.getItem('mockVerificationCode');
    });

    // Fill verification code
    await page.getByTestId('code-input').fill(code);

    // Wait for new password page
    await expect(page).toHaveURL(/.*\/update-password/);

    // Fill new password
    const newPassword = faker.internet.password();
    await page.getByLabel('Nova senha').fill(newPassword);
    await page.getByLabel('Confirmar senha').fill(newPassword);

    // Submit form
    await page.getByRole('button', { name: 'Atualizar senha' }).click();

    // Wait for redirect to login page
    await expect(page).toHaveURL('/login');

    // Login with new password
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill(newPassword);
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Wait for redirect to home page
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Bem-vindo')).toBeVisible();
  });

  test('should logout', async ({ page }) => {
    // Login first
    await page.getByRole('link', { name: 'Entrar' }).click();
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill(password);
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');

    // Click profile menu
    await page.getByTestId('profile-menu').click();

    // Click logout button
    await page.getByRole('button', { name: 'Sair' }).click();

    // Wait for redirect to login page
    await expect(page).toHaveURL('/login');
  });

  test('should handle invalid login', async ({ page }) => {
    // Go to login page
    await page.getByRole('link', { name: 'Entrar' }).click();

    // Fill login form with invalid credentials
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Senha').fill('wrong-password');

    // Submit form
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Check error message
    await expect(page.getByText('Email ou senha inválidos')).toBeVisible();
  });

  test('should handle invalid verification code', async ({ page }) => {
    // Go to register page
    await page.getByRole('link', { name: 'Criar conta' }).click();

    // Fill registration form
    await page.getByLabel('Nome completo').fill(faker.person.fullName());
    await page.getByLabel('Email').fill(faker.internet.email());
    await page.getByLabel('Telefone').fill(faker.phone.number('+55119########'));
    await page.getByLabel('Senha').fill(faker.internet.password());

    // Submit form
    await page.getByRole('button', { name: 'Criar conta' }).click();

    // Wait for verification code page
    await expect(page).toHaveURL(/.*\/verify-code/);

    // Fill invalid verification code
    await page.getByTestId('code-input').fill('123456');

    // Check error message
    await expect(page.getByText('Código inválido')).toBeVisible();
  });

  test('should handle rate limiting', async ({ page }) => {
    // Try to login multiple times with wrong password
    await page.getByRole('link', { name: 'Entrar' }).click();

    for (let i = 0; i < 5; i++) {
      await page.getByLabel('Email').fill(email);
      await page.getByLabel('Senha').fill('wrong-password');
      await page.getByRole('button', { name: 'Entrar' }).click();
    }

    // Check rate limit error message
    await expect(
      page.getByText('Muitas tentativas. Tente novamente mais tarde.')
    ).toBeVisible();
  });
});
