import { test, expect } from "@playwright/test";
import { authTest } from "./helpers/auth";
import { uniqueUser } from "./helpers";

const E2E_EMAIL = process.env.E2E_USER_EMAIL || "e2e@flashfsrs-test.com";

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

    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill(user.name);
    await page.getByPlaceholder("seu@email.com").fill(user.email);
    await page.getByPlaceholder("••••••••").fill(user.password);
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible({ timeout: 10000 });

    await page.getByRole("button", { name: /sair/i }).click();
    await page.waitForURL("/login");

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

  test("register with empty name shows validation error", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("seu@email.com").fill("novo@test.com");
    await page.getByPlaceholder("••••••••").fill("Test12345!");
    await page.evaluate(() => {
      document.querySelector("form")?.setAttribute("novalidate", "");
    });
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText("Erro de validação.")).toBeVisible();
  });

  test("register with invalid email shows validation error", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill("Novo Usuário");
    await page.getByPlaceholder("seu@email.com").fill("email-invalido");
    await page.getByPlaceholder("••••••••").fill("Test12345!");
    await page.evaluate(() => {
      document.querySelector("form")?.setAttribute("novalidate", "");
    });
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText("Erro de validação.")).toBeVisible();
  });

  test("register with short password shows validation error", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill("Novo Usuário");
    await page.getByPlaceholder("seu@email.com").fill("novo@test.com");
    await page.getByPlaceholder("••••••••").fill("123");
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText("Erro de validação.")).toBeVisible();
  });

  test("register with existing email shows error", async ({ page }) => {
    await page.goto("/register");
    await page.getByPlaceholder("Seu nome").fill("Outro Usuário");
    await page.getByPlaceholder("seu@email.com").fill(E2E_EMAIL);
    await page.getByPlaceholder("••••••••").fill("Test12345!");
    await page.getByRole("button", { name: /criar conta/i }).click();
    await expect(page.getByText("Email já cadastrado.")).toBeVisible();
  });

  test("login with non-existent email shows error", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entre na sua conta/i)).toBeVisible();

    await page.getByPlaceholder("seu@email.com").fill("inexistente@test.com");
    await page.getByPlaceholder("••••••••").fill("QualquerSenha123!");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText("Usuário não encontrado.")).toBeVisible();
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entre na sua conta/i)).toBeVisible();

    await page.getByPlaceholder("seu@email.com").fill(E2E_EMAIL);
    await page.getByPlaceholder("••••••••").fill("SenhaErrada123!");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText("Senha inválida.")).toBeVisible();
  });

  test("login with empty fields shows validation error", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entre na sua conta/i)).toBeVisible();

    await page.evaluate(() => {
      document.querySelectorAll("[required]").forEach((el) => el.removeAttribute("required"));
    });

    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(page.getByText("Erro de validação.")).toBeVisible();
  });

  authTest("session persists after page reload", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/meus baralhos/i)).toBeVisible();

    await page.reload();
    await expect(page.getByText(/meus baralhos/i)).toBeVisible();
  });

  authTest("session persists across new tabs", async ({ page, context }) => {
    const newPage = await context.newPage();
    await newPage.goto("/");
    await expect(newPage.getByText(/meus baralhos/i)).toBeVisible();
    await newPage.close();
  });

  test("deck page redirects to login without auth", async ({ page }) => {
    await page.goto("/decks/1");
    await page.waitForURL("/login");
  });

  test("review page redirects to login without auth", async ({ page }) => {
    await page.goto("/decks/1/review");
    await page.waitForURL("/login");
  });
});
