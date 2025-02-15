import { test } from '@playwright/test';

test('No challenge and no 3DS method', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click(`a[id=NO_CHALLENGE_NO_3DS_METHOD]`);
  await page.waitForSelector('text=Payment successful');
});

test('No challenge and 3DS method', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click(`a[id=NO_CHALLENGE_3DS_METHOD]`);
  await page.waitForSelector('text=Payment successful');
});

test('Challenge and no 3DS method', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click(`a[id=CHALLENGE_NO_3DS_METHOD]`);
  await page.waitForSelector('#authform');
  await page.click('#yes');
  await page.waitForSelector('text=Payment successful');
});

test('Challenge and 3DS method', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.click(`a[id=CHALLENGE_3DS_METHOD]`);
  await page.waitForSelector('#authform');
  await page.click('#yes');
  await page.waitForSelector('text=Payment successful');
});
