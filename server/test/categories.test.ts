import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import { createCategory, createTransaction } from "./helpers/factory.js";
import prisma from "../src/prisma/client.js";

describe("Categories", () => {
  const app = createApp();

  it("should list all categories for a user", async () => {
    const { user } = await loginAs(app, "google");
    await createCategory(user.id, "Groceries");
    await createCategory(user.id, "Utilities");

    const res = await require("supertest")(app)
      .get("/api/categories")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(200);

    expect(res.body).toHaveLength(3); // Uncategorized + 2 custom
    expect(res.body.some((c: { name: string }) => c.name === "Uncategorized")).toBe(true);
    expect(res.body.some((c: { name: string }) => c.name === "Groceries")).toBe(true);
  });

  it("should create a new category", async () => {
    const { user } = await loginAs(app, "google");

    const res = await require("supertest")(app)
      .post("/api/categories")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({ name: "Entertainment" })
      .expect(201);

    expect(res.body.name).toBe("Entertainment");
    expect(res.body.userId).toBe(user.id);
  });

  it("should prevent duplicate category names", async () => {
    const { user } = await loginAs(app, "google");

    await require("supertest")(app)
      .post("/api/categories")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({ name: "Food" })
      .expect(201);

    const res = await require("supertest")(app)
      .post("/api/categories")
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({ name: "Food" })
      .expect(409);

    expect(res.body.error).toContain("already exists");
  });

  it("should rename a category", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id, "OldName");

    const res = await require("supertest")(app)
      .patch(`/api/categories/${category.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({ name: "NewName" })
      .expect(200);

    expect(res.body.name).toBe("NewName");
  });

  it("should prevent renaming Uncategorized", async () => {
    const { user } = await loginAs(app, "google");
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await require("supertest")(app)
      .patch(`/api/categories/${uncategorized!.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .send({ name: "Renamed" })
      .expect(400);
  });

  it("should delete a category and reassign transactions", async () => {
    const { user } = await loginAs(app, "google");
    const category = await createCategory(user.id, "ToDelete");
    const txn = await createTransaction(user.id, category.id);
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await require("supertest")(app)
      .delete(`/api/categories/${category.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(204);

    // Verify transaction was moved
    const updated = await prisma.transaction.findUnique({ where: { id: txn.id } });
    expect(updated?.categoryId).toBe(uncategorized!.id);
  });

  it("should prevent deleting Uncategorized", async () => {
    const { user } = await loginAs(app, "google");
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await require("supertest")(app)
      .delete(`/api/categories/${uncategorized!.id}`)
      .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
      .expect(400);
  });
});
