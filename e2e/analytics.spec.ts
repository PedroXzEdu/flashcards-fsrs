import { expect } from "@playwright/test";
import { authTest } from "./helpers/auth";

authTest.describe("Analytics E2E", () => {
  authTest("analytics page shows empty state when no reviews exist", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForURL("/stats");

    await expect(page.getByText(/estatísticas globais/i)).toBeVisible({ timeout: 10000 });

    // Empty state messages should appear
    await expect(page.getByText(/nenhuma revisão ainda/i)).toBeVisible();
    await expect(page.getByText(/nenhum card ainda/i)).toBeVisible();
  });

  authTest("create deck, review cards, and verify analytics page loads", async ({ page }) => {
    const deckName = `Analytics Deck ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);
    const deckUrl = page.url();

    // Create cards via bulk import
    await page.getByRole("button", { name: /em lote/i }).click();
    await page
      .getByPlaceholder(/hello/i)
      .fill("Front A | Back A\nFront B | Back B\nFront C | Back C");
    await page.getByRole("button", { name: /criar cards/i }).click();
    await expect(page.getByText("Front A")).toBeVisible();

    // Reload to refresh due count
    await page.reload();
    await expect(page.getByText("Front A")).toBeVisible({ timeout: 10000 });

    // Review cards (rate all as "Good")
    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    for (let i = 0; i < 3; i++) {
      await expect(
        page.getByText(`Front ${String.fromCharCode(65 + i)}`),
      ).toBeVisible({ timeout: 5000 });
      await page.keyboard.press("Space");
      await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
      await page.getByRole("button", { name: /bom/i }).click();
    }

    await expect(page.getByText(/sessão concluída/i)).toBeVisible({ timeout: 5000 });

    // ---- Navigate to analytics ----
    await page.goto("/stats");
    await page.waitForURL("/stats");

    await expect(page.getByText(/estatísticas globais/i)).toBeVisible({ timeout: 10000 });

    await expect(page.getByText(/total revisões/i)).toBeVisible();
    await expect(page.getByText(/retenção/i)).toBeVisible();

    const svgs = page.locator("svg");
    await expect(svgs.first()).toBeVisible({ timeout: 10000 });
  });
});
