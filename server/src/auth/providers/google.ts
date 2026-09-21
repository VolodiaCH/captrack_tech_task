import { OAuthProvider, OAuthProfile } from "./types.js";
import { loadEnv } from "../../config/env.js";

const env = loadEnv();

export class GoogleOAuthProvider implements OAuthProvider {
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: `${env.OAUTH_REDIRECT_BASE_URL}/api/auth/callback/google`,
      response_type: "code",
      scope: "openid profile email",
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE_URL}/api/auth/callback/google`,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch Google profile");
    }

    const data = (await response.json()) as {
      sub: string;
      email?: string;
      name: string;
      picture?: string;
    };

    return {
      provider: "GOOGLE",
      providerUserId: data.sub,
      email: data.email,
      displayName: data.name,
      avatarUrl: data.picture,
    };
  }
}
