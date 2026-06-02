import { test, expect } from "@playwright/test";
import { uniqueUser, sampleApkgPath } from "./helpers";

test.describe("Import .apkg Flow", () => {
  test("import a sample .apkg file", async ({ page }) => {
    const user = uniqueUser();

    // Register
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    // Open import modal
    await page.getByRole("button", { name: /importar .apkg/i }).click();
    await expect(page.getByText(/importar baralho anki/i)).toBeVisible();

    // Upload the .apkg file via hidden input
    await page.locator('input[type="file"]').setInputFiles(sampleApkgPath());
    await expect(page.getByText("sample.apkg")).toBeVisible();

    // Click Import button
    await page.getByRole("button", { name: /^importar$/i }).click();

    // Wait for import to complete
    await expect(page.getByText(/importação concluída/i)).toBeVisible({
      timeout: 15000,
    });

    // Click "Ver baralho importado"
    await page.getByRole("button", { name: /ver baralho importado/i }).click();

    // Verify the imported deck appears in the dashboard (name from filename)
    await expect(page.getByText("sample")).toBeVisible();
  });
});
