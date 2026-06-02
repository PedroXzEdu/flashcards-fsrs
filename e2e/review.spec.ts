import { test, expect } from "@playwright/test";
import { uniqueUser } from "./helpers";

test.describe("Review Flow", () => {
  test("full review cycle: create deck, create cards, review them", async ({
    page,
  }) => {
    const user = uniqueUser();
    const deckName = `E2E Deck ${Date.now()}`;

    // Register
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    // Create a deck
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();

    // Verify deck appears in dashboard
    await expect(page.getByText(deckName)).toBeVisible();

    // Navigate to deck
    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);
    const deckUrl = page.url();

    // Create cards via bulk import (avoids Tiptap complexity)
    await page.getByRole("button", { name: /em lote/i }).click();
    await page.getByPlaceholder(/hello/i).fill(
      "Front 1 | Back 1\nFront 2 | Back 2\nFront 3 | Back 3",
    );
    await page.getByRole("button", { name: /criar cards/i }).click();

    // Verify cards were created
    await expect(page.getByText("Front 1")).toBeVisible();
    await expect(page.getByText("Front 2")).toBeVisible();
    await expect(page.getByText("Front 3")).toBeVisible();

    // Reload page to refresh due count
    await page.reload();
    await page.waitForSelector("text=Front 1");

    // Navigate to review directly via URL
    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    // Verify review page loaded with first card
    await expect(page.getByText("Front 1")).toBeVisible();

    // Flip card (Space key)
    await page.keyboard.press("Space");

    // Wait for ratings to appear
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();

    // Rate as "Good" (rating 3)
    await page.getByRole("button", { name: /bom/i }).click();

    // Rate second card
    await expect(page.getByText("Front 2")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
    await page.getByRole("button", { name: /bom/i }).click();

    // Rate third card
    await expect(page.getByText("Front 3")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
    await page.getByRole("button", { name: /bom/i }).click();

    // Verify done screen
    await expect(page.getByText(/sessão concluída/i)).toBeVisible({
      timeout: 5000,
    });
  });
});
