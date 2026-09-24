import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import { createCategory, createTransaction } from "./helpers/factory.js";
import prisma from "../src/prisma/client.js";

describe("Categories", () => {
  const app = createApp();

  it("should list all categories for a user", async () => {
    const { agent, user } = await loginAs(app, "google");
    await createCategory(user.id, "Groceries");
    await createCategory(user.id, "Utilities");

    const res = await agent.get("/api/categories").expect(200);

    expect(res.body).toHaveLength(3); // Uncategorized + 2 custom
    expect(res.body.some((c: { name: string }) => c.name === "Uncategorized")).toBe(true);
    expect(res.body.some((c: { name: string }) => c.name === "Groceries")).toBe(true);
  });

  it("should create a new category", async () => {
    const { agent, user } = await loginAs(app, "google");

    const res = await agent
      .post("/api/categories")
      .send({ name: "Entertainment" })
      .expect(201);

    expect(res.body.name).toBe("Entertainment");
    expect(res.body.userId).toBe(user.id);
  });

  it("should prevent duplicate category names", async () => {
    const { agent } = await loginAs(app, "google");

    await agent
      .post("/api/categories")
      .send({ name: "Food" })
      .expect(201);

    const res = await agent
      .post("/api/categories")
      .send({ name: "Food" })
      .expect(409);

    expect(res.body.error).toContain("already exists");
  });

  it("should rename a category", async () => {
    const { agent, user } = await loginAs(app, "google");
    const category = await createCategory(user.id, "OldName");

    const res = await agent
      .patch(`/api/categories/${category.id}`)
      .send({ name: "NewName" })
      .expect(200);

    expect(res.body.name).toBe("NewName");
  });

  it("should prevent renaming Uncategorized", async () => {
    const { agent, user } = await loginAs(app, "google");
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await agent
      .patch(`/api/categories/${uncategorized!.id}`)
      .send({ name: "Renamed" })
      .expect(400);
  });

  it("should delete a category and reassign transactions", async () => {
    const { agent, user } = await loginAs(app, "google");
    const category = await createCategory(user.id, "ToDelete");
    const txn = await createTransaction(user.id, category.id);
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await agent
      .delete(`/api/categories/${category.id}`)
      .expect(204);

    // Verify transaction was moved
    const updated = await prisma.transaction.findUnique({ where: { id: txn.id } });
    expect(updated?.categoryId).toBe(uncategorized!.id);
  });

  it("should prevent deleting Uncategorized", async () => {
    const { agent, user } = await loginAs(app, "google");
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await agent
      .delete(`/api/categories/${uncategorized!.id}`)
      .expect(400);
  });

  it("should replace a category with PUT", async () => {
    const { agent, user } = await loginAs(app, "google");
    const category = await createCategory(user.id, "OldName");

    const res = await agent
      .put(`/api/categories/${category.id}`)
      .send({ name: "NewName" })
      .expect(200);

    expect(res.body.name).toBe("NewName");
  });

  it("should return 404 for PUT on non-existent category", async () => {
    const { agent } = await loginAs(app, "google");

    await agent
      .put("/api/categories/non-existent-id")
      .send({ name: "NewName" })
      .expect(404);
  });

  it("should return 404 for PUT on another user's category", async () => {
    const { user: user1 } = await loginAs(app, "google");
    const { agent: agent2 } = await loginAs(app, "google");
    const category = await createCategory(user1.id, "MyCategory");

    await agent2
      .put(`/api/categories/${category.id}`)
      .send({ name: "Stolen" })
      .expect(404);
  });

  it("should prevent PUT rename of Uncategorized", async () => {
    const { agent, user } = await loginAs(app, "google");
    const uncategorized = await prisma.category.findFirst({
      where: { userId: user.id, isDefault: true },
    });

    await agent
      .put(`/api/categories/${uncategorized!.id}`)
      .send({ name: "Renamed" })
      .expect(400);
  });

  it("should prevent duplicate names with PUT", async () => {
    const { agent, user } = await loginAs(app, "google");
    const cat1 = await createCategory(user.id, "Category1");
    await createCategory(user.id, "Category2");

    await agent
      .put(`/api/categories/${cat1.id}`)
      .send({ name: "Category2" })
      .expect(409);
  });
});
