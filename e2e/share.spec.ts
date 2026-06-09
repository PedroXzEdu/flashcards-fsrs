import { test, expect } from "@playwright/test";
import { uniqueUser } from "./helpers";

test.describe("Share / Unshare Flow", () => {
  test("share a deck and import as another user", async ({ page, browser }) => {
    const userA = uniqueUser();
    const userB = uniqueUser();
    const deckName = `Compartilhado ${Date.now()}`;

    // ---- User A: Register and create a deck ----
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(userA.name);
    await page.getByPlaceholder("seu@email.com").fill(userA.email);
    await page.getByPlaceholder("••••••••").fill(userA.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({
      timeout: 10000,
    });

    // Create a deck
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    // Navigate to deck page
    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    // ---- Share the deck ----
    await page.getByRole("button", { name: /compartilhar baralho/i }).click();
    await expect(page.getByText(/compartilhar baralho/i)).toBeVisible();

    // Click "Gerar link"
    await page.getByRole("button", { name: /gerar link/i }).click();

    // Wait for the share URL to appear in the modal
    const shareUrlEl = page.locator("span", { hasText: /\/shared\// });
    await expect(shareUrlEl).toBeVisible({ timeout: 10000 });
    const shareUrl = await shareUrlEl.textContent();
    expect(shareUrl).not.toBeNull();

    // Extract token from the URL
    const shareText = shareUrl!.trim();
    const token = shareText.split("/shared/")[1];
    expect(token).toBeDefined();
    expect(token!.length).toBeGreaterThan(0);

    // Close the modal
    await page.getByRole("button", { name: /feito/i }).click();

    // ---- Switch to User B (new browser context) ----
    const contextB = await browser.newContext({
      storageState: undefined,
    });
    const pageB = await contextB.newPage();

    // Register user B
    await pageB.goto("/register");
    await pageB.getByPlaceholder("Seu nome").fill(userB.name);
    await pageB.getByPlaceholder("seu@email.com").fill(userB.email);
    await pageB.getByPlaceholder("••••••••").fill(userB.password);
    await pageB.getByRole("button", { name: /criar conta/i }).click();
    await expect(pageB.getByText(/meus baralhos/i)).toBeVisible({
      timeout: 10000,
    });

    // ---- User B: Navigate to shared deck preview ----
    await pageB.goto(`/shared/${token}`);
    await expect(pageB.getByText(deckName)).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText(/importar baralho/i)).toBeVisible();

    // Import the shared deck
    await pageB.getByRole("button", { name: /importar baralho/i }).click();

    // Verify success
    await expect(pageB.getByText(/baralho importado/i)).toBeVisible({
      timeout: 10000,
    });

    // Navigate to dashboard
    await pageB.getByRole("button", { name: /ver meus baralhos/i }).click();
    await expect(pageB.getByText(/meus baralhos/i)).toBeVisible({
      timeout: 10000,
    });

    // Verify the imported deck (with "(cópia)" suffix) appears
    await expect(
      pageB.getByText(new RegExp(`${deckName}.*cópia`, "i")),
    ).toBeVisible();

    await contextB.close();
  });

  test("unshare a deck and verify link no longer works", async ({ page }) => {
    const user = uniqueUser();
    const deckName = `Unshare Deck ${Date.now()}`;

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

    // Navigate to deck page
    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    // Share the deck
    await page.getByRole("button", { name: /compartilhar baralho/i }).click();
    await expect(page.getByText(/compartilhar baralho/i)).toBeVisible();

    await page.getByRole("button", { name: /gerar link/i }).click();
    const shareUrlEl = page.locator("span", { hasText: /\/shared\// });
    await expect(shareUrlEl).toBeVisible({ timeout: 10000 });
    const shareUrl = await shareUrlEl.textContent();
    const shareText = shareUrl!.trim();
    const token = shareText.split("/shared/")[1];

    // Verify the shared page is accessible
    const previewPage = await page.context().newPage();
    await previewPage.goto(`/shared/${token}`);
    await expect(previewPage.getByText(deckName)).toBeVisible({
      timeout: 10000,
    });
    await previewPage.close();

    // ---- Unshare ----
    await page.getByRole("button", { name: /desativar link/i }).click();
    await expect(page.getByText(/desativar compartilhamento/i)).toBeVisible();
    await page.getByRole("button", { name: /excluir/i }).click();

    // Wait for confirmation toast
    await expect(page.getByText(/compartilhamento desativado/i)).toBeVisible({
      timeout: 10000,
    });

    // Close share modal
    await page.getByRole("button", { name: /feito/i }).click();

    // ---- Verify the link no longer works ----
    const verifyPage = await page.context().newPage();
    await verifyPage.goto(`/shared/${token}`);
    await expect(verifyPage.getByText(/não encontrado/i)).toBeVisible({
      timeout: 10000,
    });
    await verifyPage.close();
  });
});
