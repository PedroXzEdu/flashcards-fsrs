import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { runMigrations, cleanDatabase, closePool } from "./helpers/db";
import { createUser } from "./helpers/factories";

describe("Decks Integration", () => {
  let token: string;

  beforeAll(async () => {
    await runMigrations();
  });

  beforeEach(async () => {
    await cleanDatabase();
    const user = await createUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "password123" });
    token = res.body.data.token;
  });

  afterAll(async () => {
    await closePool();
  });

  it("POST /decks creates a deck (authenticated)", async () => {
    const res = await request(app)
      .post("/decks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Deck", description: "A test deck" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My Deck");
    expect(res.body.data.user_id).toBeGreaterThan(0);
  });

  it("GET /decks returns only the authenticated user's decks", async () => {
    await request(app)
      .post("/decks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Deck 1" });

    const res = await request(app)
      .get("/decks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe("Deck 1");
  });

  it("PUT /decks/:id updates the deck", async () => {
    const createRes = await request(app)
      .post("/decks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Original Title" });

    const deckId = createRes.body.data.id;

    const res = await request(app)
      .put(`/decks/${deckId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
  });

  it("DELETE /decks/:id removes it", async () => {
    const createRes = await request(app)
      .post("/decks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "To Delete" });

    const deckId = createRes.body.data.id;

    const delRes = await request(app)
      .delete(`/decks/${deckId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(204);

    const getRes = await request(app)
      .get("/decks")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.body.data.length).toBe(0);
  });

  it("unauthenticated requests return 401", async () => {
    const res = await request(app).get("/decks");
    expect(res.status).toBe(401);
  });
});
