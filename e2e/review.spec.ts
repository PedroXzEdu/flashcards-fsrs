import { expect } from "@playwright/test";
import { authTest } from "./helpers/auth";

let counter = Date.now();

function uniqueDeckName(label: string) {
  return `${label} ${counter++}`;
}

async function createDeckWithCards(
  page: import("@playwright/test").Page,
  deckLabel: string,
  cardCount: number,
): Promise<{ deckName: string; deckUrl: string }> {
  const deckName = uniqueDeckName(deckLabel);

  await page.goto("/");
  await expect(page.getByText(/meus baralhos/i)).toBeVisible();

  await page.getByRole("button", { name: /novo baralho/i }).click();
  await page.getByPlaceholder("Título do baralho").fill(deckName);
  await page.getByRole("button", { name: /criar/i, exact: true }).click();
  await expect(page.getByText(deckName)).toBeVisible();

  await page.getByText(deckName).click();
  await page.waitForURL(/\/decks\/\d+/);
  const deckUrl = page.url();

  await page.getByRole("button", { name: /em lote/i }).click();

  const lines: string[] = [];
  for (let i = 1; i <= cardCount; i++) {
    lines.push(`Front ${deckLabel}-${i} | Back ${deckLabel}-${i}`);
  }
  await page.getByPlaceholder(/hello/i).fill(lines.join("\n"));
  await page.getByRole("button", { name: /criar cards/i }).click();

  // Wait for cards to render, then reload so due counts refresh
  await expect(page.getByText(`Front ${deckLabel}-1`)).toBeVisible({ timeout: 10000 });
  await page.reload();

  return { deckName, deckUrl };
}

authTest.describe("Review Flow", () => {
  authTest("all four ratings via buttons", async ({ page }) => {
    const { deckUrl } = await createDeckWithCards(page, "Btn", 4);

    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    // Card 1: Again (De novo)
    await expect(page.getByText("Front Btn-1")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /de novo/i })).toBeVisible();
    await page.getByRole("button", { name: /de novo/i }).click();

    // Card 2: Hard (Difícil)
    await expect(page.getByText("Front Btn-2")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /difícil/i })).toBeVisible();
    await page.getByRole("button", { name: /difícil/i }).click();

    // Card 3: Good (Bom)
    await expect(page.getByText("Front Btn-3")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
    await page.getByRole("button", { name: /bom/i }).click();

    // Card 4: Easy (Fácil)
    await expect(page.getByText("Front Btn-4")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /fácil/i })).toBeVisible();
    await page.getByRole("button", { name: /fácil/i }).click();

    await expect(page.getByText(/sessão concluída/i)).toBeVisible({ timeout: 5000 });
  });

  authTest("all four ratings via keyboard shortcuts", async ({ page }) => {
    const { deckUrl } = await createDeckWithCards(page, "Keys", 4);

    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    // Card 1: Again (key 1)
    await expect(page.getByText("Front Keys-1")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /de novo/i })).toBeVisible();
    await page.keyboard.press("1");

    // Card 2: Hard (key 2)
    await expect(page.getByText("Front Keys-2")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /difícil/i })).toBeVisible();
    await page.keyboard.press("2");

    // Card 3: Good (key 3)
    await expect(page.getByText("Front Keys-3")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
    await page.keyboard.press("3");

    // Card 4: Easy (key 4)
    await expect(page.getByText("Front Keys-4")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /fácil/i })).toBeVisible();
    await page.keyboard.press("4");

    await expect(page.getByText(/sessão concluída/i)).toBeVisible({ timeout: 5000 });
  });

  authTest("empty review queue shows empty state", async ({ page }) => {
    const deckName = uniqueDeckName("EmptyQueue");

    await page.goto("/");
    await page.getByRole("button", { name: /novo baralho/i }).click();
    await page.getByPlaceholder("Título do baralho").fill(deckName);
    await page.getByRole("button", { name: /criar/i, exact: true }).click();
    await expect(page.getByText(deckName)).toBeVisible();

    await page.getByText(deckName).click();
    await page.waitForURL(/\/decks\/\d+/);
    const deckUrl = page.url();

    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    await expect(
      page.getByText(/nenhum card disponível/i),
    ).toBeVisible();
  });

  authTest("due counter on dashboard shows cards for review", async ({ page }) => {
    const { deckName } = await createDeckWithCards(page, "DueCount", 3);

    await page.goto("/");
    await expect(page.getByText(/meus baralhos/i)).toBeVisible();

    await expect(page.getByText("3 hoje")).toBeVisible();
  });

  authTest("session complete with single card rated Good", async ({ page }) => {
    const { deckUrl } = await createDeckWithCards(page, "Single", 1);

    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    await expect(page.getByText("Front Single-1")).toBeVisible();
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: /bom/i })).toBeVisible();
    await page.getByRole("button", { name: /bom/i }).click();

    await expect(page.getByText(/sessão concluída/i)).toBeVisible({ timeout: 5000 });
  });

  authTest("dashboard shows due counts when returning after reviews", async ({ page }) => {
    const { deckUrl, deckName } = await createDeckWithCards(page, "AfterReview", 2);

    // Review all cards
    await page.goto(`${deckUrl}/review`);
    await page.waitForURL(/\/decks\/\d+\/review/);

    await expect(page.getByText("Front AfterReview-1")).toBeVisible();
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: /bom/i }).click();

    await expect(page.getByText("Front AfterReview-2")).toBeVisible({ timeout: 5000 });
    await page.keyboard.press("Space");
    await page.getByRole("button", { name: /bom/i }).click();

    await expect(page.getByText(/sessão concluída/i)).toBeVisible({ timeout: 5000 });

    // Go back to dashboard
    await page.getByRole("button", { name: /ir para o início/i }).click();
    await page.waitForURL("/");

    await expect(page.getByText(deckName)).toBeVisible();
    // Due count should be 0 or the badge should not appear
    await expect(page.getByText("0 hoje")).not.toBeVisible();
  });
});
