import { test, expect } from '@playwright/test';

test('home page loads welcome state', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'ยินดีต้อนรับสู่ระบบข้อมูลแผ่นดินไหว' })
  ).toBeVisible();
  await expect(page.getByText('เลือกแหล่งข้อมูลเพื่อดูข้อมูลแผ่นดินไหวล่าสุดบนแผนที่')).toBeVisible();
});

test('USGS Asia shows blue country overlay', async ({ page }) => {
  page.on('console', msg => console.log(`BROWSER_LOG: ${msg.text()}`));
  let asiaRequestCount = 0;
  await page.route('**/api/asia-geojson', async (route) => {
    asiaRequestCount += 1;
    await route.fulfill({
      json: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { name: 'Test Asia' },
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [100, 10],
                  [110, 10],
                  [110, 20],
                  [100, 20],
                  [100, 10],
                ],
              ],
            },
          },
        ],
      },
    });
  });

  await page.route('https://earthquake.usgs.gov/fdsnws/event/1/query**', async (route) => {
    await route.fulfill({
      json: {
        type: 'FeatureCollection',
        features: [],
      },
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /USGS เอเชีย/ }).click();

  await page.waitForSelector('.leaflet-map-pane', { state: 'attached' });

  await expect.poll(() => asiaRequestCount).toBeGreaterThan(0);

  await expect.poll(async () => {
    return await page.evaluate(() => {
      const paths = Array.from(document.querySelectorAll('.leaflet-overlay-pane path'));
      console.log(`BROWSER_LOG: Found ${paths.length} paths in overlay pane`);
      if (paths.length === 0) return false;

      const debugInfo = paths.map(path => {
        const style = window.getComputedStyle(path);
        return {
          fill: style.fill,
          fillOpacity: style.fillOpacity,
          stroke: style.stroke
        };
      });
      console.log('Found paths with styles:', JSON.stringify(debugInfo));

      return paths.some((path) => {
        const style = window.getComputedStyle(path);
        const fill = style.fill;
        const fillOpacity = Number.parseFloat(style.fillOpacity || '1');
        // Check for rgb(59, 130, 246) or hex #3b82f6 for blue-500
        const isBlueFill = fill.includes('59, 130, 246') || fill.includes('3b82f6') || fill === '#3b82f6';
        const hasOpacity = fillOpacity > 0.1 || fill.startsWith('rgba');
        return isBlueFill && hasOpacity;
      });
    });
  }).toBeTruthy();
});
