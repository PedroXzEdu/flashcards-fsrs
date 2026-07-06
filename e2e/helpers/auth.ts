import { test as base } from "@playwright/test";
import { resolve } from "path";

const AUTH_FILE = resolve(__dirname, "..", ".auth", "user.json");

export const authTest = base.extend({
  contextOptions: {
    storageState: AUTH_FILE,
  },
});
