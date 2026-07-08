import { expect } from "@playwright/test";
import { authTest } from "./helpers/auth";
import { sampleApkgPath } from "./helpers";
import { tmpdir } from "os";
import { join } from "path";
import { writeFileSync, unlinkSync } from "fs";

authTest.describe("Import .apkg Flow", () => {
  authTest("import a sample .apkg file", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /importar .apkg/i }).click();
    await expect(page.getByText(/importar baralho anki/i)).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(sampleApkgPath());
    await expect(page.getByText("sample.apkg")).toBeVisible();

    await page.getByRole("button", { name: /^importar$/i }).click();

    await expect(page.getByText(/importação concluída/i)).toBeVisible({
      timeout: 15000,
    });

    await page.getByRole("button", { name: /ver baralho importado/i }).click();
    await expect(page.getByText("sample")).toBeVisible();
  });

  authTest("invalid file type shows error message", async ({ page }) => {
    const invalidPath = join(tmpdir(), "not-an-apkg.txt");
    writeFileSync(invalidPath, "this is not an apkg file", "utf-8");

    await page.goto("/");
    await page.getByRole("button", { name: /importar .apkg/i }).click();
    await expect(page.getByText(/importar baralho anki/i)).toBeVisible();

    await page.locator('input[type="file"]').setInputFiles(invalidPath);

    await expect(page.getByText("Apenas arquivos .apkg são aceitos.")).toBeVisible();

    unlinkSync(invalidPath);
  });

  authTest("import without file shows error message", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /importar .apkg/i }).click();
    await expect(page.getByText(/importar baralho anki/i)).toBeVisible();

    await page.getByRole("button", { name: /^importar$/i }).click();

    await expect(
      page.getByText("Selecione um arquivo .apkg primeiro."),
    ).toBeVisible();
  });
});
