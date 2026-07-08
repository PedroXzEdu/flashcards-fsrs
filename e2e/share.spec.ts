import { test, expect } from "@playwright/test";
import { authTest } from "./helpers/auth";
import { uniqueUser } from "./helpers";

authTest.describe("Share / Unshare Flow", () => {
  authTest("share a deck and import as another user", async ({ page, browser }) => {
    const userB = uniqueUser();
    const deckName = `Compartilhado ${Date.now()}`;

    // ---- User A (authenticated via global setup): Create a deck ----
    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    // ---- Share the deck ----
    await page.getByRole("button", { name: /compartilhar baralho/i }).click();
    await expect(page.getByText(/compartilhar baralho/i)).toBeVisible();

    await page.getByRole("button", { name: /gerar link/i }).click();

    const shareUrlEl = page.locator("span", { hasText: /\/shared\// });
    await expect(shareUrlEl).toBeVisible({ timeout: 10000 });
    const shareUrl = await shareUrlEl.textContent();
    expect(shareUrl).not.toBeNull();

    const shareText = shareUrl!.trim();
    const token = shareText.split("/shared/")[1];
    expect(token).toBeDefined();
    expect(token!.length).toBeGreaterThan(0);

    await page.getByRole("button", { name: /feito/i }).click();

    // ---- Switch to User B (new browser context) ----
    const contextB = await browser.newContext({ storageState: undefined });
    const pageB = await contextB.newPage();

    await pageB.goto("/register");
    await pageB.getByPlaceholder("Seu nome").fill(userB.name);
    await pageB.getByPlaceholder("seu@email.com").fill(userB.email);
    await pageB.getByPlaceholder("••••••••").fill(userB.password);
    await pageB.getByRole("button", { name: /criar conta/i }).click();
    await expect(pageB.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    // ---- User B: Navigate to shared deck preview ----
    await pageB.goto(`/shared/${token}`);
    await expect(pageB.getByText(deckName)).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText(/importar baralho/i)).toBeVisible();

    await pageB.getByRole("button", { name: /importar baralho/i }).click();
    await expect(pageB.getByText(/baralho importado/i)).toBeVisible({ timeout: 10000 });

    await pageB.getByRole("button", { name: /ver meus baralhos/i }).click();
    await expect(pageB.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    await expect(
      pageB.getByText(new RegExp(`${deckName}.*cópia`, "i")),
    ).toBeVisible();

    await contextB.close();
  });

  authTest("unshare a deck and verify link no longer works", async ({ page }) => {
    const deckName = `Unshare Deck ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

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
    await expect(previewPage.getByText(deckName)).toBeVisible({ timeout: 10000 });
    await previewPage.close();

    // ---- Unshare ----
    await page.getByRole("button", { name: /desativar link/i }).click();
    await expect(page.getByText(/desativar compartilhamento/i)).toBeVisible();
    await page.getByRole("button", { name: /excluir/i }).click();

    await expect(page.getByText(/compartilhamento desativado/i)).toBeVisible({ timeout: 10000 });

    // After unsharing, the modal returns to non-shared state with Cancelar button
    await page.getByRole("button", { name: /cancelar/i }).click();

    // ---- Verify the link no longer works ----
    const verifyPage = await page.context().newPage();
    await verifyPage.goto(`/shared/${token}`);
    await expect(verifyPage.getByText(/não encontrado/i)).toBeVisible({ timeout: 10000 });
    await verifyPage.close();
  });

  authTest("share an empty deck generates a valid link", async ({ page }) => {
    const deckName = `EmptyShare ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /compartilhar baralho/i }).click();
    await expect(page.getByText(/compartilhar baralho/i)).toBeVisible();

    await page.getByRole("button", { name: /gerar link/i }).click();

    const shareUrlEl = page.locator("span", { hasText: /\/shared\// });
    await expect(shareUrlEl).toBeVisible({ timeout: 10000 });
  });

  test("invalid share token shows not found message", async ({ page }) => {
    await page.goto("/shared/token-invalido-123");
    await expect(
      page.getByText(/baralho não encontrado ou link inválido/i),
    ).toBeVisible();
  });
});
