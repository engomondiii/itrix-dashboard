import { test, expect } from '@playwright/test';

// These tests own the network stubs; the legacy demo service worker must not intercept them.
test.use({ serviceWorkers: 'block' });

const root = '/itx-console-7k2m';

test('OTP displays server attempts, transport errors do not spend an attempt, and lockout is visible', async ({ page }) => {
  let attempt = 0;
  await page.route(`**${root}/api/auth/request`, route => route.fulfill({ json: { sent: true, expires_in: 300 } }));
  await page.route(`**${root}/api/auth/verify`, route => {
    attempt += 1;
    if (attempt === 2) return route.fulfill({ status: 503, json: { detail: 'Service unavailable. Please retry.' } });
    return route.fulfill({ status: 403, json: { error: { detail: 'Validation failed.', fields: {
      detail: 'Invalid or expired code.', reason: attempt === 3 ? 'locked' : 'invalid_code', remaining_attempts: attempt === 3 ? '0' : '2',
    } } } });
  });
  await page.goto(`${root}/sign-in?lang=en`);
  await page.getByLabel('Admin email', { exact: true }).fill('admin@example.invalid');
  await page.getByRole('button', { name: 'Send code', exact: true }).click();
  await page.getByPlaceholder('······').fill('123456');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('2 tries left', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Service unavailable. Please retry.', { exact: true })).toBeVisible();
  await expect(page.getByText('2 tries left', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByText('Sign-in temporarily locked', { exact: true })).toBeVisible();
  await expect(page.getByPlaceholder('······')).toHaveCount(0);
});

test('expired website admin session returns to OTP sign-in', async ({ page }) => {
  await page.route(`**${root}/api/admin/session`, route => route.fulfill({ status: 403, json: { error: { detail: 'Session expired. Sign in again.' } } }));
  await page.goto(`${root}?lang=en`);
  await expect(page).toHaveURL(/sign-in\?expired=1/);
  await expect(page.locator('input[type="email"]')).toBeVisible();
});
