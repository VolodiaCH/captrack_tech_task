import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import { createCategory, createTransaction, createBudget } from "./helpers/factory.js";

describe("Cross-user Authorization", () => {
  const app = createApp();

  it("should not allow user to see another user's categories", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    const cat1 = await createCategory(user1.id, "User1's Category");

    const res = await require("supertest")(app)
      .get("/api/categories")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(200);

    expect(res.body).toHaveLength(1); // Only Uncategorized for user2
    expect(res.body.some((c: { id: string }) => c.id === cat1.id)).toBe(false);
  });

  it("should not allow user to see another user's transactions", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    const cat1 = await createCategory(user1.id);
    const txn1 = await createTransaction(user1.id, cat1.id);

    const res = await require("supertest")(app)
      .get("/api/transactions")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(200);

    expect(res.body.transactions).toHaveLength(0);
    expect(res.body.transactions.some((t: { id: string }) => t.id === txn1.id)).toBe(false);
  });

  it("should return 404 when accessing another user's transaction", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    const cat1 = await createCategory(user1.id);
    const txn1 = await createTransaction(user1.id, cat1.id);

    await require("supertest")(app)
      .get(`/api/transactions/${txn1.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(404);
  });

  it("should not allow user to delete another user's category", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    const cat1 = await createCategory(user1.id, "User1's Category");

    await require("supertest")(app)
      .delete(`/api/categories/${cat1.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(404);
  });

  it("should not allow user to delete another user's transaction", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    const cat1 = await createCategory(user1.id);
    const txn1 = await createTransaction(user1.id, cat1.id);

    await require("supertest")(app)
      .delete(`/api/transactions/${txn1.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(404);
  });

  it("should not allow user to see another user's budgets", async () => {
    const { user: user1 } = await loginAs(app, "google", { providerUserId: "user1" });
    const { user: user2 } = await loginAs(app, "google", { providerUserId: "user2" });

    await createBudget(user1.id, "2026-09", 1000);

    // User2 tries to access it
    const res = await require("supertest")(app)
      .get("/api/budgets/2026-09")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user2.id)}`)
      .expect(200);

    expect(res.body.hasBudget).toBe(false);
  });
});
