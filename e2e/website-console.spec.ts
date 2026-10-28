import { test, expect } from '@playwright/test';
test.use({ serviceWorkers: 'block' });
for (const path of ['/itx-console-7k2m', '/itx-console-7k2m/sign-in']) {
  test(`retired website console: ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(
      page.getByRole('heading', {
        name: 'Website intake has moved to Google Forms',
      }),
    ).toBeVisible();
    await expect(page.locator('input')).toHaveCount(0);
  });
}
test('old API cannot request an email code or access records', async ({
  request,
}) => {
  for (const path of ['auth/request', 'auth/verify', 'admin/records']) {
    const response = await request.post('/itx-console-7k2m/api/' + path, {
      data: { email: 'test@example.invalid' },
    });
    expect(response.status()).toBe(410);
  }
});
