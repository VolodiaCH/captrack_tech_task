import request from "supertest";
import { Express } from "express";
import { signToken } from "../../src/auth/jwt.js";
import { FakeOAuthProvider } from "../../src/auth/providers/fake.js";
import { OAuthProfile } from "../../src/auth/providers/types.js";
import { findOrCreateUser } from "../../src/auth/auth.service.js";

export async function loginAs(
  app: Express,
  provider: "google" | "github",
  fakeProfile?: Partial<OAuthProfile>,
) {
  const defaultProfile: OAuthProfile = {
    provider: provider === "google" ? "GOOGLE" : "GITHUB",
    providerUserId: `${provider}-${Math.random()}`,
    displayName: "Test User",
    email: `test-${Math.random()}@example.com`,
    avatarUrl: undefined,
  };

  const profile = { ...defaultProfile, ...fakeProfile };
  const fakeProvider = new FakeOAuthProvider(profile.provider, profile as OAuthProfile);

  // Set up test provider override
  app.locals.testProviders = app.locals.testProviders || {};
  app.locals.testProviders[provider] = fakeProvider;

  // Create user in DB
  const user = await findOrCreateUser(profile as OAuthProfile);

  // Create JWT token
  const token = signToken(user.id);

  // Return agent with cookie
  const agent = request.agent(app);
  agent.set("Cookie", `captrack_session=${token}`);

  return { agent, user, token };
}
