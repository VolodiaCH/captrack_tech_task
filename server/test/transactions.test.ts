import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import { createCategory, createTransaction } from "./helpers/factory.js";

describe("Transactions", () => {
  const app = createApp();

  it("should list all transactions for a user", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);
    await createTransaction(user.id, category.id);
    await createTransaction(user.id, category.id);

    const res = await require("supertest")(app)
      .get("/api/transactions")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.transactions).toHaveLength(2);
    expect(res.body.total).toBe(2);
  });

  it("should create a transaction with valid data", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);

    const res = await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        title: "Grocery Shopping",
        amount: 45.5,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
        notes: "Weekly groceries",
      })
      .expect(201);

    expect(res.body.title).toBe("Grocery Shopping");
    expect(res.body.amount).toBe("45.5");
    expect(res.body.currency).toBe("USD");
  });

  it("should reject negative amounts", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);

    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        title: "Bad Transaction",
        amount: -10,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      })
      .expect(400);
  });

  it("should reject missing required fields", async () => {
    const { user } = await loginAs(app, "google");

    await require("supertest")(app)
      .post("/api/transactions")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        title: "Incomplete",
        // missing amount, currency, date, categoryId
      })
      .expect(400);
  });

  it("should update a transaction", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);
    const txn = await createTransaction(user.id, category.id, { title: "Original" });

    const res = await require("supertest")(app)
      .put(`/api/transactions/${txn.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        title: "Updated",
        amount: 100,
        currency: "USD",
        date: new Date().toISOString(),
        categoryId: category.id,
      })
      .expect(200);

    expect(res.body.title).toBe("Updated");
    expect(res.body.amount).toBe("100");
  });

  it("should delete a transaction", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);
    const txn = await createTransaction(user.id, category.id);

    await require("supertest")(app)
      .delete(`/api/transactions/${txn.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(204);

    // Verify it's gone
    await require("supertest")(app)
      .get(`/api/transactions/${txn.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(404);
  });

  it("should search transactions by title", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);
    await createTransaction(user.id, category.id, { title: "Coffee" });
    await createTransaction(user.id, category.id, { title: "Lunch" });

    const res = await require("supertest")(app)
      .get("/api/transactions?search=Coffee")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.transactions[0].title).toBe("Coffee");
  });

  it("should filter transactions by category", async () => {
    const { user } = await loginAs(app, "google");
    const cat1 = await createCategory(user.id, "Food");
    const cat2 = await createCategory(user.id, "Gas");
    await createTransaction(user.id, cat1.id);
    await createTransaction(user.id, cat2.id);

    const res = await require("supertest")(app)
      .get(`/api/transactions?categoryId=${cat1.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.transactions[0].categoryId).toBe(cat1.id);
  });

  it("should handle amount range filtering", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id);
    await createTransaction(user.id, category.id, { amount: 10 });
    await createTransaction(user.id, category.id, { amount: 50 });
    await createTransaction(user.id, category.id, { amount: 100 });

    const res = await require("supertest")(app)
      .get("/api/transactions?minAmount=25&maxAmount=75")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.transactions).toHaveLength(1);
    expect(res.body.transactions[0].amount).toBe("50");
  });
});
