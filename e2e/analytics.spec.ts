import { test, expect } from "@playwright/test";
import { uniqueUser } from "./helpers";

test.describe("Analytics E2E", () => {
  test("create deck, review cards, and verify analytics page loads", async ({
    page,
  }) => {
    const user = uniqueUser();
    const deckName = `Analytics Deck ${Date.now()}`;

    // Register
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({
      timeout: 10000,
    });

    // Create a deck
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    // Navigate to deck
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
    await page.waitForSelector("text=Front A");

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

    // Verify session complete
    await expect(page.getByText(/sessão concluída/i)).toBeVisible({
      timeout: 5000,
    });

    // ---- Navigate to analytics ----
    await page.goto("/stats");
    await page.waitForURL("/stats");

    // Verify analytics components render
    await expect(page.getByText(/estatísticas globais/i)).toBeVisible({
      timeout: 10000,
    });

    // Check for summary cards (should show data from reviews)
    await expect(page.getByText(/total revisões/i)).toBeVisible();
    await expect(page.getByText(/retenção/i)).toBeVisible();

    // Check for charts (AreaChart, BarChart, PieChart, Heatmap)
    // The recharts components render SVG elements
    const svgs = page.locator("svg");
    await expect(svgs.first()).toBeVisible({ timeout: 10000 });
  });
});
