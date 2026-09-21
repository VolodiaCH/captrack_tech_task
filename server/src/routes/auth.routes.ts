import { Router, Request, Response } from "express";
import { randomBytes } from "crypto";
import { serialize } from "cookie";
import { loadEnv } from "../config/env.js";
import { getProvider } from "../auth/providers/index.js";
import { setCookie, clearCookie } from "../auth/cookie.js";
import { signToken } from "../auth/jwt.js";
import { findOrCreateUser } from "../auth/auth.service.js";
import { requireAuth } from "../auth/middleware.js";

export const router = Router();
const env = loadEnv();

// In-memory state storage for CSRF (short-lived, demo-only)
const stateStore = new Map<string, { provider: string; expiry: number }>();

router.get("/google", (req: Request, res: Response) => {
  const state = randomBytes(32).toString("hex");
  stateStore.set(state, { provider: "google", expiry: Date.now() + 10 * 60 * 1000 });

  const provider = getProvider("google", req.app.locals.testProviders?.google);
  const url = provider.getAuthorizationUrl(state);

  res.setHeader(
    "Set-Cookie",
    serialize("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    }),
  );
  res.redirect(url);
});

router.get("/github", (req: Request, res: Response) => {
  const state = randomBytes(32).toString("hex");
  stateStore.set(state, { provider: "github", expiry: Date.now() + 10 * 60 * 1000 });

  const provider = getProvider("github", req.app.locals.testProviders?.github);
  const url = provider.getAuthorizationUrl(state);

  res.setHeader(
    "Set-Cookie",
    serialize("oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 10 * 60,
      path: "/",
    }),
  );
  res.redirect(url);
});

router.get("/callback/google", async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state || typeof code !== "string" || typeof state !== "string") {
    res.status(400).json({ error: "Missing code or state" });
    return;
  }

  const stateData = stateStore.get(state);
  if (!stateData || stateData.provider !== "google" || stateData.expiry < Date.now()) {
    res.status(400).json({ error: "Invalid or expired state" });
    return;
  }

  stateStore.delete(state);

  try {
    const provider = getProvider("google", req.app.locals.testProviders?.google);
    const accessToken = await provider.exchangeCodeForToken(code);
    const profile = await provider.fetchProfile(accessToken);

    const user = await findOrCreateUser(profile);
    const token = signToken(user.id);

    setCookie(res, token);
    res.redirect(env.CLIENT_ORIGIN);
  } catch (error) {
    console.error("Google callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.get("/callback/github", async (req: Request, res: Response) => {
  const { code, state } = req.query;

  if (!code || !state || typeof code !== "string" || typeof state !== "string") {
    res.status(400).json({ error: "Missing code or state" });
    return;
  }

  const stateData = stateStore.get(state);
  if (!stateData || stateData.provider !== "github" || stateData.expiry < Date.now()) {
    res.status(400).json({ error: "Invalid or expired state" });
    return;
  }

  stateStore.delete(state);

  try {
    const provider = getProvider("github", req.app.locals.testProviders?.github);
    const accessToken = await provider.exchangeCodeForToken(code);
    const profile = await provider.fetchProfile(accessToken);

    const user = await findOrCreateUser(profile);
    const token = signToken(user.id);

    setCookie(res, token);
    res.redirect(env.CLIENT_ORIGIN);
  } catch (error) {
    console.error("GitHub callback error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/logout", (req: Request, res: Response) => {
  clearCookie(res);
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req: Request, res: Response) => {
  const user = await require("../prisma/client.js").default.user.findUnique({
    where: { id: req.user!.userId },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});
