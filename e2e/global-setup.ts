import { chromium } from "@playwright/test";
import { existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { config as loadEnv } from "dotenv";

loadEnv({ path: resolve(__dirname, ".env.e2e") });

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const AUTH_FILE = resolve(__dirname, ".auth", "user.json");

const E2E_USER = {
  name: process.env.E2E_USER_NAME || "E2E Test User",
  email: process.env.E2E_USER_EMAIL || "e2e@flashfsrs-test.com",
  password: process.env.E2E_USER_PASSWORD || "Test12345!",
};

async function waitForServer(url: string, timeoutMs = 120_000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error(`Server at ${url} did not respond within ${timeoutMs}ms`);
}

async function ensureStackIsUp(): Promise<void> {
  try {
    await fetch(FRONTEND_URL);
    return;
  } catch {
    // stack is not up — try to start it
  }

  const { execSync } = await import("child_process");

  console.log("[global-setup] Starting Docker stack...");

  try {
    execSync("docker compose up -d", { stdio: "inherit" });
  } catch {
    throw new Error(
      "Docker Compose failed. Ensure Docker is installed and the stack can be started.",
    );
  }

  await waitForServer(FRONTEND_URL);
  await waitForServer(BACKEND_URL);
  console.log("[global-setup] Stack is up.");
}

async function globalSetup() {
  const authDir = dirname(AUTH_FILE);
  if (!existsSync(authDir)) {
    mkdirSync(authDir, { recursive: true });
  }

  await ensureStackIsUp();

  let token: string;
  let userId: number;

  const loginRes = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: E2E_USER.email,
      password: E2E_USER.password,
    }),
  });

  if (loginRes.ok) {
    const data = await loginRes.json();
    token = data.data.token;
    userId = data.data.user.id;
  } else {
    const registerRes = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(E2E_USER),
    });

    if (!registerRes.ok) {
      throw new Error(
        `Failed to authenticate E2E user (login=${loginRes.status}, register=${registerRes.status})`,
      );
    }

    const data = await registerRes.json();
    token = data.data.token;
    userId = data.data.user.id;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(FRONTEND_URL);
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    {
      token,
      user: { id: userId, name: E2E_USER.name, email: E2E_USER.email },
    },
  );

  await context.storageState({ path: AUTH_FILE });
  await browser.close();

  console.log("[global-setup] Auth fixture ready.");
}

export default globalSetup;
