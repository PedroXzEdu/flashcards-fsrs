import { test, expect } from "@playwright/test";
import { authTest } from "./helpers/auth";
import { uniqueUser } from "./helpers";

let deckCounter = Date.now();

function uniqueDeckName(label: string) {
  return `${label} ${deckCounter++}`;
}

test.describe("Deck Management", () => {
  test("dashboard shows empty state when no decks exist", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    await expect(page.getByText("Nenhum baralho ainda.")).toBeVisible();
    await expect(
      page.getByText("Crie seu primeiro baralho para começar!"),
    ).toBeVisible();

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill("Meu primeiro deck");
    await page.getByRole("button", { name: /criar/i, exact: true }).click();

    await expect(page.getByText("Nenhum baralho ainda.")).not.toBeVisible();
    await expect(page.getByText("Meu primeiro deck")).toBeVisible();
  });

  authTest("create a deck and verify it appears on dashboard", async ({
    page,
  }) => {
    const deckName = uniqueDeckName("Criação");

    await page.goto("/");
    await expect(page.getByText(/meus baralhos/i)).toBeVisible();

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();

    await expect(page.getByText(deckName)).toBeVisible();
  });

  authTest("create deck with empty title does nothing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/meus baralhos/i)).toBeVisible();

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill("");
    await page.getByRole("button", { name: /criar/i, exact: true }).click();

    await expect(page.getByPlaceholder("Título do baralho")).toBeVisible();
  });

  authTest("rename a deck", async ({ page }) => {
    const originalName = uniqueDeckName("Original");
    const newName = uniqueDeckName("Renomeado");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(originalName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(originalName)).toBeVisible();

    await page.getByText(originalName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /renomear baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").clear();
    await page.getByPlaceholder("Título do baralho").fill(newName);
    await page.getByRole("button", { name: /salvar/i }).click();

    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(originalName)).not.toBeVisible();

    await page.reload();
    await expect(page.getByText(newName)).toBeVisible();
  });

  authTest("delete an empty deck", async ({ page }) => {
    const deckName = uniqueDeckName("ParaExcluir");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page
      .getByRole("heading", { name: deckName })
      .locator("..")
      .locator("..")
      .locator("..")
      .getByRole("button", { name: /excluir baralho/i })
      .click();

    await expect(page.getByText("Excluir baralho")).toBeVisible();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();

    await expect(page.getByText(deckName)).not.toBeVisible();
  });

  authTest("cancel deck deletion keeps the deck", async ({ page }) => {
    const deckName = uniqueDeckName("NaoExcluir");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page
      .getByRole("heading", { name: deckName })
      .locator("..")
      .locator("..")
      .locator("..")
      .getByRole("button", { name: /excluir baralho/i })
      .click();

    await expect(page.getByText("Excluir baralho")).toBeVisible();
    await page.getByRole("button", { name: /cancelar/i }).click();

    await expect(page.getByText(deckName)).toBeVisible();
  });

  authTest("multiple decks are listed", async ({ page }) => {
    const deckA = uniqueDeckName("Alpha");
    const deckB = uniqueDeckName("Beta");
    const deckC = uniqueDeckName("Gamma");

    await page.goto("/");

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckA);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckA)).toBeVisible();

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckB);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckB)).toBeVisible();

    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckC);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckC)).toBeVisible();
  });
});
