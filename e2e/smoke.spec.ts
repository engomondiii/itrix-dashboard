/**
 * The demo-mode smoke path: what a first-time visitor does in their first
 * minute. If any step here breaks, the template's front door is broken,
 * whatever the unit tests say.
 */

import { expect, test } from '@playwright/test';

test('login page renders past the auth bootstrap (no infinite spinner)', async ({ page }) => {
  await page.goto('/login');
  // The regression this guards: auth status stuck on 'loading' rendered the
  // guard's spinner forever and the form never appeared.
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});

test('wrong password shows a field-level error, not a dead end', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText(/incorrect password/i)).toBeVisible();
  // Still on the login page, form still usable.
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
});

test('demo sign-in reaches Today, products table loads, sign-out returns', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'One-click demo sign-in' }).click();

  // GuestRoute redirects into the app once authenticated.
  await page.waitForURL('**/today');
  await expect(page.getByRole('heading', { name: 'Today' })).toBeVisible();

  // Entity list renders real (mock-backend) data. Row text also exists in
  // the CSS-hidden mobile-card markup, so target table cells specifically.
  // 'Acoustic Desk Divider' is the newest seed row, so it is on page 1
  // regardless of page size; the status bar proves the full result count.
  await page.goto('/products');
  await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Acoustic Desk Divider' })).toBeVisible();
  await expect(page.getByText(/\d+ results/)).toBeVisible();

  // Search narrows the table via the URL-backed list state.
  await page.getByPlaceholder('Search by name or SKU…').fill('monitor');
  await expect(page.getByRole('cell', { name: 'Monitor Arm Single' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Acoustic Desk Divider' })).not.toBeVisible();

  // Sign out lands back on login; the session is actually gone.
  await page.getByRole('button', { name: 'Sign out' }).click();
  await page.waitForURL('**/login');
  await page.goto('/today');
  await page.waitForURL(/\/login/); // guard bounced us
});
