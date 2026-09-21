import { describe, it, expect } from "vitest";
import { createApp } from "../src/app.js";
import { loginAs } from "./helpers/auth.js";
import prisma from "../src/prisma/client.js";

describe("Auth", () => {
  const app = createApp();

  describe("Google OAuth", () => {
    it("should create a new user on first login", async () => {
      const { user } = await loginAs(app, "google");
      expect(user).toBeDefined();
      expect(user.provider).toBe("GOOGLE");
      expect(user.displayName).toBe("Test User");
    });

    it("should create Uncategorized category on first login", async () => {
      const { user } = await loginAs(app, "google");
      const category = await prisma.category.findFirst({
        where: { userId: user.id, isDefault: true },
      });
      expect(category).toBeDefined();
      expect(category?.name).toBe("Uncategorized");
    });

    it("should not duplicate user on repeated login", async () => {
      const profile = {
        providerUserId: "google-unique-123",
        email: "test@example.com",
      };
      const { user: user1 } = await loginAs(app, "google", profile);
      const { user: user2 } = await loginAs(app, "google", profile);
      expect(user1.id).toBe(user2.id);
    });

    it("should return 401 for unauthenticated request", async () => {
      const res = await require("supertest")(app)
        .get("/api/auth/me")
        .expect(401);
      expect(res.body.error).toBe("Unauthorized");
    });

    it("should return user for authenticated request", async () => {
      const { user } = await loginAs(app, "google");
      const res = await require("supertest")(app)
        .get("/api/auth/me")
        .set("Cookie", `captrack_session=${require("../src/auth/jwt.js").signToken(user.id)}`)
        .expect(200);
      expect(res.body.id).toBe(user.id);
      expect(res.body.displayName).toBe("Test User");
    });
  });

  describe("GitHub OAuth", () => {
    it("should create a new user on first login", async () => {
      const { user } = await loginAs(app, "github");
      expect(user).toBeDefined();
      expect(user.provider).toBe("GITHUB");
    });

    it("should not duplicate user on repeated login", async () => {
      const profile = {
        providerUserId: "github-unique-456",
        displayName: "GitHub User",
      };
      const { user: user1 } = await loginAs(app, "github", profile);
      const { user: user2 } = await loginAs(app, "github", profile);
      expect(user1.id).toBe(user2.id);
    });
  });
});
