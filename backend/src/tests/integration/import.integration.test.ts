import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";
import { createUser } from "./helpers/factories";
import {
  generateFixtureApkg,
  removeFixtureApkg,
} from "./helpers/generateFixture";

describe("Import Integration", () => {
  let token: string;
  let fixturePath: string;

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

  describe("POST /import with valid .apkg", () => {
    beforeAll(() => {
      fixturePath = generateFixtureApkg([
        { front: "Front 1", back: "Back 1" },
        { front: "Front 2", back: "Back 2" },
      ]);
    });

    afterAll(() => {
      removeFixtureApkg(fixturePath);
    });

    it("deve importar .apkg válido e criar deck + cards", async () => {
      const res = await request(app)
        .post("/import")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", fixturePath);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.imported).toBe(2);
      expect(res.body.data.skipped).toBe(0);
      expect(res.body.data.deck.title).toBe("test");
    });

    it("deve criar os cards no banco", async () => {
      await request(app)
        .post("/import")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", fixturePath);

      const decksRes = await request(app)
        .get("/decks")
        .set("Authorization", `Bearer ${token}`);

      expect(decksRes.body.data).toHaveLength(1);

      const deckId = decksRes.body.data[0].id;
      const cardsRes = await request(app)
        .get(`/decks/${deckId}/cards`)
        .set("Authorization", `Bearer ${token}`);

      expect(cardsRes.body.data.cards).toHaveLength(2);
      expect(cardsRes.body.data.cards[0].front).toBe("Front 1");
      expect(cardsRes.body.data.cards[1].front).toBe("Front 2");
    });
  });

  describe("POST /import with invalid file", () => {
    it("deve retornar 400 quando arquivo não é .apkg", async () => {
      const res = await request(app)
        .post("/import")
        .set("Authorization", `Bearer ${token}`)
        .attach("file", Buffer.from("not a zip file"), "test.exe");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });
  });

  describe("POST /import without file", () => {
    it("deve retornar 400 quando nenhum arquivo é enviado", async () => {
      const res = await request(app)
        .post("/import")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("Nenhum arquivo");
    });
  });

  describe("POST /import sem autenticação", () => {
    it("deve retornar 401", async () => {
      const res = await request(app).post("/import");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
