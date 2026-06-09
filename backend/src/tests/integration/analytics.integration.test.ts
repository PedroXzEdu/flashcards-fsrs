import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";
import { createUser } from "./helpers/factories";

describe("Analytics Integration", () => {
  let token: string;
  let deckId: number;

  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await cleanDatabase();
    await createUser();
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password123" });
    token = loginRes.body.data.token;

    const deckRes = await request(app)
      .post("/decks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Analytics Deck" });
    deckId = deckRes.body.data.id;
  });

  afterAll(async () => {
    await closePool();
  });

  async function createCard(front: string, back: string) {
    const res = await request(app)
      .post(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ front, back });
    return res.body.data.id;
  }

  async function reviewCard(cardId: number, rating: number) {
    await request(app)
      .post(`/decks/${deckId}/review/${cardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating });
  }

  describe("GET /analytics/retention-rate", () => {
    it("deve retornar dados vazios quando não há revisões", async () => {
      const res = await request(app)
        .get("/analytics/retention-rate")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.total_reviews).toBe("0");
    });

    it("deve retornar taxa de retenção após revisões", async () => {
      const card1 = await createCard("Front 1", "Back 1");
      const card2 = await createCard("Front 2", "Back 2");
      const card3 = await createCard("Front 3", "Back 3");

      await reviewCard(card1, 3);
      await reviewCard(card2, 3);
      await reviewCard(card3, 1);

      const res = await request(app)
        .get("/analytics/retention-rate")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_reviews).toBe("3");
      expect(res.body.data.successful_reviews).toBe("2");
      expect(res.body.data.retention_rate).toBe("66.67");
    });

    it("deve aceitar parâmetro months", async () => {
      const res = await request(app)
        .get("/analytics/retention-rate?months=3")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe("GET /analytics/review-heatmap", () => {
    it("deve retornar array vazio quando não há revisões", async () => {
      const res = await request(app)
        .get("/analytics/review-heatmap")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("deve retornar dados do heatmap após revisões", async () => {
      const card1 = await createCard("Front 1", "Back 1");
      const card2 = await createCard("Front 2", "Back 2");

      await reviewCard(card1, 3);
      await reviewCard(card2, 1);

      const res = await request(app)
        .get("/analytics/review-heatmap")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty("day");
      expect(res.body.data[0]).toHaveProperty("reviews");
    });
  });

  describe("GET /analytics/forgetting-curve", () => {
    it("deve retornar curva com fallback quando não há cards", async () => {
      const res = await request(app)
        .get("/analytics/forgetting-curve")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stability).toBe(1);
      expect(res.body.data.curve).toHaveLength(8);
      expect(res.body.data.curve[0].retention).toBe(100);
    });

    it("deve retornar curva baseada na estabilidade dos cards", async () => {
      await createCard("Card 1", "Back 1");
      await createCard("Card 2", "Back 2");

      const card1Id = await createCard("Card 3", "Back 3");
      await reviewCard(card1Id, 3);

      const res = await request(app)
        .get("/analytics/forgetting-curve")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.stability).toBe("number");
      expect(res.body.data.curve).toHaveLength(8);
      for (const point of res.body.data.curve) {
        expect(point).toHaveProperty("day");
        expect(point).toHaveProperty("retention");
        expect(point.retention).toBeGreaterThanOrEqual(0);
        expect(point.retention).toBeLessThanOrEqual(100);
      }
    });
  });

  describe("GET /analytics/workload-forecast", () => {
    it("deve retornar array com previsão de carga", async () => {
      await createCard("Card 1", "Back 1");
      await createCard("Card 2", "Back 2");

      const res = await request(app)
        .get("/analytics/workload-forecast")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("deve aceitar parâmetro days=7", async () => {
      const res = await request(app)
        .get("/analytics/workload-forecast?days=7")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("deve retornar dados com formato esperado", async () => {
      await createCard("Card 1", "Back 1");
      await createCard("Card 2", "Back 2");

      const res = await request(app)
        .get("/analytics/workload-forecast?days=14")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0]).toHaveProperty("day");
      expect(res.body.data[0]).toHaveProperty("review_cards");
      expect(res.body.data[0]).toHaveProperty("new_cards");
    });
  });
});
