import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import { createTransaction, createCategory, createBudget } from "./helpers/factory.js";
import { getYearMonth } from "../src/utils/dateRange.js";

describe("Budgets", () => {
  const app = createApp();

  it("should return hasBudget=false when no budget is set", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();

    const res = await require("supertest")(app)
      .get(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.hasBudget).toBe(false);
    expect(res.body.spent).toBe(0);
  });

  it("should set a budget and return correct calculations", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();

    // Set budget
    const setRes = await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 500,
        currency: "USD",
      })
      .expect(200);

    expect(setRes.body.hasBudget).toBe(true);
    expect(setRes.body.budget).toBe(500);
    expect(setRes.body.spent).toBe(0);
    expect(setRes.body.remaining).toBe(500);
    expect(setRes.body.usagePct).toBe(0);
  });

  it("should calculate spending correctly", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    // Set budget
    await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 100,
        currency: "USD",
      })
      .expect(200);

    // Create transaction
    await createTransaction(user.id, category.id, {
      amount: 35,
      currency: "USD",
      date: new Date(),
    });

    // Check budget
    const res = await require("supertest")(app)
      .get(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.spent).toBe(35);
    expect(res.body.remaining).toBe(65);
    expect(res.body.usagePct).toBe(35);
  });

  it("should calculate usage percentage correctly", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    // Set budget
    await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 200,
        currency: "USD",
      })
      .expect(200);

    // Create transaction for 150
    await createTransaction(user.id, category.id, {
      amount: 150,
      currency: "USD",
    });

    const res = await require("supertest")(app)
      .get(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body.usagePct).toBe(75);
  });

  it("should only count transactions in matching currency", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();
    const category = await createCategory(user.id);

    // Set budget in USD
    await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 100,
        currency: "USD",
      })
      .expect(200);

    // Create USD transaction
    await createTransaction(user.id, category.id, {
      amount: 40,
      currency: "USD",
    });

    // Create EUR transaction (should not count)
    await createTransaction(user.id, category.id, {
      amount: 100,
      currency: "EUR",
    });

    const res = await require("supertest")(app)
      .get(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    // Should only count USD transaction
    expect(res.body.spent).toBe(40);
    expect(res.body.usagePct).toBe(40);
  });

  it("should update an existing budget", async () => {
    const { user } = await loginAs(app, "google");
    const yearMonth = getYearMonth();

    // Set initial budget
    await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 200,
        currency: "USD",
      })
      .expect(200);

    // Update budget
    const updateRes = await require("supertest")(app)
      .put(`/api/budgets/${yearMonth}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({
        amount: 500,
        currency: "USD",
      })
      .expect(200);

    expect(updateRes.body.budget).toBe(500);
  });
});
