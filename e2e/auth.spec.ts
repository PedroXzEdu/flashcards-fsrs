import { test, expect } from "@playwright/test";
import { uniqueUser } from "./helpers";

test.describe("Auth Flow", () => {
  test("register new user and redirect to dashboard", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/register");
    await expect(page.getByText("Crie sua conta")).toBeVisible();

    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();

    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(user.name)).toBeVisible();
  });

  test("logout clears session", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /sair/i }).click();
    await page.waitForURL("/login");
  });

  test("login with existing credentials", async ({ page }) => {
    const user = uniqueUser();

    // Register first
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    // Logout
    await page.getByRole("button", { name: /sair/i }).click();
    await page.waitForURL("/login");

    // Login
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").first().fill(user.password);
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(user.name)).toBeVisible();
  });

  test("protected route redirects to login without auth", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("/login");
    await expect(page.getByRole("heading", { name: /flashfsrs/i })).toBeVisible();
  });

  test("protected stats route redirects to login without auth", async ({ page }) => {
    await page.goto("/stats");
    await page.waitForURL("/login");
    await expect(page.getByText(/entre na sua conta/i)).toBeVisible();
  });
});
