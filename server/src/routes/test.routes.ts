import { Router, Request, Response } from "express";
import { setCookie } from "../auth/cookie.js";
import { signToken } from "../auth/jwt.js";
import { findOrCreateUser } from "../auth/auth.service.js";

export const router = Router();

// Test-only endpoint: login without OAuth (gated by NODE_ENV)
router.post("/login", async (req: Request, res: Response) => {
  if (process.env.NODE_ENV === "production") {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { provider, providerUserId, email, displayName } = req.body;

  if (!provider || !providerUserId || !email) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const user = await findOrCreateUser({
      provider,
      providerUserId,
      email,
      displayName: displayName || email,
      avatarUrl: "",
    });

    const token = signToken(user.id);
    setCookie(res, token);

    res.json(user);
  } catch (error) {
    console.error("Test login error:", error);
    res.status(500).json({ error: "Test login failed" });
  }
});

// Health check endpoint
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});
