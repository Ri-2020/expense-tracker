/**
 * CONTENTS:
 * - POST /expenses  tests  (create, validation, idempotency)
 * - GET  /expenses  tests  (list, category filter, total)
 * - GET  /expenses/summary tests
 *
 * Requires the Firestore emulator.
 * Run via deploy.sh, or manually:
 *   firebase emulators:exec --only firestore "npm --prefix backend test"
 */

// Must be set before firebase-admin initializes (module cache means order matters)
process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
process.env.GCLOUD_PROJECT = "notesa";

const request = require("supertest");
const { startServer } = require("../src/server");

let server;

async function clearFirestore() {
  const url = `http://${process.env.FIRESTORE_EMULATOR_HOST}/emulator/v1/projects/${process.env.GCLOUD_PROJECT}/databases/(default)/documents`;
  await fetch(url, { method: "DELETE" }).catch(() => {});
}

beforeAll(() => {
  server = startServer(0);
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(async () => {
  await clearFirestore();
});

describe("POST /expenses", () => {
  it("creates a valid expense", async () => {
    const res = await request(server)
      .post("/expenses")
      .send({ amount: "250.50", category: "Food", description: "Lunch", date: "2024-04-01" });

    expect(res.status).toBe(201);
    expect(res.body.amount).toBe("250.50");
    expect(res.body.category).toBe("Food");
    expect(res.body.id).toBeDefined();
    expect(res.body.created_at).toBeDefined();
  });

  it("rejects negative amount", async () => {
    const res = await request(server)
      .post("/expenses")
      .send({ amount: "-10", category: "Food", description: "x", date: "2024-04-01" });
    expect(res.status).toBe(400);
  });

  it("rejects missing date", async () => {
    const res = await request(server)
      .post("/expenses")
      .send({ amount: "100", category: "Food", description: "x" });
    expect(res.status).toBe(400);
  });

  it("is idempotent with Idempotency-Key", async () => {
    const key = "test-idem-key-123";
    const payload = { amount: "99.00", category: "Travel", description: "Bus", date: "2024-04-02" };

    const first = await request(server).post("/expenses").set("Idempotency-Key", key).send(payload);
    const second = await request(server).post("/expenses").set("Idempotency-Key", key).send(payload);

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(first.body.id).toBe(second.body.id);
  });
});

describe("GET /expenses", () => {
  it("returns list with total", async () => {
    await request(server)
      .post("/expenses")
      .send({ amount: "250.50", category: "Food", description: "Lunch", date: "2024-04-01" });

    const res = await request(server).get("/expenses");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.expenses)).toBe(true);
    expect(typeof res.body.total).toBe("string");
  });

  it("filters by category (case-insensitive)", async () => {
    await request(server)
      .post("/expenses")
      .send({ amount: "50.00", category: "Utilities", description: "Electric", date: "2024-04-03" });

    const res = await request(server).get("/expenses?category=utilities");
    expect(res.status).toBe(200);
    res.body.expenses.forEach((e) => expect(e.category.toLowerCase()).toBe("utilities"));
  });
});

describe("GET /expenses/summary", () => {
  it("returns category totals", async () => {
    await request(server)
      .post("/expenses")
      .send({ amount: "100.00", category: "Food", description: "Dinner", date: "2024-04-01" });

    const res = await request(server).get("/expenses/summary");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length) {
      expect(res.body[0].category).toBeDefined();
      expect(res.body[0].total).toBeDefined();
    }
  });
});
