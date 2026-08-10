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

test('wrong password shows a clear error, not a dead end', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('Password').fill('not-the-password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // itriX contract: a non-field 401 (deliberately not attributed to a field).
  await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
  // Still on the login page, form still usable.
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeEnabled();
});

test('demo sign-in reaches Today, leads list works, sign-out returns', async ({
  page,
}) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'One-click demo sign-in' }).click();

  // GuestRoute redirects into the app once authenticated.
  await page.waitForURL('**/today');
  await expect(page.getByRole('heading', { level: 1, name: 'Today' })).toBeVisible();
  // The approvals band always renders — it is the queue's front door.
  await expect(page.getByRole('heading', { name: 'Waiting for your OK' })).toBeVisible();

  // Leads list renders real (mock-backend) seed data.
  await page.goto('/leads');
  await expect(page.getByRole('heading', { level: 1, name: 'Leads' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Hanul Engineering' })).toBeVisible();

  // Search narrows the list via the URL-backed state (the demo handler
  // honours ?search= like the real backend's LeadFilter).
  await page.getByPlaceholder('Search company, name, pain…').fill('Shinkai');
  await expect(page.getByRole('link', { name: 'Shinkai Instruments' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Hanul Engineering' })).not.toBeVisible();

  // Sign out lands back on login; the session is actually gone. Keyboard
  // activation, deliberately: the polling queries re-render the page every
  // 30s and a pointer click can lose the actionability race to a re-render.
  await page.getByRole('button', { name: 'Sign out' }).focus();
  await page.keyboard.press('Enter');
  await page.waitForURL('**/login');
  await page.goto('/today');
  await page.waitForURL(/\/login/); // guard bounced us
});
