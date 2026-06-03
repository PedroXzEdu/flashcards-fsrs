import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";
import { createUser, createDeck } from "./helpers/factories";

describe("Review Integration", () => {
  let token: string;
  let deckId: number;

  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createUser();
    const loginRes = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password123" });
    token = loginRes.body.data.token;

    const deck = await createDeck(user.id);
    deckId = deck.id;
  });

  afterAll(async () => {
    await closePool();
  });

  it("GET /decks/:id/review returns due cards", async () => {
    await request(app)
      .post(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ front: "Front 1", back: "Back 1" });

    const res = await request(app)
      .get(`/decks/${deckId}/review`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.cards.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data.cards[0].front).toBe("Front 1");
  });

  it("POST /decks/:id/review/:cardId with rating=3 updates FSRS params", async () => {
    const cardRes = await request(app)
      .post(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ front: "Review Front", back: "Review Back" });

    const cardId = cardRes.body.data.id;

    const res = await request(app)
      .post(`/decks/${deckId}/review/${cardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 3 });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.card.stability).toBeGreaterThan(0);
    expect(res.body.data.card.state).not.toBe(0);
    expect(new Date(res.body.data.next_review).getTime()).toBeGreaterThan(
      Date.now(),
    );
  });

  it("POST /decks/:id/review/:cardId with rating=3 creates a review_log row", async () => {
    const cardRes = await request(app)
      .post(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ front: "Log Test", back: "Log Test Back" });

    const cardId = cardRes.body.data.id;

    await request(app)
      .post(`/decks/${deckId}/review/${cardId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 3 });

    const logsRes = await request(app)
      .get("/review-logs")
      .set("Authorization", `Bearer ${token}`);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.data.logs.length).toBeGreaterThanOrEqual(1);
    expect(logsRes.body.data.logs[0].rating).toBe(3);
  });

  it("GET /decks/:id/review/:cardId/preview returns four scheduling options without persisting", async () => {
    const cardRes = await request(app)
      .post(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`)
      .send({ front: "Preview Front", back: "Preview Back" });

    const cardId = cardRes.body.data.id;
    const originalDue = cardRes.body.data.due;

    const res = await request(app)
      .get(`/decks/${deckId}/review/${cardId}/preview`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.again).toBeDefined();
    expect(res.body.data.hard).toBeDefined();
    expect(res.body.data.good).toBeDefined();
    expect(res.body.data.easy).toBeDefined();

    expect(new Date(res.body.data.good.due).getTime()).toBeGreaterThan(
      new Date(res.body.data.again.due).getTime(),
    );

    const cardsRes = await request(app)
      .get(`/decks/${deckId}/cards`)
      .set("Authorization", `Bearer ${token}`);

    const cardAfter = cardsRes.body.data.find(
      (c: { id: number }) => c.id === cardId,
    );
    expect(cardAfter.due).toBe(originalDue);
    expect(cardAfter.reps).toBe(0);
  });
});
