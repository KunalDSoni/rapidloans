const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.describe('Rapid Loans site', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('accessibility: no WCAG 2.0/2.1 A & AA violations (incl. color contrast)', async ({ page }, testInfo) => {
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (results.violations.length) {
      const summary = results.violations.map(v =>
        `\n[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s))\n  ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join('\n  ')}`
      ).join('\n');
      await testInfo.attach('axe-violations.json', {
        body: JSON.stringify(results.violations, null, 2),
        contentType: 'application/json',
      });
      console.log('AXE VIOLATIONS:' + summary);
    }
    expect(results.violations, 'axe accessibility violations').toEqual([]);
  });

  test('color contrast: no contrast violations specifically', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('document has lang attribute and a non-empty title', async ({ page }) => {
    await expect(page).toHaveTitle(/.+/);
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang, 'html[lang] must be set').toBeTruthy();
  });

  test('responsive: viewport meta tag present', async ({ page }) => {
    const content = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(content).toContain('width=device-width');
  });

  test('all content images have alt text', async ({ page }) => {
    const missing = await page.$$eval('img', imgs =>
      imgs
        .filter(img => img.getAttribute('aria-hidden') !== 'true' && img.getAttribute('role') !== 'presentation')
        .filter(img => img.getAttribute('alt') === null)
        .map(img => img.getAttribute('src'))
    );
    expect(missing, `images missing alt: ${missing.join(', ')}`).toEqual([]);
  });

  test('no horizontal overflow', async ({ page }) => {
    const overflow = await page.evaluate(() => {
      const de = document.documentElement;
      return de.scrollWidth - window.innerWidth;
    });
    expect(overflow, 'page should not scroll horizontally').toBeLessThanOrEqual(1);
  });

  test('exactly one H1 on the page', async ({ page }) => {
    const count = await page.locator('h1').count();
    expect(count).toBe(1);
  });

  test('all buttons/links have an accessible name', async ({ page }) => {
    const unnamed = await page.$$eval('a, button', els =>
      els
        .filter(el => el.offsetParent !== null || el.getBoundingClientRect().width > 0)
        .filter(el => {
          const text = (el.textContent || '').trim();
          const aria = el.getAttribute('aria-label');
          const title = el.getAttribute('title');
          const hasImg = el.querySelector('img[alt]:not([alt=""])');
          return !text && !aria && !title && !hasImg;
        })
        .map(el => el.outerHTML.slice(0, 80))
    );
    expect(unnamed, `controls without accessible name: ${unnamed.join(' | ')}`).toEqual([]);
  });

  test('language switching translates content', async ({ page }) => {
    const heroSelector = 'h1';
    const enText = (await page.locator(heroSelector).first().innerText()).trim();
    await page.evaluate(() => setLanguage('hi'));
    const hiText = (await page.locator(heroSelector).first().innerText()).trim();
    expect(hiText).not.toBe(enText);
    // partner labels (the recently wrapped strings) should also translate
    await page.evaluate(() => setLanguage('te'));
    const label = (await page.locator('.partner-stat-label').first().innerText()).trim();
    expect(label).not.toBe('States');
    await page.evaluate(() => setLanguage('en'));
  });
});
