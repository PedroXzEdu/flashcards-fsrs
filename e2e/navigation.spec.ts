import { expect } from "@playwright/test";
import { authTest } from "./helpers/auth";

const E2E_USER_NAME = process.env.E2E_USER_NAME || "E2E Test User";

authTest.describe("Navigation & UX", () => {
  authTest("header shows navigation links, user name, and logout button", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("FlashFSRS")).toBeVisible();

    await expect(page.getByTitle("Estatísticas globais")).toBeVisible();

    await expect(page.getByText(E2E_USER_NAME)).toBeVisible();

    await expect(page.getByTitle("Sair")).toBeVisible();
  });

  authTest("clicking Estatísticas navigates to stats page", async ({ page }) => {
    await page.goto("/");

    await page.getByTitle("Estatísticas globais").click();
    await page.waitForURL("/stats");

    await expect(page.getByText(/estatísticas globais/i)).toBeVisible();
  });

  authTest("theme toggle switches between dark and light", async ({ page }) => {
    await page.goto("/");

    const currentTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    const expectedTitle = currentTheme === "dark" ? /modo claro/i : /modo escuro/i;

    await page.getByTitle(expectedTitle).click();

    const newTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(newTheme).toBe(currentTheme === "dark" ? "light" : "dark");
  });

  authTest("theme persists after page reload", async ({ page }) => {
    await page.goto("/");

    const currentTheme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    const toggleTitle = currentTheme === "dark" ? /modo claro/i : /modo escuro/i;

    await page.getByTitle(toggleTitle).click();
    await page.reload();

    const afterReload = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme"),
    );
    expect(afterReload).toBe(currentTheme === "dark" ? "light" : "dark");
  });

  authTest("invalid route redirects to home", async ({ page }) => {
    await page.goto("/rota-inexistente");
    await page.waitForURL("/");

    await expect(page.getByText(/meus baralhos/i)).toBeVisible();
  });

  authTest("shared page is publicly accessible without auth", async ({ page, browser }) => {
    const deckName = `SharedNav ${Date.now()}`;

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);
    await page.getByRole("button", { name: /compartilhar baralho/i }).click();
    await page.getByRole("button", { name: /gerar link/i }).click();
    const shareUrlEl = page.locator("span", { hasText: /\/shared\// });
    await expect(shareUrlEl).toBeVisible({ timeout: 10000 });
    const token = (await shareUrlEl.textContent())!.trim().split("/shared/")[1];

    const unauthCtx = await browser.newContext({ storageState: undefined });
    const unauthPage = await unauthCtx.newPage();
    await unauthPage.goto(`/shared/${token}`);
    await expect(unauthPage.getByText(/você precisa estar logado/i)).toBeVisible();
    await expect(
      unauthPage.getByRole("button", { name: /entrar para importar/i }),
    ).toBeVisible();
    await unauthCtx.close();
  });
});
