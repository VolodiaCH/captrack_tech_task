import { OAuthProvider, OAuthProfile } from "./types.js";
import { loadEnv } from "../../config/env.js";

const env = loadEnv();

export class GitHubOAuthProvider implements OAuthProvider {
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID,
      redirect_uri: `${env.OAUTH_REDIRECT_BASE_URL}/api/auth/callback/github`,
      scope: "user:email",
      state,
    });
    return `https://github.com/login/oauth/authorize?${params}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        code,
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        redirect_uri: `${env.OAUTH_REDIRECT_BASE_URL}/api/auth/callback/github`,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  async fetchProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub profile");
    }

    const data = (await response.json()) as {
      id: number;
      login: string;
      name: string | null;
      avatar_url?: string;
      email?: string;
    };

    return {
      provider: "GITHUB",
      providerUserId: String(data.id),
      email: data.email,
      displayName: data.name || data.login,
      avatarUrl: data.avatar_url,
    };
  }
}
