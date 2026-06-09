import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";
import { createUser } from "./helpers/factories";

describe("Security Integration", () => {
  let token: string;

  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await cleanDatabase();
    await createUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password123" });
    token = res.body.data.token;
  });

  afterAll(async () => {
    await closePool();
  });

  describe("SQL Injection", () => {
    it("deve inserir título com SQL injection literalmente", async () => {
      const payload = "Deck'; DROP TABLE cards; --";
      const res = await request(app)
        .post("/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: payload });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe(payload);

      // Verify cards table still exists (not dropped)
      const decksRes = await request(app)
        .get("/decks")
        .set("Authorization", `Bearer ${token}`);
      expect(decksRes.body.data).toHaveLength(1);
    });

    it("deve inserir front/back com SQL injection literalmente", async () => {
      const deckRes = await request(app)
        .post("/decks")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Safe Deck" });
      const deckId = deckRes.body.data.id;

      const payload = "Front'; DELETE FROM decks; --";
      const res = await request(app)
        .post(`/decks/${deckId}/cards`)
        .set("Authorization", `Bearer ${token}`)
        .send({ front: payload, back: "Safe Back" });

      expect(res.status).toBe(201);
      expect(res.body.data.front).toBe(payload);

      // Verify decks still exist
      const decksRes = await request(app)
        .get("/decks")
        .set("Authorization", `Bearer ${token}`);
      expect(decksRes.body.data).toHaveLength(1);
    });
  });

  describe("JWT inválido", () => {
    it("deve retornar 401 sem token", async () => {
      const res = await request(app).get("/decks");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("deve retornar 401 com token malformado", async () => {
      const res = await request(app)
        .get("/decks")
        .set("Authorization", "Bearer token-invalido");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("deve retornar 401 com header sem Bearer", async () => {
      const res = await request(app)
        .get("/decks")
        .set("Authorization", "TokenInvalido");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("CORS", () => {
    it("deve permitir origens autorizadas", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:5173");

      expect(res.headers["access-control-allow-origin"]).toBe(
        "http://localhost:5173",
      );
    });

    it("deve bloquear origens não autorizadas", async () => {
      const res = await request(app)
        .get("/health")
        .set("Origin", "https://evil.com");

      expect(res.headers["access-control-allow-origin"]).toBeUndefined();
    });
  });
});
