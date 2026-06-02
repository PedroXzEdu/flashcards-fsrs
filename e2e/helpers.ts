import { join } from "path";

let counter = Date.now();

export function uniqueUser() {
  const id = counter++;
  return {
    name: `Test User ${id}`,
    email: `test${id}@example.com`,
    password: "Senha123!",
  };
}

export function sampleApkgPath() {
  return join(__dirname, "fixtures", "sample.apkg");
}
