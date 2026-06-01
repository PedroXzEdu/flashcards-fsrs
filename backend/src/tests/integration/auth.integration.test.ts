import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";

describe("Auth Integration", () => {
  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await closePool();
  });

  describe("POST /auth/register", () => {
    it("creates a user and returns a JWT token", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe("string");
      expect(res.body.data.user.email).toBe("test@test.com");
    });

    it("rejects duplicate email with 400", async () => {
      await request(app).post("/auth/register").send({
        name: "User One",
        email: "dup@test.com",
        password: "password123",
      });

      const res = await request(app).post("/auth/register").send({
        name: "User Two",
        email: "dup@test.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@test.com",
        password: "password123",
      });
    });

    it("returns token for valid credentials", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "test@test.com", password: "password123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(typeof res.body.data.token).toBe("string");
    });

    it("rejects wrong password with 401", async () => {
      const res = await request(app)
        .post("/auth/login")
        .send({ email: "test@test.com", password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });
});
