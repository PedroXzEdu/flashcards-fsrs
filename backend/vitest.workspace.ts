import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  {
    test: {
      name: "unit",
      globals: true,
      environment: "node",
      include: ["src/**/*.test.ts"],
      exclude: ["node_modules", "dist", "src/tests/integration/**/*.test.ts"],
    },
  },
  {
    test: {
      name: "integration",
      globals: true,
      environment: "node",
      include: ["src/tests/integration/**/*.test.ts"],
      pool: "forks",
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      dotenv: ".env.test",
    },
  },
]);
