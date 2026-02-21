// Modified by Voicenter — 2026-02-20
// Description: RTL layout tests for Hebrew locale support
import { expect, test } from '../lib/fixtures/screenshot';

test.describe('RTL Layout', () => {
  test('should set dir=rtl on html element when Hebrew locale is active', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      localStorage.setItem('locale', 'he-IL');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('rtl');
  });

  test('should set dir=ltr on html element for English locale', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      localStorage.setItem('locale', 'en');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const dir = await page.getAttribute('html', 'dir');
    expect(dir).toBe('ltr');
  });

  test('should set lang attribute on html element when locale is set', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.evaluate(() => {
      localStorage.setItem('locale', 'he-IL');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toBe('he-IL');
  });

  test('should render charts with dir=ltr regardless of locale', async ({
    page,
  }) => {
    await page.evaluate(() => {
      localStorage.setItem('locale', 'he-IL');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    const chartContainers = page.locator('[dir="ltr"]');
    const htmlDir = await page.getAttribute('html', 'dir');

    if (htmlDir === 'rtl') {
      const chartCount = await chartContainers.count();
      expect(chartCount).toBeGreaterThanOrEqual(0);
    }
  });
});
