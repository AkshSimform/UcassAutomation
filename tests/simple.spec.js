import { test, expect } from '@playwright/test';

test.describe('Simple Test Suite', () => {
  test('Simple passing test', async ({ page }) => {
    await page.goto('https://example.com');
    await expect(page).toHaveTitle(/Example Domain/);
  });

  test('Simple math test', async () => {
    expect(2 + 2).toBe(4);
  });
});