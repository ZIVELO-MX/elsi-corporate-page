import { expect, test } from "@playwright/test";

type ElsiVitals = {
  cls: number;
  lcp: {
    element: string | null;
    startTime: number;
    url: string;
  } | null;
};

test("Home keeps the hero stable and exposes one preload candidate", async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    const metrics: ElsiVitals = { cls: 0, lcp: null };
    Object.assign(window, { __elsiVitals: metrics });

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };
        if (!shift.hadRecentInput) metrics.cls += shift.value;
      }
    }).observe({ type: "layout-shift", buffered: true });

    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const entry = entries.at(-1) as
        | (PerformanceEntry & { element?: Element | null; url?: string })
        | undefined;
      if (!entry) return;
      metrics.lcp = {
        element: entry.element?.tagName ?? null,
        startTime: entry.startTime,
        url: entry.url ?? "",
      };
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);

  const hero = page.getByRole("img", {
    name: /Paisaje boscoso junto a un lago/,
  });
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute("width", "3840");
  await expect(hero).toHaveAttribute("height", "2160");
  await expect(hero).toHaveJSProperty("complete", true);

  const preloads = page.locator('link[rel="preload"][as="image"]');
  await expect(preloads).toHaveCount(1);
  await expect(preloads.first()).toHaveAttribute("imagesizes", /734px/);

  const metrics = await page.evaluate(
    () =>
      (
        window as typeof window & {
          __elsiVitals: ElsiVitals;
        }
      ).__elsiVitals,
  );

  expect(metrics.cls).toBeLessThan(0.1);
  expect(metrics.lcp?.startTime).toBeGreaterThan(0);

  await testInfo.attach("image-performance.json", {
    body: JSON.stringify(metrics, null, 2),
    contentType: "application/json",
  });
  console.log(`Image performance: ${JSON.stringify(metrics)}`);
});
