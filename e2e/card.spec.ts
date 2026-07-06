import { expect } from "@playwright/test";
import { authTest } from "./helpers/auth";

let cardCounter = Date.now();

function uniqueDeckName(label: string) {
  return `${label} ${cardCounter++}`;
}

authTest.describe("Card Management", () => {
  authTest("empty deck shows empty state", async ({ page }) => {
    const deckName = uniqueDeckName("Vazio");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await expect(page.getByText("Este baralho está vazio")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /criar primeiro card/i }),
    ).toBeVisible();
  });

  authTest("batch create cards via bulk import", async ({ page }) => {
    const deckName = uniqueDeckName("Lote");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /em lote/i }).click();
    await page
      .getByPlaceholder(/hello/i)
      .fill("Front A | Back A\nFront B | Back B\nFront C | Back C");
    await page.getByRole("button", { name: /criar cards/i }).click();

    await expect(page.getByText("Front A")).toBeVisible();
    await expect(page.getByText("Front B")).toBeVisible();
    await expect(page.getByText("Front C")).toBeVisible();
  });

  authTest("create a single card via editor", async ({ page }) => {
    const deckName = uniqueDeckName("Unico");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /novo card/i }).click();

    const tiptapEditors = page.locator(".tiptap");
    await tiptapEditors.first().fill("Pergunta única");
    await tiptapEditors.last().fill("Resposta única");

    const form = page.locator("h2").filter({ hasText: "Novo card" }).locator("..");
    await form.getByRole("button", { name: "Criar", exact: true }).click();

    await expect(page.getByText("Pergunta única")).toBeVisible();
  });

  authTest("edit a card inline", async ({ page }) => {
    const deckName = uniqueDeckName("Editar");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /em lote/i }).click();
    await page
      .getByPlaceholder(/hello/i)
      .fill("Front original | Back original");
    await page.getByRole("button", { name: /criar cards/i }).click();
    await expect(page.getByText("Front original")).toBeVisible();

    await page.getByRole("button", { name: /editar card/i }).click();

    const textareas = page.locator("textarea");
    await textareas.first().fill("Front editado");
    await textareas.last().fill("Back editado");

    await page.getByRole("button", { name: /salvar/i }).click();

    await expect(page.getByText("Front editado")).toBeVisible();
    await expect(page.getByText("Back editado")).toBeVisible();
  });

  authTest("delete a card", async ({ page }) => {
    const deckName = uniqueDeckName("Excluir");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /em lote/i }).click();
    await page
      .getByPlaceholder(/hello/i)
      .fill("Deletar este | Back");
    await page.getByRole("button", { name: /criar cards/i }).click();
    await expect(page.getByText("Deletar este")).toBeVisible();

    await page.getByRole("button", { name: /excluir card/i }).click();
    await expect(page.getByText("Excluir card")).toBeVisible();
    await page.getByRole("button", { name: "Excluir", exact: true }).click();

    await expect(page.getByText("Deletar este")).not.toBeVisible();
  });

  authTest("cancel card deletion keeps the card", async ({ page }) => {
    const deckName = uniqueDeckName("NaoExcluirCard");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);

    await page.getByRole("button", { name: /em lote/i }).click();
    await page
      .getByPlaceholder(/hello/i)
      .fill("Manter este | Back");
    await page.getByRole("button", { name: /criar cards/i }).click();
    await expect(page.getByText("Manter este")).toBeVisible();

    await page.getByRole("button", { name: /excluir card/i }).click();
    await expect(page.getByText("Excluir card")).toBeVisible();
    await page.getByRole("button", { name: /cancelar/i }).click();

    await expect(page.getByText("Manter este")).toBeVisible();
  });
});
